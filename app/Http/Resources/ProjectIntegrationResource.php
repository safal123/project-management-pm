<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectIntegrationResource extends JsonResource
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
            'provider' => $this->provider,
            'repo_full_name' => $this->repo_full_name,
            'repo_url' => $this->repo_url,
            'default_branch' => $this->default_branch,
            'masked_token' => $this->maskedToken(),
            'connected_by' => new UserResource($this->whenLoaded('connectedBy')),
            'connected_at' => $this->created_at,
        ];
    }
}
