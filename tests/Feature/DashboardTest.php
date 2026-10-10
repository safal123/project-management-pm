<?php

use function Pest\Laravel\{actingAs, get};
use Tests\Traits\CreatesTestData;

uses(CreatesTestData::class);

test('guests cannot access the dashboard', function () {
    $this
        ->get(wsRoute('dashboard'))
        ->assertRedirect(route('login'));
});

test('authenticated user can access the dashboard', function () {
    ['user' => $user] = $this->createUserWithWorkspace();

    actingAs($user)
        ->get(wsRoute('dashboard'))
        ->assertOk();
});

test('dashboard displays the correct projects and workspaces count for the user', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace(workspaceCount: 2);

    $this->createProjectsForUser($user, $workspaces->first(), count: 3);
    actingAs($user)
        ->get(wsRoute('dashboard'))
        ->assertOk()
        ->assertInertia(
            fn(\Inertia\Testing\AssertableInertia $page) => $page
                ->component('dashboard')
                ->has('projects', 3)
                ->has('workspaces', 2)
        );
});

test('visiting another workspace dashboard switches the current workspace', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace(workspaceCount: 2);
    $current = $workspaces->first();
    $next = $workspaces->last();

    $this->createProjectsForUser($user, $current, count: 2);
    $this->createProjectsForUser($user, $next, count: 1);

    expect($user->current_workspace_id)->toBe($current->id);

    actingAs($user)
        ->get(wsRoute('dashboard', [], $next))
        ->assertOk()
        ->assertInertia(
            fn (\Inertia\Testing\AssertableInertia $page) => $page
                ->component('dashboard')
                ->has('projects', 1)
                ->where('auth.user.current_workspace_id', $next->id)
        );

    expect($user->fresh()->current_workspace_id)->toBe($next->id);
});

test('dashboard includes a 14-day task activity series', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first())->first();
    $this->createTaskForProject($user, $project, ['status' => 'todo']);
    $this->createTaskForProject($user, $project, ['status' => 'done']);

    actingAs($user)
        ->get(wsRoute('dashboard'))
        ->assertOk()
        ->assertInertia(
            fn (\Inertia\Testing\AssertableInertia $page) => $page
                ->component('dashboard')
                ->has('taskActivity', 14)
                ->where('taskActivity.13.created', 2)
                ->where('taskActivity.13.completed', 1)
        );
});
