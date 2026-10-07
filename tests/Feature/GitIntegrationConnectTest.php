<?php

use App\Models\ProjectIntegration;
use Illuminate\Support\Facades\Http;

use function Pest\Laravel\actingAs;

uses(Tests\Traits\CreatesTestData::class);

test('project member can connect a repository with a valid token', function () {
    Http::fake([
        'api.github.com/repos/acme/widgets' => Http::response([
            'full_name' => 'acme/widgets',
            'html_url' => 'https://github.com/acme/widgets',
            'default_branch' => 'main',
            'private' => false,
        ], 200),
    ]);

    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();

    actingAs($user)
        ->post(route('git-integrations.store', $project), [
            'provider' => 'github',
            'token' => 'ghp_validtoken1234567890',
            'repo_full_name' => 'acme/widgets',
        ])
        ->assertRedirect();

    $integration = ProjectIntegration::query()->where('project_id', $project->id)->first();

    expect($integration)->not->toBeNull()
        ->and($integration->repo_full_name)->toBe('acme/widgets')
        ->and($integration->default_branch)->toBe('main')
        ->and($integration->access_token)->toBe('ghp_validtoken1234567890')
        ->and($integration->connected_by)->toBe($user->id);
});

test('connecting with an invalid token is rejected', function () {
    Http::fake([
        'api.github.com/repos/acme/widgets' => Http::response([], 401),
    ]);

    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();

    actingAs($user)
        ->post(route('git-integrations.store', $project), [
            'provider' => 'github',
            'token' => 'ghp_badtoken',
            'repo_full_name' => 'acme/widgets',
        ])
        ->assertSessionHasErrors('token');

    expect(ProjectIntegration::query()->where('project_id', $project->id)->exists())->toBeFalse();
});

test('connecting to a repository that does not exist is rejected', function () {
    Http::fake([
        'api.github.com/repos/acme/missing' => Http::response([], 404),
    ]);

    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();

    actingAs($user)
        ->post(route('git-integrations.store', $project), [
            'provider' => 'github',
            'token' => 'ghp_validtoken1234567890',
            'repo_full_name' => 'acme/missing',
        ])
        ->assertSessionHasErrors('token');

    expect(ProjectIntegration::query()->where('project_id', $project->id)->exists())->toBeFalse();
});

test('user who is not a project member cannot connect a repository', function () {
    Http::fake();

    ['user' => $owner, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($owner, $workspaces->first(), 1)->first();

    ['user' => $stranger] = $this->createUserWithWorkspace();
    $stranger->update(['current_workspace_id' => $workspaces->first()->id]);
    $stranger->workspaces()->syncWithoutDetaching([$workspaces->first()->id]);

    actingAs($stranger)
        ->post(route('git-integrations.store', $project), [
            'provider' => 'github',
            'token' => 'ghp_validtoken1234567890',
            'repo_full_name' => 'acme/widgets',
        ])
        ->assertForbidden();

    expect(ProjectIntegration::query()->where('project_id', $project->id)->exists())->toBeFalse();
});
