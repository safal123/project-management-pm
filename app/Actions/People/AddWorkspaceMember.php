<?php

namespace App\Actions\People;

use App\Models\User;
use App\Models\Workspace;

class AddWorkspaceMember
{
    public function execute(Workspace $workspace, string $email): User
    {
        $member = User::query()->where('email', $email)->firstOrFail();

        $workspace->users()->attach($member->id, [
            'role' => Workspace::ROLE_MEMBER,
        ]);

        return $member;
    }
}
