<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Workspace;

class WorkspacePolicy
{
    public function viewMembers(User $user, Workspace $workspace): bool
    {
        return $this->isMember($user, $workspace);
    }

    public function viewMember(User $user, Workspace $workspace, User $person): bool
    {
        return $this->isMember($user, $workspace)
            && $this->isMember($person, $workspace);
    }

    public function addMember(User $user, Workspace $workspace): bool
    {
        return $this->isMember($user, $workspace);
    }

    public function updateMemberRole(User $user, Workspace $workspace, User $person): bool
    {
        return $workspace->canManageRoles($user)
            && $person->id !== $user->id
            && $this->isMember($person, $workspace)
            && $workspace->roleFor($person) !== Workspace::ROLE_OWNER;
    }

    private function isMember(User $user, Workspace $workspace): bool
    {
        if ($workspace->created_by === $user->id) {
            return true;
        }

        if ($workspace->relationLoaded('users')) {
            return $workspace->users->contains('id', $user->id);
        }

        return $workspace->users()->where('users.id', $user->id)->exists();
    }
}
