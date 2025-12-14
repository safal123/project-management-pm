<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'profile_picture' => $this->profile_picture ? new MediaResource($this->profile_picture) : null,
            'workspaces' => WorkspaceResource::collection($this->whenLoaded('workspaces')),
            'current_workspace_id' => $this->current_workspace_id,
            'current_workspace' => new WorkspaceResource($this->whenLoaded('currentWorkspace')),
        ];
    }
}
