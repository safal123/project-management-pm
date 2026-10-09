<?php

use App\Models\Task;

use function Pest\Laravel\actingAs;

uses(Tests\Traits\CreatesTestData::class);

function taskStorePayload($project, array $overrides = []): array
{
    return [
        'title' => 'New task',
        'description' => 'Task description',
        'project_id' => $project->id,
        'workspace_id' => $project->workspace_id,
        ...$overrides,
    ];
}

test('project member can create a task', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();

    actingAs($user)
        ->post(route('tasks.store'), taskStorePayload($project))
        ->assertRedirect();

    expect(Task::query()->where('project_id', $project->id)->where('title', 'New task')->exists())->toBeTrue();
});

test('subtasks are parented to the task and not to the kanban column', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();
    $column = $this->createTaskForProject($user, $project, ['parent_task_id' => null, 'title' => 'To do']);
    $card = $this->createTaskForProject($user, $project, ['parent_task_id' => $column->id, 'title' => 'Parent card']);

    actingAs($user)
        ->post(route('tasks.store'), taskStorePayload($project, [
            'title' => 'Nested subtask',
            'parent_task_id' => $card->id,
        ]))
        ->assertRedirect();

    $subtask = Task::query()->where('title', 'Nested subtask')->first();

    expect($subtask)->not->toBeNull()
        ->and($subtask->parent_task_id)->toBe($card->id)
        ->and($subtask->parent_task_id)->not->toBe($column->id);
});

test('a workspace member can create a task', function () {
    ['user' => $owner, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $workspace = $workspaces->first();
    $project = $this->createProjectsForUser($owner, $workspace, 1)->first();
    $member = $this->createUser();
    $workspace->users()->attach($member->id, ['role' => 'member']);
    $member->currentWorkspace()->associate($workspace)->saveQuietly();

    actingAs($member)
        ->post(route('tasks.store'), taskStorePayload($project))
        ->assertRedirect();

    expect(Task::query()->where('project_id', $project->id)->where('title', 'New task')->exists())->toBeTrue();
});

test('a user outside the workspace cannot create a task', function () {
    ['user' => $owner, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($owner, $workspaces->first(), 1)->first();
    ['user' => $stranger] = $this->createUserWithWorkspace();

    actingAs($stranger)
        ->post(route('tasks.store'), taskStorePayload($project))
        ->assertForbidden();

    expect(Task::query()->where('project_id', $project->id)->where('title', 'New task')->exists())->toBeFalse();
});
