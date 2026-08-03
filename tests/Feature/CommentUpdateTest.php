<?php

use function Pest\Laravel\actingAs;

uses(Tests\Traits\CreatesTestData::class);

test('author can edit their own comment', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();
    $task = $this->createTaskForProject($user, $project);
    $comment = $this->createCommentForTask($user, $task, ['body' => 'Original body']);

    actingAs($user)
        ->patchJson(route('comments.update', $comment), ['body' => 'Updated body'])
        ->assertOk()
        ->assertJsonPath('body', 'Updated body');

    expect($comment->fresh()->body)->toBe('Updated body');
});

test('non-author cannot edit another user comment', function () {
    ['user' => $author, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($author, $workspaces->first(), 1)->first();
    $task = $this->createTaskForProject($author, $project);
    $comment = $this->createCommentForTask($author, $task, ['body' => 'Original body']);

    ['user' => $otherMember] = $this->createUserWithWorkspace();
    $otherMember->update(['current_workspace_id' => $workspaces->first()->id]);
    $otherMember->workspaces()->syncWithoutDetaching([$workspaces->first()->id]);
    $project->users()->syncWithoutDetaching([$otherMember->id => ['role' => 'member', 'joined_at' => now()]]);

    actingAs($otherMember)
        ->patchJson(route('comments.update', $comment), ['body' => 'Hijacked body'])
        ->assertForbidden();

    expect($comment->fresh()->body)->toBe('Original body');
});
