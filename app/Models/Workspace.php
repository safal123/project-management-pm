<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;

class Workspace extends Pivot
{
    use HasUlids, HasFactory;

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

    // owner
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
