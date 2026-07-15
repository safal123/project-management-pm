<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'title'       => $this->title,
            'type'        => $this->type,
            'start_date'  => $this->start_date?->toISOString(),
            'end_date'    => $this->when(! is_null($this->end_date), $this->end_date?->toISOString()),
            'location'    => $this->when(! is_null($this->location), $this->location),
            'description' => $this->when(! is_null($this->description), $this->description),
            'attendees'   => $this->whenLoaded('attendees', fn () => $this->attendees->map(fn ($user) => [
                'id'     => $user->id,
                'name'   => $user->name,
                'avatar' => $user->profile_picture?->url ?? null,
            ])),
        ];
    }
}
