<?php

use App\Models\Project;

use function Pest\Laravel\actingAs;

uses(Tests\Traits\CreatesTestData::class);

test('a workspace owner can create a project', function () {
    ['user' => $user] = $this->createUserWithWorkspace();

    actingAs($user)
        ->post(route('projects.store'), [
            'name' => 'Owner project',
            'description' => 'Created by the owner',
        ])
        ->assertRedirect();

    expect(Project::query()->where('name', 'Owner project')->where('created_by', $user->id)->exists())->toBeTrue();
});

test('a workspace member cannot create a project', function () {
    ['user' => $owner, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $workspace = $workspaces->first();
    $member = $this->createUser();
    $workspace->users()->attach($member->id, ['role' => 'member']);
    $member->currentWorkspace()->associate($workspace)->saveQuietly();

    actingAs($member)
        ->post(route('projects.store'), [
            'name' => 'Member project',
        ])
        ->assertForbidden();

    expect(Project::query()->where('name', 'Member project')->exists())->toBeFalse();
});
