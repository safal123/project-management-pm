<?php

use function Pest\Laravel\actingAs;

uses(Tests\Traits\CreatesTestData::class);

test('project member can reorder tasks', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();

    $column = $this->createTaskForProject($user, $project);
    $taskOne = $this->createTaskForProject($user, $project, ['parent_task_id' => $column->id, 'order' => 1]);
    $taskTwo = $this->createTaskForProject($user, $project, ['parent_task_id' => $column->id, 'order' => 2]);

    actingAs($user)
        ->post(route('tasks.reorder'), [
            'taskIds' => [$taskTwo->id, $taskOne->id],
        ])
        ->assertRedirect();

    expect($taskTwo->fresh()->order)->toBe(1)
        ->and($taskOne->fresh()->order)->toBe(2);
});

test('user who is not a project member cannot reorder tasks', function () {
    ['user' => $owner, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($owner, $workspaces->first(), 1)->first();

    $column = $this->createTaskForProject($owner, $project);
    $taskOne = $this->createTaskForProject($owner, $project, ['parent_task_id' => $column->id, 'order' => 1]);
    $taskTwo = $this->createTaskForProject($owner, $project, ['parent_task_id' => $column->id, 'order' => 2]);

    ['user' => $stranger] = $this->createUserWithWorkspace();
    $stranger->update(['current_workspace_id' => $workspaces->first()->id]);
    $stranger->workspaces()->syncWithoutDetaching([$workspaces->first()->id]);

    actingAs($stranger)
        ->post(route('tasks.reorder'), [
            'taskIds' => [$taskTwo->id, $taskOne->id],
        ])
        ->assertForbidden();

    expect($taskOne->fresh()->order)->toBe(1)
        ->and($taskTwo->fresh()->order)->toBe(2);
});
