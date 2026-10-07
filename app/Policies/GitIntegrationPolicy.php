<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;
use App\Policies\Concerns\ChecksProjectAccess;

class GitIntegrationPolicy
{
    use ChecksProjectAccess;

    /**
     * Determine whether the user can connect/disconnect a git integration for the project.
     */
    public function manage(User $user, Project $project): bool
    {
        return $this->canAccessProjectInCurrentWorkspace($user, $project->id, $project->workspace_id);
    }
}
