<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;

class Workspace extends Pivot
{
    use HasFactory, HasUlids;

    public $fillable = [
        'name',
        'slug',
        'description',
        'logo',
        'created_by',
    ];

    public $table = 'workspaces';

    public function users()
    {
        return $this
            ->belongsToMany(User::class, 'user_workspaces', 'workspace_id', 'user_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->whereHas('users', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        });
    }
}
