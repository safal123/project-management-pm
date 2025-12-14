<?php

namespace App\Actions\Project;

use App\Exceptions\UserAlreadyInvitedException;
use App\Models\Project;
use App\Models\User;
use App\Notifications\ProjectInvitationNotification;

class InviteProjectMember
{
    public function __construct(
        private AttachProjectMember $attachProjectMember
    ) {}

    public function execute(Project $project, User $invitedBy, User $member, $data = []): string
    {
        // Check if user is already invited to this project
        if ($project->users()->where('user_id', $member->id)->exists()) {
            throw new UserAlreadyInvitedException('User is already invited to this project.');
        }

        $this->attachProjectMember->execute($project, $member, [
            'role' => $data['role'] ?? 'member',
            'status' => $data['status'] ?? 'pending',
            'invited_by' => $invitedBy->id,
            'invited_at' => now(),
        ]);

        $member->notify(new ProjectInvitationNotification($project, $invitedBy));

        return 'Member invited successfully.';
    }
}
