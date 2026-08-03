<?php

use function Pest\Laravel\actingAs;

uses(Tests\Traits\CreatesTestData::class);

test('project member can move a column', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();

    $columnOne = $this->createTaskForProject($user, $project, ['order' => 1]);
    $columnTwo = $this->createTaskForProject($user, $project, ['order' => 2]);

    actingAs($user)
        ->post(route('tasks.move'), [
            'task_id' => $columnTwo->id,
            'direction' => 'left',
        ])
        ->assertRedirect();

    expect($columnTwo->fresh()->order)->toBe(1)
        ->and($columnOne->fresh()->order)->toBe(2);
});

test('user who is not a project member cannot move a column', function () {
    ['user' => $owner, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($owner, $workspaces->first(), 1)->first();

    $columnOne = $this->createTaskForProject($owner, $project, ['order' => 1]);
    $columnTwo = $this->createTaskForProject($owner, $project, ['order' => 2]);

    ['user' => $stranger] = $this->createUserWithWorkspace();
    $stranger->update(['current_workspace_id' => $workspaces->first()->id]);
    $stranger->workspaces()->syncWithoutDetaching([$workspaces->first()->id]);

    actingAs($stranger)
        ->post(route('tasks.move'), [
            'task_id' => $columnTwo->id,
            'direction' => 'left',
        ])
        ->assertForbidden();

    expect($columnOne->fresh()->order)->toBe(1)
        ->and($columnTwo->fresh()->order)->toBe(2);
});
