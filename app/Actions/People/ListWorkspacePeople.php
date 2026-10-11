<?php

namespace App\Actions\People;

use App\Models\Activity;
use App\Models\User;
use App\Models\Workspace;

class ListWorkspacePeople
{
    /**
     * @return array<string, mixed>
     */
    public function execute(Workspace $workspace, User $user, ?string $search = null): array
    {
        $search = trim((string) $search);

        $members = $workspace->users()
            ->with('media')
            ->withPivot('role', 'created_at')
            ->withCount([
                'projects as project_count' => fn ($query) => $query->where('projects.workspace_id', $workspace->id),
            ])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($memberQuery) use ($search) {
                    $memberQuery
                        ->where('users.name', 'like', '%'.$search.'%')
                        ->orWhere('users.email', 'like', '%'.$search.'%');
                });
            })
            ->orderBy('users.name')
            ->get();

        $activityCounts = Activity::query()
            ->forWorkspace($workspace->id)
            ->whereIn('user_id', $members->pluck('id'))
            ->selectRaw('user_id, count(*) as aggregate')
            ->groupBy('user_id')
            ->pluck('aggregate', 'user_id');

        return [
            'people' => $members->map(fn (User $member) => [
                'id' => $member->id,
                'name' => $member->name,
                ...$member->visibleStatus(),
                'email' => $member->email,
                'avatar' => $member->media?->url,
                'role' => Workspace::resolveRole($member->pivot?->role, $workspace->created_by === $member->id),
                'project_count' => (int) $member->project_count,
                'activity_count' => (int) ($activityCounts[$member->id] ?? 0),
                'joined_at' => $member->pivot?->created_at,
                'is_current_user' => $member->id === $user->id,
            ])->values(),
            'filters' => [
                'q' => $search,
            ],
        ];
    }
}
