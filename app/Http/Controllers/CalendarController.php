<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Project;
use App\Models\Workspace;
use Carbon\Carbon;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    public function index()
    {
        return redirect()->route('projects.index');
    }

    /**
     * @return array<string, mixed>
     */
    public function payload(Request $request, ?Project $project = null): array
    {
        $workspaceId = $project?->workspace_id ?? auth()->user()->current_workspace_id;

        $date = $request->filled('date')
            ? Carbon::parse($request->date)->startOfDay()
            : Carbon::today();

        $view = in_array($request->get('view'), ['month', 'week', 'agenda'], true)
            ? $request->get('view')
            : 'week';

        $events = Event::query()
            ->where('workspace_id', $workspaceId)
            ->when($project, fn ($query) => $query->where('project_id', $project->id));

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

        $dueDateCards = $project
            ? $project->tasks()
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
                ])
            : collect();

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

        $members = $project
            ? $project->users()->select(['users.id', 'users.name', 'users.email'])->get()
            : Workspace::find($workspaceId)?->users()->select(['users.id', 'users.name', 'users.email'])->get();

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
