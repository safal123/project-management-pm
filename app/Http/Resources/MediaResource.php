<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MediaResource extends JsonResource
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
            'url' => $this->url,
            'filename' => $this->filename,
            'original_filename' => $this->original_filename,
            'filesize' => $this->filesize,
            'filetype' => $this->filetype,
            'workspace_id' => $this->workspace_id,
            'created_at' => $this->created_at,
            'mediable_type' => $this->mediable_type,
            'mediable_id' => $this->mediable_id,
        ];
    }
}
