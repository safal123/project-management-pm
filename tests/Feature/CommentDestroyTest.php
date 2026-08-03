<?php

use App\Models\Comment;

use function Pest\Laravel\actingAs;

uses(Tests\Traits\CreatesTestData::class);

test('author can delete their own comment and its replies cascade', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();
    $task = $this->createTaskForProject($user, $project);
    $comment = $this->createCommentForTask($user, $task);
    $reply = $this->createCommentForTask($user, $task, ['parent_comment_id' => $comment->id]);

    actingAs($user)
        ->deleteJson(route('comments.destroy', $comment))
        ->assertOk();

    expect(Comment::query()->find($comment->id))->toBeNull();
    expect(Comment::query()->find($reply->id))->toBeNull();
});

test('non-author cannot delete another user comment', function () {
    ['user' => $author, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($author, $workspaces->first(), 1)->first();
    $task = $this->createTaskForProject($author, $project);
    $comment = $this->createCommentForTask($author, $task);

    ['user' => $otherMember] = $this->createUserWithWorkspace();
    $otherMember->update(['current_workspace_id' => $workspaces->first()->id]);
    $otherMember->workspaces()->syncWithoutDetaching([$workspaces->first()->id]);
    $project->users()->syncWithoutDetaching([$otherMember->id => ['role' => 'member', 'joined_at' => now()]]);

    actingAs($otherMember)
        ->deleteJson(route('comments.destroy', $comment))
        ->assertForbidden();

    expect(Comment::query()->find($comment->id))->not->toBeNull();
});
