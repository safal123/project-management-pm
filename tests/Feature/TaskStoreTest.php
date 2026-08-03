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

test('user who is not a project member cannot create a task', function () {
    ['user' => $owner, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($owner, $workspaces->first(), 1)->first();

    ['user' => $stranger] = $this->createUserWithWorkspace();
    $stranger->update(['current_workspace_id' => $workspaces->first()->id]);
    $stranger->workspaces()->syncWithoutDetaching([$workspaces->first()->id]);

    actingAs($stranger)
        ->post(route('tasks.store'), taskStorePayload($project))
        ->assertForbidden();

    expect(Task::query()->where('project_id', $project->id)->where('title', 'New task')->exists())->toBeFalse();
});
