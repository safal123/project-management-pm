<?php

use App\Models\Comment;
use App\Models\Task;

use function Pest\Laravel\actingAs;

uses(Tests\Traits\CreatesTestData::class);

test('project member can comment on a task', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();
    $task = $this->createTaskForProject($user, $project);

    actingAs($user)
        ->postJson(route('comments.store'), [
            'commentable_type' => 'task',
            'commentable_id' => $task->id,
            'body' => 'This is a comment',
        ])
        ->assertCreated()
        ->assertJsonPath('body', 'This is a comment')
        ->assertJsonPath('can_edit', true)
        ->assertJsonPath('can_delete', true);

    expect(Comment::query()
        ->where('commentable_type', Task::class)
        ->where('commentable_id', $task->id)
        ->where('body', 'This is a comment')
        ->exists())->toBeTrue();
});

test('user who is not a project member cannot comment on a task', function () {
    ['user' => $owner, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($owner, $workspaces->first(), 1)->first();
    $task = $this->createTaskForProject($owner, $project);

    ['user' => $stranger] = $this->createUserWithWorkspace();
    $stranger->update(['current_workspace_id' => $workspaces->first()->id]);
    $stranger->workspaces()->syncWithoutDetaching([$workspaces->first()->id]);

    actingAs($stranger)
        ->postJson(route('comments.store'), [
            'commentable_type' => 'task',
            'commentable_id' => $task->id,
            'body' => 'This is a comment',
        ])
        ->assertForbidden();

    expect(Comment::query()->where('commentable_id', $task->id)->exists())->toBeFalse();
});

test('reply nests under the parent comment', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();
    $task = $this->createTaskForProject($user, $project);
    $parent = $this->createCommentForTask($user, $task, ['body' => 'Parent comment']);

    actingAs($user)
        ->postJson(route('comments.store'), [
            'commentable_type' => 'task',
            'commentable_id' => $task->id,
            'parent_comment_id' => $parent->id,
            'body' => 'A reply',
        ])
        ->assertCreated()
        ->assertJsonPath('parent_comment_id', $parent->id);

    expect(Comment::query()
        ->where('parent_comment_id', $parent->id)
        ->where('body', 'A reply')
        ->exists())->toBeTrue();

    actingAs($user)
        ->getJson(route('comments.index', [
            'commentable_type' => 'task',
            'commentable_id' => $task->id,
        ]))
        ->assertOk()
        ->assertJsonPath('data.0.id', $parent->id)
        ->assertJsonPath('data.0.replies.0.body', 'A reply');
});
