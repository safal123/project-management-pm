<?php

use App\Models\Like;

use function Pest\Laravel\actingAs;

uses(Tests\Traits\CreatesTestData::class);

test('user can like a comment', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();
    $task = $this->createTaskForProject($user, $project);
    $comment = $this->createCommentForTask($user, $task);

    actingAs($user)
        ->postJson(route('likes.toggle'), [
            'likeable_type' => 'comment',
            'likeable_id' => $comment->id,
        ])
        ->assertOk()
        ->assertJson(['liked' => true, 'likes_count' => 1]);

    expect(Like::query()
        ->where('likeable_type', $comment::class)
        ->where('likeable_id', $comment->id)
        ->where('user_id', $user->id)
        ->exists())->toBeTrue();
});

test('liking a comment twice unlikes it', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();
    $task = $this->createTaskForProject($user, $project);
    $comment = $this->createCommentForTask($user, $task);

    $payload = ['likeable_type' => 'comment', 'likeable_id' => $comment->id];

    actingAs($user)->postJson(route('likes.toggle'), $payload)->assertOk();

    actingAs($user)
        ->postJson(route('likes.toggle'), $payload)
        ->assertOk()
        ->assertJson(['liked' => false, 'likes_count' => 0]);

    expect(Like::query()
        ->where('likeable_type', $comment::class)
        ->where('likeable_id', $comment->id)
        ->exists())->toBeFalse();
});

test('an unsupported likeable type is rejected', function () {
    ['user' => $user] = $this->createUserWithWorkspace();

    actingAs($user)
        ->postJson(route('likes.toggle'), [
            'likeable_type' => 'workspace',
            'likeable_id' => '01k00000000000000000000000',
        ])
        ->assertUnprocessable();
});
