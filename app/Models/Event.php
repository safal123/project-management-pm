<?php

namespace App\Models;

use App\Models\Concerns\HasActivities;
use App\Models\Concerns\HasLikes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Event extends Model
{
    use HasActivities, HasFactory, HasLikes, HasUlids;

    public $fillable = [
        'title',
        'description',
        'start_date',
        'end_date',
        'location',
        'type',
        'completed_at',
        'created_by',
        'updated_by',
        'workspace_id',
        'project_id',
    ];

    protected $casts = [
        'start_date'   => 'datetime',
        'end_date'     => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function attendees()
    {
        return $this->belongsToMany(User::class, 'event_user')
            ->withPivot('status', 'responded_at')
            ->withTimestamps();
    }
}
