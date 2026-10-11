<?php

namespace App\Actions\People;

use App\Models\Activity;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Models\Workspace;

class GetPersonProfile
{
    public function __construct(private ListPersonActivities $listPersonActivities) {}

    /**
     * @return array<string, mixed>
     */
    public function execute(User $viewer, User $person, Workspace $workspace): array
    {
        $person->load('media');

        $projects = $person->projects()
            ->where('projects.workspace_id', $workspace->id)
            ->orderBy('name')
            ->get()
            ->map(fn (Project $project) => [
                'id' => $project->id,
                'name' => $project->name,
                'slug' => $project->slug,
                'description' => $project->description,
                'role' => $project->pivot?->role ?? 'member',
            ]);

        $assignedTasks = Task::query()
            ->where('workspace_id', $workspace->id)
            ->where('assigned_to', $person->id)
            ->whereNotNull('parent_task_id')
            ->count();

        $membership = $person->workspaces()
            ->where('workspaces.id', $workspace->id)
            ->first();

        $role = $workspace->roleFor($person);
        $activityCount = Activity::query()
            ->forWorkspace($workspace->id)
            ->where('user_id', $person->id)
            ->count();
        $lastActiveAt = Activity::query()
            ->forWorkspace($workspace->id)
            ->where('user_id', $person->id)
            ->latest()
            ->value('created_at');

        return [
            'person' => [
                'id' => $person->id,
                'name' => $person->name,
                ...$person->visibleStatus(),
                'email' => $person->email,
                'avatar' => $person->media?->url,
                'role' => $role,
                'joined_at' => $membership?->pivot?->created_at,
                'last_active_at' => $lastActiveAt,
                'is_current_user' => $person->id === $viewer->id,
            ],
            'can_manage_roles' => $workspace->canManageRoles($viewer)
                && $person->id !== $viewer->id
                && $role !== Workspace::ROLE_OWNER,
            'stats' => [
                'projects' => $projects->count(),
                'tasks' => $assignedTasks,
                'activities' => $activityCount,
            ],
            'projects' => $projects,
            'activities' => $this->listPersonActivities->execute($person, $workspace),
        ];
    }
}
