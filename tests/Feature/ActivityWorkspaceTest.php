<?php

use App\Models\Activity;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\actingAs;

uses(Tests\Traits\CreatesTestData::class);

test('guests cannot view workspace activity', function () {
    $this->get(route('activity.index'))->assertRedirect(route('login'));
});

test('workspace activity page lists activities in a table newest first', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $workspace = $workspaces->first();
    $project = $this->createProjectsForUser($user, $workspace)->first();
    $task = $this->createTaskForProject($user, $project, ['title' => 'Ship activity page']);

    ['user' => $otherUser, 'workspaces' => $otherWorkspaces] = $this->createUserWithWorkspace();
    $otherProject = $this->createProjectsForUser($otherUser, $otherWorkspaces->first())->first();
    $otherTask = $this->createTaskForProject($otherUser, $otherProject, ['title' => 'Other workspace task']);

    $older = Activity::record($task, Activity::TYPE_CREATED, $workspace->id, $user);
    $older->created_at = now()->subMinutes(5);
    $older->save();

    $newer = Activity::record($task, Activity::TYPE_COMMENTED, $workspace->id, $user, ['excerpt' => 'Looks good']);
    Activity::record($otherTask, Activity::TYPE_CREATED, $otherWorkspaces->first()->id, $otherUser);

    actingAs($user)
        ->get(route('activity.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('activity/index')
            ->has('activities.data', 2)
            ->where('activities.data.0.id', $newer->id)
            ->where('activities.data.1.id', $older->id)
            ->where('activities.data.0.subject.name', 'Ship activity page')
            ->where('activities.data.0.description', 'commented on task "Ship activity page": "Looks good"')
        );
});

test('workspace activity can be filtered by type and sorted oldest first', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $workspace = $workspaces->first();
    $project = $this->createProjectsForUser($user, $workspace)->first();
    $task = $this->createTaskForProject($user, $project);

    $created = Activity::record($task, Activity::TYPE_CREATED, $workspace->id, $user);
    $created->created_at = now()->subMinutes(5);
    $created->save();

    $commented = Activity::record($task, Activity::TYPE_COMMENTED, $workspace->id, $user, ['excerpt' => 'Looks good']);

    actingAs($user)
        ->get(route('activity.index', ['type' => Activity::TYPE_COMMENTED]))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('activities.data', 1)
            ->where('activities.data.0.id', $commented->id)
            ->where('filters.type', Activity::TYPE_COMMENTED)
        );

    actingAs($user)
        ->get(route('activity.index', ['sort' => 'created_at', 'direction' => 'asc']))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('activities.data', 2)
            ->where('activities.data.0.id', $created->id)
            ->where('activities.data.1.id', $commented->id)
            ->where('filters.sort', 'created_at')
            ->where('filters.direction', 'asc')
        );
});

test('workspace activity can be filtered by project and person', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $workspace = $workspaces->first();
    $project = $this->createProjectsForUser($user, $workspace)->first();
    $otherProject = $this->createProjectsForUser($user, $workspace)->first();
    $task = $this->createTaskForProject($user, $project);
    $otherTask = $this->createTaskForProject($user, $otherProject);
    $otherUser = $this->createUser();
    $workspace->users()->attach($otherUser->id);

    $mine = Activity::record($task, Activity::TYPE_CREATED, $workspace->id, $user);
    Activity::record($otherTask, Activity::TYPE_CREATED, $workspace->id, $otherUser);

    actingAs($user)
        ->get(route('activity.index', ['project_id' => $project->id, 'user_id' => $user->id]))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('activities.data', 1)
            ->where('activities.data.0.id', $mine->id)
            ->where('filters.project_id', $project->id)
            ->where('filters.user_id', $user->id)
        );
});

test('workspace activity page shows an empty table when nothing has happened', function () {
    ['user' => $user] = $this->createUserWithWorkspace();

    actingAs($user)
        ->get(route('activity.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('activity/index')
            ->has('activities.data', 0)
        );
});
