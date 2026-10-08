<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Support\Str;

class Workspace extends Pivot
{
    use HasFactory, HasUlids;

    public const ROLE_OWNER = 'owner';

    public const ROLE_ADMIN = 'admin';

    public const ROLE_MEMBER = 'member';

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
            ->belongsToMany(User::class, 'user_workspaces', 'workspace_id', 'user_id')
            ->withPivot('role')
            ->withTimestamps();
    }

    public static function resolveRole(?string $pivotRole, bool $isCreator): string
    {
        if ($isCreator) {
            return self::ROLE_OWNER;
        }

        return in_array($pivotRole, [self::ROLE_ADMIN, self::ROLE_OWNER], true)
            ? $pivotRole
            : self::ROLE_MEMBER;
    }

    public function roleFor(User $user): string
    {
        $attached = $this->relationLoaded('users')
            ? $this->users->firstWhere('id', $user->id)
            : $this->users()->where('users.id', $user->id)->first();

        return self::resolveRole($attached?->pivot?->role, $this->created_by === $user->id);
    }

    public function canManageRoles(User $user): bool
    {
        return in_array($this->roleFor($user), [self::ROLE_OWNER, self::ROLE_ADMIN], true);
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

    public static function uniqueSlugFor(string $name, ?string $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'workspace';
        $slug = $base;
        $count = 1;

        while (static::query()
            ->where('slug', $slug)
            ->when($ignoreId, fn (Builder $query) => $query->where('id', '!=', $ignoreId))
            ->exists()) {
            $slug = $base.'-'.$count;
            $count++;
        }

        return $slug;
    }
}
