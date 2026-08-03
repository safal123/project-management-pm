<?php

namespace App\Policies\Concerns;

use App\Models\Project;
use App\Models\User;

trait ChecksProjectAccess
{
    protected function canAccessProjectInCurrentWorkspace(User $user, string $projectId, string $workspaceId): bool
    {
        if ($user->current_workspace_id !== $workspaceId) {
            return false;
        }

        return Project::query()
            ->whereKey($projectId)
            ->forUser($user)
            ->exists();
    }
}
