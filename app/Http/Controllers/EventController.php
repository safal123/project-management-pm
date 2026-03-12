<?php

namespace App\Http\Controllers;

use App\Http\Requests\EventCreateRequest;
use App\Models\Event;

class EventController extends Controller
{
    public function store(EventCreateRequest $request)
    {
        $validated = $request->validated();
        
        // Extract attendees before creating event
        $attendees = $validated['attendees'] ?? [];
        unset($validated['attendees']);
        
        // Create the event
        $event = Event::create($validated);
        
        // Attach attendees to the event
        if (!empty($attendees)) {
            $event->attendees()->attach($attendees);
        }

        return redirect()->route('calendar.index')->with('success', 'Event created successfully');
    }
}
