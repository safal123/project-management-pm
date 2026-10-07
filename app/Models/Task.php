<?php

namespace App\Models;

use App\Models\Concerns\HasActivities;
use App\Models\Concerns\HasComments;
use App\Models\Concerns\HasLikes;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @method bool update(array<string, mixed> $attributes = [], array<string, mixed> $options = [])
 */
class Task extends Model
{
    use HasActivities, HasComments, HasFactory, HasLikes, HasUlids;

    // Status constants
    public const STATUS_TODO = 'todo';

    public const STATUS_IN_PROGRESS = 'in_progress';

    public const STATUS_DONE = 'done';

    // Priority constants
    public const PRIORITY_LOW = 'low';

    public const PRIORITY_MEDIUM = 'medium';

    public const PRIORITY_HIGH = 'high';

    public $fillable = [
        'title',
        'description',
        'project_id',
        'workspace_id',
        'created_by',
        'slug',
        'color',
        'order',
        'progress',
        'parent_task_id',
        'depends_on_task_id',
        'assigned_by',
        'assigned_to',
        'status',
        'priority',
        'due_date',
        'branch_name',
        'branch_url',
        'branch_created_by',
        'branch_created_at',
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'branch_created_at' => 'datetime',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function parentTask()
    {
        return $this->belongsTo(Task::class, 'parent_task_id');
    }

    public function dependsOn()
    {
        return $this->belongsTo(Task::class, 'depends_on_task_id');
    }

    public function branchCreatedBy()
    {
        return $this->belongsTo(User::class, 'branch_created_by');
    }

    public function media()
    {
        return $this->morphMany(Media::class, 'mediable');
    }

    /**
     * Next order value for a task within a project column or parent task group.
     */
    public static function nextOrder(string $projectId, ?string $parentTaskId): int
    {
        return static::where('project_id', $projectId)
            ->where('parent_task_id', $parentTaskId)
            ->max('order') + 1;
    }

    /**
     * Get all available status options
     */
    public static function getStatusOptions(): array
    {
        return [
            self::STATUS_TODO,
            self::STATUS_IN_PROGRESS,
            self::STATUS_DONE,
        ];
    }

    /**
     * Get all available priority options
     */
    public static function getPriorityOptions(): array
    {
        return [
            self::PRIORITY_LOW,
            self::PRIORITY_MEDIUM,
            self::PRIORITY_HIGH,
        ];
    }
}
