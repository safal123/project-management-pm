<?php

namespace App\Actions\Comment;

use App\Http\Resources\CommentResource;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ListComments
{
    public function execute(Model $commentable, User $user): AnonymousResourceCollection
    {
        $likeCounts = [
            'likes',
            'likes as is_liked_by_user' => fn ($query) => $query->where('user_id', $user->id),
        ];

        $comments = $commentable->comments()
            ->topLevel()
            ->with(['user'])
            ->withCount($likeCounts)
            ->with(['replies' => fn ($query) => $query
                ->with('user')
                ->withCount($likeCounts)])
            ->oldest()
            ->get();

        return CommentResource::collection($comments);
    }
}
