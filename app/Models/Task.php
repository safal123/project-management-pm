<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory, HasUlids;

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
        'assigned_by',
        'assigned_to',
        'status',
        'priority',
        'due_date',
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

    public function media()
    {
        return $this->morphMany(Media::class, 'mediable');
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
