<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    /** @use HasFactory<\Database\Factories\ProjectFactory> */
    use HasFactory, HasUlids;

    public $fillable = [
        'name',
        'slug',
        'description',
        'workspace_id',
        'created_by',
    ];

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'project_user')
            ->withPivot('role', 'status', 'invited_by', 'invited_at', 'accepted_at', 'rejected_at')
            ->withTimestamps();
    }

    public function getRouteKeyName()
    {
        return 'slug';
    }
}
