<?php

namespace App\Actions\Project;

use App\Exceptions\CannotRemoveMemberException;
use App\Models\Project;
use App\Models\User;

class RemoveProjectMember
{
    public function execute(Project $project, User $user): string
    {
        // Check if user is a member
        if (!$project->users()->where('user_id', $user->id)->exists()) {
            throw new CannotRemoveMemberException('User is not a member of this project.');
        }

        // Prevent removing the project creator
        if ($project->created_by === $user->id) {
            throw new CannotRemoveMemberException('Cannot remove project creator.');
        }

        // Remove user from project
        $project->users()->detach($user->id);

        return 'Member removed successfully.';
    }
}
