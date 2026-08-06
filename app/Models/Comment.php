<?php

namespace App\Models;

use App\Models\Concerns\HasLikes;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Comment extends Model
{
    use HasFactory, HasLikes, HasUlids;

    public $fillable = [
        'user_id',
        'commentable_id',
        'commentable_type',
        'parent_comment_id',
        'workspace_id',
        'body',
    ];

    public function commentable(): MorphTo
    {
        return $this->morphTo();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parentComment(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_comment_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(self::class, 'parent_comment_id')->oldest();
    }

    public function scopeTopLevel(Builder $query): Builder
    {
        return $query->whereNull('parent_comment_id');
    }
}
