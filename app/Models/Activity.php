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

    /**
     * Polymorphic model map — extend this when adding activity logging to new entities.
     *
     * @var array<string, class-string<Model>>
     */
    public const SUBJECT_MODELS = [
        'task' => Task::class,
        'project' => Project::class,
        'event' => Event::class,
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

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        $term = trim((string) $term);

        if ($term === '') {
            return $query;
        }

        $like = '%'.addcslashes($term, '%_\\').'%';
        $operator = $query->getConnection()->getDriverName() === 'pgsql' ? 'ilike' : 'like';

        return $query->where(function (Builder $activityQuery) use ($like, $operator) {
            $activityQuery
                ->where('type', $operator, $like)
                ->orWhereHas('user', fn (Builder $userQuery) => $userQuery->where('name', $operator, $like))
                ->orWhereHasMorph(
                    'subject',
                    [Task::class, Event::class],
                    function (Builder $subjectQuery) use ($like, $operator) {
                        $subjectQuery
                            ->where('title', $operator, $like)
                            ->orWhereHas('project', fn (Builder $projectQuery) => $projectQuery->where('name', $operator, $like));
                    },
                )
                ->orWhereHasMorph(
                    'subject',
                    [Project::class],
                    fn (Builder $subjectQuery) => $subjectQuery->where('name', $operator, $like),
                );

            if ($operator === 'ilike') {
                $activityQuery->orWhereRaw('CAST(properties AS TEXT) ILIKE ?', [$like]);
            } else {
                $activityQuery->orWhere('properties', 'like', $like);
            }
        });
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function scopeFilterBy(Builder $query, array $filters): Builder
    {
        return $query
            ->when(
                $filters['type'] ?? null,
                fn (Builder $q, $type) => $q->where('activities.type', $type)
            )
            ->when(
                isset(self::SUBJECT_MODELS[$filters['subject'] ?? null])
                    ? $filters['subject']
                    : null,
                fn (Builder $q, $subject) => $q->where('activities.subject_type', self::SUBJECT_MODELS[$subject])
            )
            ->when(
                $filters['project_id'] ?? null,
                function (Builder $q, $projectId) {
                    $project = Project::query()->find($projectId);

                    return $project ? $q->relatedToProject($project) : $q;
                }
            )
            ->when(
                $filters['user_id'] ?? null,
                fn (Builder $q, $userId) => $q->where('activities.user_id', $userId)
            );
    }

    public function scopeSortBy(Builder $query, string $sort = 'created_at', string $direction = 'desc'): Builder
    {
        $direction = $direction === 'asc' ? 'asc' : 'desc';

        if ($sort === 'user') {
            return $query
                ->orderBy(
                    User::query()->select('name')->whereColumn('users.id', 'activities.user_id'),
                    $direction,
                )
                ->orderByDesc('activities.created_at');
        }

        if ($sort === 'type') {
            return $query->orderBy('type', $direction)->orderByDesc('created_at');
        }

        return $query->orderBy('created_at', $direction);
    }

    public function scopeRelatedToProject(Builder $query, Project $project): Builder
    {
        $taskIds = Task::query()->where('project_id', $project->id)->pluck('id');
        $eventIds = Event::query()->where('project_id', $project->id)->pluck('id');

        return $query->where(function (Builder $activityQuery) use ($project, $taskIds, $eventIds) {
            $activityQuery
                ->where(function (Builder $projectQuery) use ($project) {
                    $projectQuery
                        ->where('subject_type', Project::class)
                        ->where('subject_id', $project->id);
                })
                ->when(
                    $taskIds->isNotEmpty(),
                    fn (Builder $q) => $q->orWhere(function (Builder $taskQuery) use ($taskIds) {
                        $taskQuery
                            ->where('subject_type', Task::class)
                            ->whereIn('subject_id', $taskIds);
                    })
                )
                ->when(
                    $eventIds->isNotEmpty(),
                    fn (Builder $q) => $q->orWhere(function (Builder $eventQuery) use ($eventIds) {
                        $eventQuery
                            ->where('subject_type', Event::class)
                            ->whereIn('subject_id', $eventIds);
                    })
                );
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
