<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectIntegration extends Model
{
    use HasFactory, HasUlids;

    public const PROVIDER_GITHUB = 'github';

    public $fillable = [
        'project_id',
        'provider',
        'repo_full_name',
        'repo_url',
        'default_branch',
        'access_token',
        'connected_by',
    ];

    protected $casts = [
        'access_token' => 'encrypted',
    ];

    protected $hidden = [
        'access_token',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function connectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'connected_by');
    }

    public function maskedToken(): string
    {
        return '••••'.substr($this->access_token, -4);
    }
}
