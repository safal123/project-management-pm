<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvitationResource extends JsonResource
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
            'email' => $this->email,
            'status' => $this->status,
            'token' => $this->token,
            'expires_at' => $this->expires_at,
            'invited_at' => $this->invited_at,
            'accepted_at' => $this->accepted_at,
            'rejected_at' => $this->rejected_at,
            'workspace' => new WorkspaceResource($this->whenLoaded('workspace')),
            'project' => new ProjectResource($this->whenLoaded('project')),
            'invited_by' => new UserResource($this->whenLoaded('invitedBy')),
            'invited_to' => new UserResource($this->whenLoaded('invitedTo')),
        ];
    }
}
