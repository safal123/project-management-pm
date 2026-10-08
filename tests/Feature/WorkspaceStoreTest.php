<?php

use App\Models\Workspace;

use function Pest\Laravel\actingAs;

uses(Tests\Traits\CreatesTestData::class);

test('a workspace can be created with a unique slug', function () {
    ['user' => $user] = $this->createUserWithWorkspace();

    actingAs($user)
        ->post(route('workspaces.store'), [
            'name' => 'Test workspace',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('workspaces', [
        'name' => 'Test workspace',
        'created_by' => $user->id,
    ]);
});

test('creating a workspace with a taken name appends a unique slug', function () {
    ['user' => $user] = $this->createUserWithWorkspace();

    Workspace::factory()->create([
        'name' => 'Test workspace',
        'slug' => 'test-workspace',
        'created_by' => $user->id,
    ]);

    actingAs($user)
        ->post(route('workspaces.store'), [
            'name' => 'Test workspace',
        ])
        ->assertRedirect();

    expect(Workspace::query()->where('slug', 'test-workspace-1')->exists())->toBeTrue();
});

test('a workspace owner can rename the workspace', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $workspace = $workspaces->first();

    actingAs($user)
        ->patch(route('workspaces.update', $workspace), [
            'name' => 'Renamed workspace',
        ])
        ->assertRedirect();

    expect($workspace->fresh()->name)->toBe('Renamed workspace');
    expect($workspace->fresh()->slug)->toBe('renamed-workspace');
});

test('renaming keeps a unique slug', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $workspace = $workspaces->first();

    Workspace::factory()->create([
        'name' => 'Taken name',
        'slug' => 'taken-name',
        'created_by' => $user->id,
    ]);

    actingAs($user)
        ->patch(route('workspaces.update', $workspace), [
            'name' => 'Taken name',
        ])
        ->assertRedirect();

    expect($workspace->fresh()->slug)->toBe('taken-name-1');
});

test('a regular member cannot rename the workspace', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $workspace = $workspaces->first();
    $member = $this->createUser();
    $workspace->users()->attach($member->id, ['role' => 'member']);
    $member->currentWorkspace()->associate($workspace)->saveQuietly();

    actingAs($member)
        ->patch(route('workspaces.update', $workspace), [
            'name' => 'Hacked name',
        ])
        ->assertForbidden();

    expect($workspace->fresh()->name)->not->toBe('Hacked name');
});
