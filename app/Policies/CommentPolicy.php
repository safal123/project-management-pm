<?php

namespace App\Policies;

use App\Models\Comment;
use App\Models\Task;
use App\Models\User;
use App\Policies\Concerns\ChecksProjectAccess;
use Illuminate\Database\Eloquent\Model;

class CommentPolicy
{
    use ChecksProjectAccess;

    /**
     * Determine whether the user can create a comment on the given commentable model.
     */
    public function create(User $user, Model $commentable): bool
    {
        return match (true) {
            $commentable instanceof Task => $this->canAccessProjectInCurrentWorkspace(
                $user,
                $commentable->project_id,
                $commentable->workspace_id,
            ),
            default => false,
        };
    }

    /**
     * Determine whether the user can update the comment.
     */
    public function update(User $user, Comment $comment): bool
    {
        return $comment->user_id === $user->id;
    }

    /**
     * Determine whether the user can delete the comment.
     */
    public function delete(User $user, Comment $comment): bool
    {
        return $comment->user_id === $user->id;
    }
}
