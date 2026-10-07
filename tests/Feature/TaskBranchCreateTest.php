<?php

use App\Models\Activity;
use App\Models\ProjectIntegration;
use App\Models\Task;
use Illuminate\Support\Facades\Http;

use function Pest\Laravel\actingAs;

uses(Tests\Traits\CreatesTestData::class);

function connectGithubIntegration($project, $user): ProjectIntegration
{
    return $project->gitIntegration()->create([
        'provider' => ProjectIntegration::PROVIDER_GITHUB,
        'repo_full_name' => 'acme/widgets',
        'repo_url' => 'https://github.com/acme/widgets',
        'default_branch' => 'main',
        'access_token' => 'ghp_validtoken1234567890',
        'connected_by' => $user->id,
    ]);
}

test('creating a branch persists branch fields and records an activity', function () {
    Http::fake([
        'api.github.com/repos/acme/widgets/git/ref/heads/main' => Http::response([
            'object' => ['sha' => 'abc123'],
        ], 200),
        'api.github.com/repos/acme/widgets/git/refs' => Http::response([
            'ref' => 'refs/heads/task/test-task',
        ], 201),
    ]);

    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();
    $task = $this->createTaskForProject($user, $project);
    connectGithubIntegration($project, $user);

    actingAs($user)
        ->post(route('tasks.branch.store', $task), [
            'branch_name' => 'task/'.$task->slug,
        ])
        ->assertRedirect();

    $task->refresh();

    expect($task->branch_name)->toBe('task/'.$task->slug)
        ->and($task->branch_url)->not->toBeNull()
        ->and($task->branch_created_by)->toBe($user->id)
        ->and($task->branch_created_at)->not->toBeNull();

    expect(Activity::query()
        ->where('subject_type', Task::class)
        ->where('subject_id', $task->id)
        ->where('type', Activity::TYPE_BRANCH_CREATED)
        ->exists())->toBeTrue();
});

test('creating a branch fails gracefully when the project has no integration', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();
    $task = $this->createTaskForProject($user, $project);

    actingAs($user)
        ->post(route('tasks.branch.store', $task), [
            'branch_name' => 'task/'.$task->slug,
        ])
        ->assertStatus(422);

    expect($task->refresh()->branch_name)->toBeNull();
});

test('creating a branch fails gracefully when the branch already exists', function () {
    Http::fake([
        'api.github.com/repos/acme/widgets/git/ref/heads/main' => Http::response([
            'object' => ['sha' => 'abc123'],
        ], 200),
        'api.github.com/repos/acme/widgets/git/refs' => Http::response([
            'message' => 'Reference already exists',
        ], 422),
    ]);

    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();
    $task = $this->createTaskForProject($user, $project);
    connectGithubIntegration($project, $user);

    actingAs($user)
        ->post(route('tasks.branch.store', $task), [
            'branch_name' => 'task/'.$task->slug,
        ])
        ->assertSessionHasErrors('branch_name');

    expect($task->refresh()->branch_name)->toBeNull();
});
