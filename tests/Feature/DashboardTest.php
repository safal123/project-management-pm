<?php

use function Pest\Laravel\{actingAs, get};
use Tests\Traits\CreatesTestData;

uses(CreatesTestData::class);

test('guests cannot access the dashboard', function () {
    $this
        ->get(route('dashboard'))
        ->assertRedirect(route('login'));
});

test('authenticated user can access the dashboard', function () {
    ['user' => $user] = $this->createUserWithWorkspace();

    actingAs($user)
        ->get(route('dashboard'))
        ->assertOk();
});

test('dashboard displays the correct projects and workspaces count for the user', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace(workspaceCount: 2);

    $this->createProjectsForUser($user, $workspaces->first(), count: 3);
    actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(
            fn(\Inertia\Testing\AssertableInertia $page) => $page
                ->component('dashboard')
                ->has('projects', 3)
                ->has('workspaces', 2)
        );
});

test('dashboard includes a 14-day task activity series', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first())->first();
    $this->createTaskForProject($user, $project, ['status' => 'todo']);
    $this->createTaskForProject($user, $project, ['status' => 'done']);

    actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(
            fn (\Inertia\Testing\AssertableInertia $page) => $page
                ->component('dashboard')
                ->has('taskActivity', 14)
                ->where('taskActivity.13.created', 2)
                ->where('taskActivity.13.completed', 1)
        );
});
