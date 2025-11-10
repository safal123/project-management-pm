<?php

namespace App\Listeners;

use App\Models\Workspace;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Str;

class CreateDefaultWorkspace
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(Registered $event): void
    {
        $user = $event->user;

        $workspace = Workspace::create([
            'name' => 'My Workspace',
            'slug' => Str::slug($user->name),
            'created_by' => $user->id,
        ]);

        $workspace->users()->attach($user->id);

        $user->currentWorkspace()->associate($workspace)->save();
    }
}
