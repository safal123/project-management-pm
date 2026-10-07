<?php

namespace App\Policies;

use App\Models\Event;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Policies\Concerns\ChecksProjectAccess;
use Illuminate\Database\Eloquent\Model;

class ActivityPolicy
{
    use ChecksProjectAccess;

    /**
     * Determine whether the user can view the activity feed for the given subject.
     */
    public function view(User $user, Model $subject): bool
    {
        return match (true) {
            $subject instanceof Task => $this->canAccessProjectInCurrentWorkspace($user, $subject->project_id, $subject->workspace_id),
            $subject instanceof Project => $this->canAccessProjectInCurrentWorkspace($user, $subject->id, $subject->workspace_id),
            $subject instanceof Event => $user->current_workspace_id === $subject->workspace_id,
            default => false,
        };
    }
}
