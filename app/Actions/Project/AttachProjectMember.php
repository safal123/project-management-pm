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
            'status' => $data['status'] ?? 'pending',
            'invited_by' => $data['invited_by'] ?? $user->id,
            'invited_at' => $data['invited_at'] ?? now(),
            'accepted_by' => $data['accepted_by'] ?? null,
            'accepted_at' => $data['accepted_at'] ?? null,
        ]);
    }
}
