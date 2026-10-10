<?php

namespace App\Actions\Calendar;

use App\Models\Event;
use App\Models\Project;
use Carbon\Carbon;

class GetProjectCalendar
{
    /**
     * @return array<string, mixed>
     */
    public function execute(Project $project, ?string $date = null, ?string $view = null): array
    {
        $date = filled($date)
            ? Carbon::parse($date)->startOfDay()
            : Carbon::today();

        $view = in_array($view, ['month', 'week', 'agenda'], true)
            ? $view
            : 'week';

        $events = Event::query()
            ->where('workspace_id', $project->workspace_id)
            ->where('project_id', $project->id);

        $monthStart = $date->copy()->startOfMonth()->startOfDay();
        $monthEnd = $date->copy()->endOfMonth()->endOfDay();
        $weekStart = $date->copy()->startOfWeek(Carbon::MONDAY);
        $weekEnd = $date->copy()->endOfWeek(Carbon::SUNDAY);
        $rangeStart = $monthStart->lt($weekStart) ? $monthStart : $weekStart;
        $rangeEnd = $monthEnd->gt($weekEnd) ? $monthEnd : $weekEnd;

        $calendarEvents = (clone $events)
            ->with('attendees')
            ->whereBetween('start_date', [$rangeStart, $rangeEnd])
            ->orderBy('start_date')
            ->get()
            ->map(fn ($e) => [
                'id' => $e->id,
                'title' => $e->title,
                'type' => $e->type,
                'start_date' => $e->start_date->format('Y-m-d H:i:s'),
                'end_date' => $e->end_date?->format('Y-m-d H:i:s'),
                'date_key' => $e->start_date->format('Y-m-d'),
                'completed_at' => $e->completed_at?->format('Y-m-d H:i:s'),
                'description' => $e->description,
                'location' => $e->location,
                'attendees' => $e->attendees->map(fn ($user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'avatar' => $user->profile_picture?->url ?? null,
                ]),
            ]);

        [$from, $to] = match ($view) {
            'week' => [$weekStart, $weekEnd],
            default => [$monthStart, $monthEnd],
        };

        $dueDateCards = $project->tasks()
            ->whereNotNull('due_date')
            ->orderBy('due_date')
            ->get(['id', 'title', 'due_date', 'status', 'slug'])
            ->map(fn ($task) => [
                'id' => $task->id,
                'title' => $task->title,
                'due_date' => $task->due_date?->format('Y-m-d H:i:s'),
                'date_key' => $task->due_date?->format('Y-m-d'),
                'status' => $task->status,
                'slug' => $task->slug,
            ]);

        $tableEvents = (clone $events)
            ->with('attendees')
            ->whereBetween('start_date', [$from, $to])
            ->orderBy('start_date')
            ->paginate(5)
            ->withQueryString()
            ->through(fn ($event) => [
                'id' => $event->id,
                'title' => $event->title,
                'type' => $event->type,
                'start_date' => $event->start_date?->format('Y-m-d H:i:s'),
                'end_date' => $event->end_date?->format('Y-m-d H:i:s'),
                'location' => $event->location,
                'description' => $event->description,
                'completed_at' => $event->completed_at?->format('Y-m-d H:i:s'),
                'attendees' => $event->attendees->map(fn ($user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'avatar' => $user->profile_picture?->url ?? null,
                ]),
            ]);

        $members = $project->workspace
            ?->users()
            ->with('media')
            ->orderBy('users.name')
            ->get(['users.id', 'users.name', 'users.email']);

        return [
            'calendarEvents' => $calendarEvents,
            'tableEvents' => $tableEvents,
            'dueDateCards' => $dueDateCards,
            'members' => $members ?? collect(),
            'filters' => [
                'view' => $view,
                'date' => $date->toDateString(),
            ],
        ];
    }
}
