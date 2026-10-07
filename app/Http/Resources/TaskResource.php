<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public static $wrap = null;
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'title'            => $this->title,
            'name'             => $this->title,
            'slug'             => $this->slug,
            'project_id'       => $this->project_id,
            'workspace_id'     => $this->workspace_id,
            'created_by'       => $this->created_by,
            'parent_task_id'   => $this->parent_task_id,
            'depends_on_task_id' => $this->depends_on_task_id,
            'description'      => $this->when(! is_null($this->description), $this->description),
            'status'           => $this->when(! is_null($this->status), $this->status),
            'priority'         => $this->when(! is_null($this->priority), $this->priority),
            'order'            => $this->when(! is_null($this->order), $this->order),
            'due_date'         => $this->when(! is_null($this->due_date), $this->due_date),
            'progress'         => $this->when(! is_null($this->progress), $this->progress),
            'color'            => $this->when(! is_null($this->color), $this->color),
            'branch_name'      => $this->when(! is_null($this->branch_name), $this->branch_name),
            'branch_url'       => $this->when(! is_null($this->branch_url), $this->branch_url),

            'parent_task'      => $this->whenLoaded('parentTask', fn() => [
                'id'    => $this->parentTask->id,
                'title' => $this->parentTask->title,
            ]),
            'depends_on'       => $this->whenLoaded('dependsOn', fn () => $this->dependsOn ? [
                'id'    => $this->dependsOn->id,
                'title' => $this->dependsOn->title,
            ] : null),
            'assigned_by'      => new UserResource($this->whenLoaded('assignedBy')),
            'assigned_to'      => new UserResource($this->whenLoaded('assignedTo')),
            'media'            => MediaResource::collection($this->whenLoaded('media')),

            'likes_count'      => $this->when(
                isset($this->likes_count),
                fn() => (int) $this->likes_count,
                0
            ),
            'is_liked_by_user' => $this->when(
                isset($this->is_liked_by_user),
                fn() => (bool) $this->is_liked_by_user,
                false
            ),
            'comments_count'   => $this->when(
                isset($this->comments_count),
                fn() => (int) $this->comments_count,
                0
            ),
        ];
    }
}
