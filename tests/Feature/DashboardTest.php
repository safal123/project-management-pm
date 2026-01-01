<?php

use App\Models\User;
use App\Models\Workspace;
use function Pest\Laravel\{actingAs, get};

test('guests cannot access the dashboard', function () {
    $this
        ->get(route('dashboard'))
        ->assertRedirect(route('login'));
});

test('authenticated user can access the dashboard', function () {
    $user = User::factory()->verified()->create();

    // workspace + currentWorkspace already created by Registered event

    actingAs($user)
        ->get(route('dashboard'))
        ->assertOk();
});
