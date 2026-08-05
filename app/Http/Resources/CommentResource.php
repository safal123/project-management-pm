<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
{
    public static $wrap = null;

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $userId = $request->user()?->id;

        return [
            'id' => $this->id,
            'body' => $this->body,
            'user' => new UserResource($this->whenLoaded('user')),
            'parent_comment_id' => $this->parent_comment_id,
            'can_edit' => $this->user_id === $userId,
            'can_delete' => $this->user_id === $userId,
            'created_at' => $this->created_at,
            'likes_count' => $this->when(isset($this->likes_count), fn () => (int) $this->likes_count, 0),
            'is_liked_by_user' => $this->when(isset($this->is_liked_by_user), fn () => (bool) $this->is_liked_by_user, false),
            'replies' => CommentResource::collection($this->whenLoaded('replies')),
        ];
    }
}
