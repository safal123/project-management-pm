<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkspaceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'logo' => $this->logo,
            'created_at' => $this->created_at,
            'created_by' => new UserResource($this->whenLoaded('createdBy')),
            'users' => UserResource::collection($this->whenLoaded('users')),
            'can_rename' => $request->user() !== null && $this->canManageRoles($request->user()),
        ];
    }
}
