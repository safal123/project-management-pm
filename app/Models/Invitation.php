<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Mail;
use App\Mail\ProjectInvitationMail;

class Invitation extends Model
{
    /** @use HasFactory<\Database\Factories\InvitationFactory> */
    use HasFactory, HasUlids;

    public $fillable = [
        'workspace_id',
        'project_id',
        'invited_by',
        'invited_to',
        'email',
        'token',
        'expires_at',
        'status',
        'accepted_at',
        'rejected_at',
        'invited_at',
        'last_sent_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'invited_at' => 'datetime',
        'accepted_at' => 'datetime',
        'rejected_at' => 'datetime',
        'last_sent_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->token = Str::random(32);
            $model->expires_at = now()->addHours(24);
            $model->invited_at = now();
            $model->last_sent_at = now();
            $model->status = 'pending';
        });
    }

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function invitedBy()
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    public function invitedTo()
    {
        return $this->belongsTo(User::class, 'invited_to');
    }

    public function isExpired()
    {
        return $this->expires_at && $this->expires_at < now();
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }

    public function scopeAccepted(Builder $query): Builder
    {
        return $query->where('status', 'accepted');
    }

    public function scopeForProject(Builder $query, Project $project)
    {
        return $query->where('project_id', $project->id);
    }

    public function sendEmail()
    {
        $signedUrl = URL::temporarySignedRoute(
            'invitations.show',
            now()->addHours(24),
            ['token' => $this->token]
        );

        Mail::to($this->email)
            ->send(new ProjectInvitationMail($this, $signedUrl));
    }
}
