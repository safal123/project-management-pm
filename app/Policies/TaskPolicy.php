<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Policies\Concerns\ChecksProjectAccess;

class TaskPolicy
{
    use ChecksProjectAccess;

    /**
     * Determine whether the user can create models for the given project.
     */
    public function create(User $user, Project $project): bool
    {
        return $this->canAccessProjectInCurrentWorkspace($user, $project->id, $project->workspace_id);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Task $task): bool
    {
        return $this->canAccessProjectInCurrentWorkspace($user, $task->project_id, $task->workspace_id);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Task $task): bool
    {
        return $this->canAccessProjectInCurrentWorkspace($user, $task->project_id, $task->workspace_id);
    }
}
