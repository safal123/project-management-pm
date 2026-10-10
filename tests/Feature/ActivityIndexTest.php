<?php

use App\Models\Activity;

use function Pest\Laravel\actingAs;

uses(Tests\Traits\CreatesTestData::class);

test('project member can fetch a task activity feed newest first', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();
    $task = $this->createTaskForProject($user, $project);

    $older = Activity::record($task, Activity::TYPE_CREATED, $task->workspace_id, $user);
    $older->created_at = now()->subMinutes(5);
    $older->save();

    $newer = Activity::record($task, Activity::TYPE_COMMENTED, $task->workspace_id, $user, ['excerpt' => 'hi']);

    $response = actingAs($user)
        ->getJson(wsRoute('activities.index', [
            'subject_type' => 'task',
            'subject_id' => $task->id,
        ]))
        ->assertOk();

    $response->assertJsonPath('data.0.id', $newer->id)
        ->assertJsonPath('data.1.id', $older->id);
});

test('non project member cannot fetch a task activity feed', function () {
    ['user' => $owner, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($owner, $workspaces->first(), 1)->first();
    $task = $this->createTaskForProject($owner, $project);

    ['user' => $stranger] = $this->createUserWithWorkspace();
    $stranger->update(['current_workspace_id' => $workspaces->first()->id]);
    $stranger->workspaces()->syncWithoutDetaching([$workspaces->first()->id]);

    actingAs($stranger)
        ->getJson(wsRoute('activities.index', [
            'subject_type' => 'task',
            'subject_id' => $task->id,
        ]))
        ->assertForbidden();
});

test('workspace member can fetch an event activity feed', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $event = $this->createEventForWorkspace($user, $workspaces->first());

    Activity::record($event, Activity::TYPE_CREATED, $event->workspace_id, $user);

    actingAs($user)
        ->getJson(wsRoute('activities.index', [
            'subject_type' => 'event',
            'subject_id' => $event->id,
        ]))
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

test('workspace member can fetch the workspace activity timeline', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();
    $task = $this->createTaskForProject($user, $project);

    Activity::record($task, Activity::TYPE_CREATED, $task->workspace_id, $user);

    actingAs($user)
        ->getJson(wsRoute('activities.index', ['scope' => 'workspace']))
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

test('project member can fetch a project activity timeline including related tasks', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();
    $task = $this->createTaskForProject($user, $project);

    Activity::record($project, Activity::TYPE_CREATED, $project->workspace_id, $user);
    Activity::record($task, Activity::TYPE_COMMENTED, $task->workspace_id, $user, ['excerpt' => 'hi']);

    actingAs($user)
        ->getJson(wsRoute('activities.index', [
            'scope' => 'project',
            'project_id' => $project->id,
        ]))
        ->assertOk()
        ->assertJsonCount(2, 'data');
});

test('user outside the workspace cannot fetch a project activity timeline', function () {
    ['user' => $owner, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($owner, $workspaces->first(), 1)->first();

    ['user' => $outsider] = $this->createUserWithWorkspace();

    actingAs($outsider)
        ->getJson(wsRoute('activities.index', [
            'scope' => 'project',
            'project_id' => $project->id,
        ], $workspaces->first()))
        ->assertForbidden();
});

test('user outside the workspace cannot fetch an event activity feed', function () {
    ['user' => $owner, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $event = $this->createEventForWorkspace($owner, $workspaces->first());

    ['user' => $outsider] = $this->createUserWithWorkspace();

    actingAs($outsider)
        ->getJson(wsRoute('activities.index', [
            'subject_type' => 'event',
            'subject_id' => $event->id,
        ]))
        ->assertForbidden();
});

test('assigned activity resolves user ids to names', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();
    $task = $this->createTaskForProject($user, $project);

    Activity::record($task, Activity::TYPE_ASSIGNED, $task->workspace_id, $user, [
        'from' => null,
        'to' => $user->id,
    ]);

    actingAs($user)
        ->getJson(wsRoute('activities.index', [
            'subject_type' => 'task',
            'subject_id' => $task->id,
        ]))
        ->assertOk()
        ->assertJsonPath('data.0.properties.to_name', $user->name)
        ->assertJsonPath('data.0.description', 'assigned task "'.$task->title.'" to '.$user->name);
});
