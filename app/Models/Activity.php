<?php

namespace App\Models;

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
