<?php

use function Pest\Laravel\actingAs;

uses(Tests\Traits\CreatesTestData::class);

test('project member can move a column', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();

    $columnOne = $this->createTaskForProject($user, $project, ['order' => 1]);
    $columnTwo = $this->createTaskForProject($user, $project, ['order' => 2]);

    actingAs($user)
        ->post(wsRoute('tasks.move'), [
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
        ->post(wsRoute('tasks.move'), [
            'task_id' => $columnTwo->id,
            'direction' => 'left',
        ])
        ->assertForbidden();

    expect($columnOne->fresh()->order)->toBe(1)
        ->and($columnTwo->fresh()->order)->toBe(2);
});

test('project member can move a column to first and last', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();

    $columnOne = $this->createTaskForProject($user, $project, ['order' => 1]);
    $columnTwo = $this->createTaskForProject($user, $project, ['order' => 2]);
    $columnThree = $this->createTaskForProject($user, $project, ['order' => 3]);

    actingAs($user)
        ->post(wsRoute('tasks.move'), [
            'task_id' => $columnThree->id,
            'direction' => 'first',
        ])
        ->assertRedirect();

    expect($columnThree->fresh()->order)->toBe(1)
        ->and($columnOne->fresh()->order)->toBe(2)
        ->and($columnTwo->fresh()->order)->toBe(3);

    actingAs($user)
        ->post(wsRoute('tasks.move'), [
            'task_id' => $columnThree->id,
            'direction' => 'last',
        ])
        ->assertRedirect();

    expect($columnOne->fresh()->order)->toBe(1)
        ->and($columnTwo->fresh()->order)->toBe(2)
        ->and($columnThree->fresh()->order)->toBe(3);
});

test('cards cannot be moved as columns', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();
    $column = $this->createTaskForProject($user, $project, ['order' => 1]);
    $card = $this->createTaskForProject($user, $project, ['parent_task_id' => $column->id, 'order' => 1]);

    actingAs($user)
        ->post(wsRoute('tasks.move'), [
            'task_id' => $card->id,
            'direction' => 'left',
        ])
        ->assertSessionHasErrors('task_id');
});
