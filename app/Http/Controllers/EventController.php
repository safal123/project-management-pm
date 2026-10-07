<?php

namespace App\Http\Controllers;

use App\Http\Requests\EventCreateRequest;
use App\Models\Activity;
use App\Models\Event;
use Illuminate\Http\RedirectResponse;

class EventController extends Controller
{
    public function store(EventCreateRequest $request)
    {
        $validated = $request->validated();

        $attendees = $validated['attendees'] ?? [];
        unset($validated['attendees']);

        $event = Event::create($validated);

        if (! empty($attendees)) {
            $event->attendees()->attach($attendees);
        }

        Activity::record($event, Activity::TYPE_CREATED, $event->workspace_id, $request->user());

        return $this->redirectToProjectCalendar($event);
    }

    public function update(EventCreateRequest $request, Event $event)
    {
        $validated = $request->validated();

        $attendees = $validated['attendees'] ?? [];
        unset($validated['attendees']);

        $validated['updated_by'] = auth()->id();

        $originalStartDate = $event->start_date;
        $originalEndDate = $event->end_date;

        $event->update($validated);

        $event->attendees()->sync($attendees);

        $startDateChanged = array_key_exists('start_date', $validated)
            && (string) $originalStartDate !== (string) $event->start_date;
        $endDateChanged = array_key_exists('end_date', $validated)
            && (string) $originalEndDate !== (string) $event->end_date;

        if ($startDateChanged || $endDateChanged) {
            Activity::record($event, Activity::TYPE_MOVED, $event->workspace_id, $request->user(), [
                'from' => $originalStartDate,
                'to' => $event->start_date,
            ]);
        }

        return $this->redirectToProjectCalendar($event);
    }

    public function toggleComplete(Event $event)
    {
        $event->update([
            'completed_at' => $event->completed_at ? null : now(),
        ]);

        Activity::record($event, Activity::TYPE_COMPLETED, $event->workspace_id, auth()->user(), [
            'completed' => (bool) $event->completed_at,
        ]);

        return redirect()->back()->with('success',
            $event->completed_at ? 'Event marked as completed' : 'Event marked as incomplete'
        );
    }

    public function destroy(Event $event)
    {
        $project = $event->project;
        $event->attendees()->detach();
        $event->delete();

        if ($project) {
            return redirect()
                ->route('projects.show', ['project' => $project->slug, 'tab' => 'calendar'])
                ->with('success', 'Event deleted successfully');
        }

        return redirect()->route('projects.index')->with('success', 'Event deleted successfully');
    }

    private function redirectToProjectCalendar(Event $event): RedirectResponse
    {
        $project = $event->project ?? $event->project()->first();

        if ($project) {
            return redirect()
                ->route('projects.show', ['project' => $project->slug, 'tab' => 'calendar'])
                ->with('success', 'Event saved successfully');
        }

        return redirect()->route('projects.index')->with('success', 'Event saved successfully');
    }
}
