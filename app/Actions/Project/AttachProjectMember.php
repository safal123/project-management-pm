<?php

namespace App\Actions\Project;

use App\Models\Project;
use App\Models\User;

class AttachProjectMember
{
    public function execute(Project $project, User $user, $data)
    {
        return $project->users()->attach($user->id, [
            'role' => $data['role'] ?? 'member',
        ]);
    }
}
