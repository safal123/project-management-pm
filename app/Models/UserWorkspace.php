<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserWorkspace extends Model
{
    public $fillable = [
        'user_id',
        'workspace_id',
    ];

    public $table = 'user_workspaces';
}
