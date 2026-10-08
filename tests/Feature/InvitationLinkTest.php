<?php

use App\Models\Invitation;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\actingAs;

uses(Tests\Traits\CreatesTestData::class);

test('project page shares a reusable invite link', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first())->first();

    actingAs($user)
        ->get(route('projects.show', $project->slug))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('projects/project/index')
            ->has('invite_link')
            ->where('invite_link', fn (string $link) => str_contains($link, '/invitations/'))
        );

    actingAs($user)->get(route('projects.show', $project->slug))->assertOk();

    expect(
        Invitation::query()
            ->where('project_id', $project->id)
            ->whereNull('email')
            ->count()
    )->toBe(1);
});

test('a logged in user can join a project through the invite link without consuming it', function () {
    ['user' => $owner, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($owner, $workspaces->first())->first();
    $invitee = $this->createUser();
    $secondInvitee = $this->createUser();

    $link = Invitation::shareableLinkFor($project, $owner);
    $invitation = Invitation::query()->whereNull('email')->where('project_id', $project->id)->firstOrFail();

    actingAs($invitee)
        ->get($link)
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('invitations/show')
            ->where('invitation.email', null)
        );

    actingAs($invitee)
        ->post(route('invitations.update', $invitation->token), ['status' => 'accepted'])
        ->assertRedirect(route('projects.show', $project->slug));

    actingAs($secondInvitee)
        ->post(route('invitations.update', $invitation->token), ['status' => 'accepted'])
        ->assertRedirect(route('projects.show', $project->slug));

    expect($invitation->fresh()->status)->toBe('pending');
    expect($project->users()->where('users.id', $invitee->id)->exists())->toBeTrue();
    expect($project->users()->where('users.id', $secondInvitee->id)->exists())->toBeTrue();
});

test('guests must log in before accepting an invite link', function () {
    ['user' => $owner, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($owner, $workspaces->first())->first();
    $invitation = Invitation::query()->create([
        'workspace_id' => $project->workspace_id,
        'project_id' => $project->id,
        'invited_by' => $owner->id,
        'email' => null,
    ]);

    $this->get($invitation->signedUrl())->assertOk();

    $this->post(route('invitations.update', $invitation->token), ['status' => 'accepted'])
        ->assertRedirect(route('login'));

    expect($invitation->fresh()->status)->toBe('pending');
});
