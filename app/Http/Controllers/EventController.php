<?php

namespace App\Http\Controllers;

use App\Http\Requests\EventCreateRequest;
use App\Models\Event;

class EventController extends Controller
{
    public function store(EventCreateRequest $request)
    {
        $validated = $request->validated();

        $attendees = $validated['attendees'] ?? [];
        unset($validated['attendees']);

        $event = Event::create($validated);

        if (!empty($attendees)) {
            $event->attendees()->attach($attendees);
        }

        return redirect()->route('calendar.index')->with('success', 'Event created successfully');
    }

    public function update(EventCreateRequest $request, Event $event)
    {
        $validated = $request->validated();

        $attendees = $validated['attendees'] ?? [];
        unset($validated['attendees']);

        $validated['updated_by'] = auth()->id();
        $event->update($validated);

        $event->attendees()->sync($attendees);

        return redirect()->route('calendar.index')->with('success', 'Event updated successfully');
    }

    public function destroy(Event $event)
    {
        $event->attendees()->detach();
        $event->delete();

        return redirect()->route('calendar.index')->with('success', 'Event deleted successfully');
    }
}
