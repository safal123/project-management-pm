<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Workspace;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CalendarController extends Controller
{
    public function index(Request $request)
    {
        $workspaceId = auth()->user()->current_workspace_id;

        // Anchor date — drives both grid and table (defaults to today)
        $date = $request->filled('date')
            ? Carbon::parse($request->date)->startOfDay()
            : Carbon::today();

        $view = $request->get('view', 'month');

        // ── Calendar grid: lightweight markers for the full displayed month ──
        $calendarEvents = Event::query()
            ->where('workspace_id', $workspaceId)
            ->whereBetween('start_date', [
                $date->copy()->startOfMonth()->startOfDay(),
                $date->copy()->endOfMonth()->endOfDay(),
            ])
            ->select(['id', 'title', 'type', 'start_date', 'completed_at'])
            ->orderBy('start_date')
            ->get()
            ->map(fn($e) => [
                'id'           => $e->id,
                'title'        => $e->title,
                'type'         => $e->type,
                'start_date'   => $e->start_date->format('Y-m-d H:i:s'),
                'date_key'     => $e->start_date->format('Y-m-d'),
                'completed_at' => $e->completed_at?->format('Y-m-d H:i:s'),
            ]);

        // ── Table: full data, paginated, filtered by view ──
        [$from, $to] = match ($view) {
            'day'   => [$date->copy()->startOfDay(),   $date->copy()->endOfDay()],
            'week'  => [$date->copy()->startOfWeek(Carbon::SUNDAY), $date->copy()->endOfWeek(Carbon::SATURDAY)],
            default => [$date->copy()->startOfMonth()->startOfDay(), $date->copy()->endOfMonth()->endOfDay()],
        };

        $tableEvents = Event::with('attendees')
            ->where('workspace_id', $workspaceId)
            ->whereBetween('start_date', [$from, $to])
            ->orderBy('start_date')
            ->paginate(5)
            ->withQueryString()
            ->through(fn($event) => [
                'id'           => $event->id,
                'title'        => $event->title,
                'type'         => $event->type,
                'start_date'   => $event->start_date?->format('Y-m-d H:i:s'),
                'end_date'     => $event->end_date?->format('Y-m-d H:i:s'),
                'location'     => $event->location,
                'description'  => $event->description,
                'completed_at' => $event->completed_at?->format('Y-m-d H:i:s'),
                'attendees'    => $event->attendees->map(fn($user) => [
                    'id'     => $user->id,
                    'name'   => $user->name,
                    'avatar' => $user->profile_picture?->url ?? null,
                ]),
            ]);

        $members = Workspace::find($workspaceId)
            ->users()
            ->select(['id', 'name', 'email'])
            ->get();

        return Inertia::render('calendar', [
            'calendarEvents' => $calendarEvents,
            'tableEvents'    => $tableEvents,
            'members'        => $members,
            'filters'        => [
                'view' => $view,
                'date' => $date->toDateString(),
            ],
        ]);
    }
}
