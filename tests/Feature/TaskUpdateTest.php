<?php

use function Pest\Laravel\actingAs;

uses(Tests\Traits\CreatesTestData::class);

test('project member can update a task', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();
    $task = $this->createTaskForProject($user, $project);

    actingAs($user)
        ->patch(wsRoute('tasks.update', $task), ['status' => 'done'])
        ->assertRedirect();

    expect($task->fresh()->status)->toBe('done');
});

test('user who is not a project member cannot update a task', function () {
    ['user' => $owner, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($owner, $workspaces->first(), 1)->first();
    $task = $this->createTaskForProject($owner, $project);

    ['user' => $stranger] = $this->createUserWithWorkspace();
    $stranger->update(['current_workspace_id' => $workspaces->first()->id]);
    $stranger->workspaces()->syncWithoutDetaching([$workspaces->first()->id]);

    actingAs($stranger)
        ->patch(wsRoute('tasks.update', $task), ['status' => 'done'])
        ->assertForbidden();

    expect($task->fresh()->status)->toBe('todo');
});

test('a project member can update a kanban column color', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();
    $column = $this->createTaskForProject($user, $project, ['title' => 'To Do', 'parent_task_id' => null]);

    actingAs($user)
        ->patch(wsRoute('tasks.update', $column), ['color' => 'sky'])
        ->assertRedirect();

    expect($column->fresh()->color)->toBe('sky');
});
