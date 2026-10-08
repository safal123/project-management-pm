<?php

use App\Models\Activity;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\actingAs;

uses(Tests\Traits\CreatesTestData::class);

test('guests cannot view people', function () {
    $this->get(route('people.index'))->assertRedirect(route('login'));
});

test('workspace members are listed on the people page', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $user->update(['name' => 'Zoe Owner']);
    $workspace = $workspaces->first();
    $project = $this->createProjectsForUser($user, $workspace)->first();
    $teammate = $this->createUser(['name' => 'Alex Member']);
    $workspace->users()->attach($teammate->id);
    $project->users()->attach($teammate->id, ['joined_at' => now()]);

    actingAs($user)
        ->get(route('people.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('people/index')
            ->has('people', 2)
            ->where('people.0.name', 'Alex Member')
            ->where('people.0.project_count', 1)
            ->where('people.1.id', $user->id)
        );
});

test('people can be searched by name', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $teammate = $this->createUser(['name' => 'Jordan Lee']);
    $workspaces->first()->users()->attach($teammate->id);

    actingAs($user)
        ->get(route('people.index', ['q' => 'Jordan']))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('people', 1)
            ->where('people.0.id', $teammate->id)
        );
});

test('a workspace member can view another member profile', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $workspace = $workspaces->first();
    $project = $this->createProjectsForUser($user, $workspace)->first();
    $teammate = $this->createUser(['name' => 'Sam Profile']);
    $workspace->users()->attach($teammate->id);
    $project->users()->attach($teammate->id, ['joined_at' => now()]);
    $task = $this->createTaskForProject($user, $project, ['assigned_to' => $teammate->id]);
    Activity::record($task, Activity::TYPE_CREATED, $workspace->id, $teammate);

    actingAs($user)
        ->get(route('people.show', $teammate))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('people/show')
            ->where('person.id', $teammate->id)
            ->where('person.name', 'Sam Profile')
            ->where('person.role', 'member')
            ->where('can_manage_roles', true)
            ->where('stats.projects', 1)
            ->has('projects', 1)
            ->where('projects.0.role', 'member')
            ->has('activities.data', 1)
            ->where('activities.meta.has_more', false)
        );
});

test('a workspace member can see workspace projects without joining each one', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $workspace = $workspaces->first();
    $project = $this->createProjectsForUser($user, $workspace)->first();
    $member = $this->createUser();
    $workspace->users()->attach($member->id, ['role' => 'member']);
    $member->currentWorkspace()->associate($workspace)->saveQuietly();

    actingAs($member)
        ->get(route('projects.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('projects/index')
            ->has('projects', 1)
            ->where('projects.0.id', $project->id)
        );

    actingAs($member)
        ->get(route('projects.show', $project->slug))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('project.users', 2)
        );
});

test('an existing user can be added to the workspace', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $member = $this->createUser(['email' => 'new-member@example.com']);

    actingAs($user)
        ->post(route('people.store'), ['email' => 'new-member@example.com'])
        ->assertRedirect();

    expect($member->workspaces()->where('workspaces.id', $workspaces->first()->id)->exists())->toBeTrue();
});

test('adding an unknown email fails', function () {
    ['user' => $user] = $this->createUserWithWorkspace();

    actingAs($user)
        ->post(route('people.store'), ['email' => 'missing@example.com'])
        ->assertRedirect()
        ->assertSessionHasErrors('email');
});

test('profile activities can be loaded a page at a time', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $workspace = $workspaces->first();
    $project = $this->createProjectsForUser($user, $workspace)->first();
    $task = $this->createTaskForProject($user, $project);

    foreach (range(1, 9) as $index) {
        $activity = Activity::record($task, Activity::TYPE_CREATED, $workspace->id, $user);
        $activity->created_at = now()->subMinutes($index);
        $activity->save();
    }

    actingAs($user)
        ->get(route('people.show', $user))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('activities.data', 8)
            ->where('activities.meta.has_more', true)
        );

    actingAs($user)
        ->getJson(route('people.activities', ['person' => $user->id, 'page' => 2]))
        ->assertOk()
        ->assertJsonPath('meta.has_more', false)
        ->assertJsonCount(1, 'data');
});

test('a user outside the workspace cannot be viewed', function () {
    ['user' => $user] = $this->createUserWithWorkspace();
    ['user' => $outsider] = $this->createUserWithWorkspace();

    actingAs($user)
        ->get(route('people.show', $outsider))
        ->assertForbidden();
});

test('a workspace owner can promote a member to admin', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $workspace = $workspaces->first();
    $teammate = $this->createUser(['name' => 'Riley Member']);
    $workspace->users()->attach($teammate->id, ['role' => 'member']);

    actingAs($user)
        ->patch(route('people.update', $teammate), ['role' => 'admin'])
        ->assertRedirect();

    expect($workspace->roleFor($teammate->fresh()))->toBe('admin');
});

test('a regular member cannot update roles', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $workspace = $workspaces->first();
    $teammate = $this->createUser();
    $workspace->users()->attach($teammate->id, ['role' => 'member']);
    $teammate->currentWorkspace()->associate($workspace)->saveQuietly();

    actingAs($teammate)
        ->patch(route('people.update', $user), ['role' => 'admin'])
        ->assertForbidden();
});

test('the workspace owner role cannot be changed', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $workspace = $workspaces->first();
    $admin = $this->createUser();
    $workspace->users()->attach($admin->id, ['role' => 'admin']);
    $admin->currentWorkspace()->associate($workspace)->saveQuietly();

    actingAs($admin)
        ->patch(route('people.update', $user), ['role' => 'member'])
        ->assertForbidden();
});
