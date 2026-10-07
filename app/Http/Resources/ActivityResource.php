<?php

namespace App\Http\Resources;

use App\Models\Activity;
use App\Models\Event;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityResource extends JsonResource
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
            'type' => $this->type,
            'properties' => $this->properties,
            'user' => new UserResource($this->whenLoaded('user')),
            'description' => $this->description(),
            'created_at' => $this->created_at,
        ];
    }

    /**
     * Build a human-readable description for the activity, so the frontend
     * doesn't need any per-type rendering logic.
     */
    protected function description(): string
    {
        $noun = match ($this->subject_type) {
            Task::class => 'task',
            Project::class => 'project',
            Event::class => 'event',
            default => 'item',
        };

        $properties = $this->properties ?? [];

        return match ($this->type) {
            Activity::TYPE_CREATED => "created this {$noun}",
            Activity::TYPE_STATUS_CHANGED => sprintf(
                'changed status from "%s" to "%s"',
                $properties['from'] ?? 'unknown',
                $properties['to'] ?? 'unknown',
            ),
            Activity::TYPE_ASSIGNED => ($properties['to'] ?? null)
                ? 'updated the assignee'
                : 'removed the assignee',
            Activity::TYPE_MOVED => $noun === 'event'
                ? 'rescheduled this event'
                : sprintf(
                    'moved this task from "%s" to "%s"',
                    $properties['from'] ?? 'unknown',
                    $properties['to'] ?? 'unknown',
                ),
            Activity::TYPE_COMPLETED => ($properties['completed'] ?? false)
                ? 'marked this event complete'
                : 'marked this event incomplete',
            Activity::TYPE_COMMENTED => sprintf('commented: "%s"', $properties['excerpt'] ?? ''),
            Activity::TYPE_LIKED => "liked this {$noun}",
            Activity::TYPE_BRANCH_CREATED => sprintf('created branch "%s"', $properties['branch'] ?? 'unknown'),
            default => "updated this {$noun}",
        };
    }
}
