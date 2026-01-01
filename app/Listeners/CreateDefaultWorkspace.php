<?php

namespace App\Listeners;

use App\Models\Workspace;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
        DB::transaction(function () use ($user) {
            Log::info('Creating default workspace for user: ' . $user->id);
            $workspace = Workspace::create([
                'name' => 'My Workspace',
                'slug' => Str::slug($user->name),
                'created_by' => $user->id,
            ]);
            $workspace->users()->attach($user->id);
            $user->currentWorkspace()->associate($workspace)->save();
            Log::info('Default workspace created for user: ' . $user->id);
        }, attempts: 3);
    }
}
