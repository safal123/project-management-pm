<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Event;
use App\Models\Workspace;

class CalendarController extends Controller
{
    public function index()
    {
        $events = Event::with(['createdBy', 'attendees'])->get();
        // get all members of the current workspace
        $members = Workspace::find(auth()->user()->current_workspace_id)->users()->get();
        return Inertia::render('calendar', [
            'events' => $events,
            'members' => $members,
        ]);
    }
}
