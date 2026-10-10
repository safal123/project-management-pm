<?php

namespace App\Actions\Comment;

use App\Models\Activity;
use App\Models\Comment;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class CreateComment
{
    /**
     * @param  array{body: string, parent_comment_id?: string|null}  $data
     */
    public function execute(User $user, Model $commentable, array $data): Comment
    {
        $comment = $commentable->comments()->create([
            'user_id' => $user->id,
            'workspace_id' => $commentable->workspace_id,
            'parent_comment_id' => $data['parent_comment_id'] ?? null,
            'body' => $data['body'],
        ]);

        $comment->load('user');

        if (method_exists($commentable, 'activities')) {
            Activity::record($commentable, Activity::TYPE_COMMENTED, $commentable->workspace_id, $user, [
                'excerpt' => Str::limit($comment->body, 80),
            ]);
        }

        return $comment;
    }
}
