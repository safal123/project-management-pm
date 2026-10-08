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
            'subject' => $this->when(
                $this->relationLoaded('subject'),
                fn () => $this->subjectPayload(),
            ),
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
        $noun = $this->subjectNoun();
        $label = $this->subjectLabel();
        $properties = $this->properties ?? [];

        return match ($this->type) {
            Activity::TYPE_CREATED => "created {$label}",
            Activity::TYPE_STATUS_CHANGED => sprintf(
                'changed status of %s from "%s" to "%s"',
                $label,
                $properties['from'] ?? 'unknown',
                $properties['to'] ?? 'unknown',
            ),
            Activity::TYPE_ASSIGNED => ($properties['to'] ?? null)
                ? "updated the assignee on {$label}"
                : "removed the assignee from {$label}",
            Activity::TYPE_MOVED => $noun === 'event'
                ? "rescheduled {$label}"
                : sprintf(
                    'moved %s from "%s" to "%s"',
                    $label,
                    $properties['from'] ?? 'unknown',
                    $properties['to'] ?? 'unknown',
                ),
            Activity::TYPE_COMPLETED => ($properties['completed'] ?? false)
                ? "marked {$label} complete"
                : "marked {$label} incomplete",
            Activity::TYPE_COMMENTED => sprintf('commented on %s: "%s"', $label, $properties['excerpt'] ?? ''),
            Activity::TYPE_LIKED => "liked {$label}",
            Activity::TYPE_BRANCH_CREATED => sprintf('created branch "%s" on %s', $properties['branch'] ?? 'unknown', $label),
            default => "updated {$label}",
        };
    }

    /**
     * @return array{id: mixed, type: string, name: ?string, url: ?string, project: ?array{id: mixed, name: string, slug: string}}
     */
    protected function subjectPayload(): ?array
    {
        $subject = $this->subject;

        if (! $subject) {
            return null;
        }

        $project = $subject instanceof Project
            ? $subject
            : ($subject->relationLoaded('project') ? $subject->project : null);

        return [
            'id' => $subject->getKey(),
            'type' => $this->subjectNoun(),
            'name' => $this->subjectName(),
            'url' => $this->subjectUrl(),
            'project' => $project ? [
                'id' => $project->id,
                'name' => $project->name,
                'slug' => $project->slug,
            ] : null,
        ];
    }

    protected function subjectNoun(): string
    {
        return match ($this->subject_type) {
            Task::class => 'task',
            Project::class => 'project',
            Event::class => 'event',
            default => 'item',
        };
    }

    protected function subjectLabel(): string
    {
        $name = $this->subjectName();

        if ($name) {
            return $this->subjectNoun().' "'.$name.'"';
        }

        return 'this '.$this->subjectNoun();
    }

    protected function subjectName(): ?string
    {
        if (! $this->relationLoaded('subject') || ! $this->subject) {
            return null;
        }

        return $this->subject->title ?? $this->subject->name ?? null;
    }

    protected function subjectUrl(): ?string
    {
        if (! $this->relationLoaded('subject') || ! $this->subject) {
            return null;
        }

        $subject = $this->subject;

        if ($subject instanceof Task && $subject->relationLoaded('project') && $subject->project) {
            return route('projects.show', $subject->project->slug, false);
        }

        if ($subject instanceof Project) {
            return route('projects.show', $subject->slug, false);
        }

        if ($subject instanceof Event && $subject->relationLoaded('project') && $subject->project) {
            return route('projects.show', [
                'project' => $subject->project->slug,
                'tab' => 'calendar',
            ], false);
        }

        return null;
    }
}
