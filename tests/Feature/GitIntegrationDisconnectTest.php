<?php

use App\Models\ProjectIntegration;

use function Pest\Laravel\actingAs;

uses(Tests\Traits\CreatesTestData::class);

test('project member can disconnect the repository', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();

    $project->gitIntegration()->create([
        'provider' => ProjectIntegration::PROVIDER_GITHUB,
        'repo_full_name' => 'acme/widgets',
        'repo_url' => 'https://github.com/acme/widgets',
        'default_branch' => 'main',
        'access_token' => 'ghp_validtoken1234567890',
        'connected_by' => $user->id,
    ]);

    actingAs($user)
        ->delete(route('git-integrations.destroy', $project))
        ->assertRedirect();

    expect(ProjectIntegration::query()->where('project_id', $project->id)->exists())->toBeFalse();
});

test('user who is not a project member cannot disconnect the repository', function () {
    ['user' => $owner, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($owner, $workspaces->first(), 1)->first();

    $project->gitIntegration()->create([
        'provider' => ProjectIntegration::PROVIDER_GITHUB,
        'repo_full_name' => 'acme/widgets',
        'repo_url' => 'https://github.com/acme/widgets',
        'default_branch' => 'main',
        'access_token' => 'ghp_validtoken1234567890',
        'connected_by' => $owner->id,
    ]);

    ['user' => $stranger] = $this->createUserWithWorkspace();
    $stranger->update(['current_workspace_id' => $workspaces->first()->id]);
    $stranger->workspaces()->syncWithoutDetaching([$workspaces->first()->id]);

    actingAs($stranger)
        ->delete(route('git-integrations.destroy', $project))
        ->assertForbidden();

    expect(ProjectIntegration::query()->where('project_id', $project->id)->exists())->toBeTrue();
});
