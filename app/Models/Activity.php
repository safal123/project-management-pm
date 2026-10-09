<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Activity extends Model
{
    use HasFactory, HasUlids;

    public const TYPE_CREATED = 'created';

    public const TYPE_STATUS_CHANGED = 'status_changed';

    public const TYPE_ASSIGNED = 'assigned';

    public const TYPE_MOVED = 'moved';

    public const TYPE_COMPLETED = 'completed';

    public const TYPE_COMMENTED = 'commented';

    public const TYPE_LIKED = 'liked';

    public const TYPE_BRANCH_CREATED = 'branch_created';

    public const TYPE_TITLE_CHANGED = 'title_changed';

    public const TYPE_DUE_DATE_CHANGED = 'due_date_changed';

    public const TYPE_FILE_UPLOADED = 'file_uploaded';

    public const TYPE_DEPENDENCY_CHANGED = 'dependency_changed';

    public const TYPE_SUBTASK_ADDED = 'subtask_added';

    public const TYPES = [
        self::TYPE_CREATED,
        self::TYPE_STATUS_CHANGED,
        self::TYPE_ASSIGNED,
        self::TYPE_MOVED,
        self::TYPE_COMPLETED,
        self::TYPE_COMMENTED,
        self::TYPE_LIKED,
        self::TYPE_BRANCH_CREATED,
        self::TYPE_TITLE_CHANGED,
        self::TYPE_DUE_DATE_CHANGED,
        self::TYPE_FILE_UPLOADED,
        self::TYPE_DEPENDENCY_CHANGED,
        self::TYPE_SUBTASK_ADDED,
    ];

    public $fillable = [
        'user_id',
        'subject_id',
        'subject_type',
        'workspace_id',
        'type',
        'properties',
    ];

    protected $casts = [
        'properties' => 'array',
    ];

    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeForWorkspace(Builder $query, string $workspaceId): Builder
    {
        return $query->where('workspace_id', $workspaceId);
    }

    public function scopeRelatedToProject(Builder $query, Project $project): Builder
    {
        $taskIds = Task::query()->where('project_id', $project->id)->pluck('id');
        $eventIds = Event::query()->where('project_id', $project->id)->pluck('id');

        return $query->where(function (Builder $activityQuery) use ($project, $taskIds, $eventIds) {
            $activityQuery->where(function (Builder $projectQuery) use ($project) {
                $projectQuery
                    ->where('subject_type', Project::class)
                    ->where('subject_id', $project->id);
            });

            if ($taskIds->isNotEmpty()) {
                $activityQuery->orWhere(function (Builder $taskQuery) use ($taskIds) {
                    $taskQuery
                        ->where('subject_type', Task::class)
                        ->whereIn('subject_id', $taskIds);
                });
            }

            if ($eventIds->isNotEmpty()) {
                $activityQuery->orWhere(function (Builder $eventQuery) use ($eventIds) {
                    $eventQuery
                        ->where('subject_type', Event::class)
                        ->whereIn('subject_id', $eventIds);
                });
            }
        });
    }

    /**
     * Record a new activity for the given subject.
     *
     * @param  array<string, mixed>  $properties
     */
    public static function record(
        Model $subject,
        string $type,
        string $workspaceId,
        ?User $user,
        array $properties = [],
    ): self {
        return static::create([
            'subject_id' => $subject->getKey(),
            'subject_type' => $subject::class,
            'workspace_id' => $workspaceId,
            'user_id' => $user?->id,
            'type' => $type,
            'properties' => $properties,
        ]);
    }
}
