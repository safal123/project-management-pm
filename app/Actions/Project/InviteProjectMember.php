<?php

namespace App\Actions\Project;

use App\Exceptions\UserAlreadyInvitedException;
use App\Models\Project;
use App\Models\User;
use App\Notifications\ProjectInvitationNotification;
use Illuminate\Support\Str;

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
            'token' => Str::random(32),
            'token_expires_at' => now()->addHours(24),
        ]);

        $member->notify(new ProjectInvitationNotification($project, $invitedBy));

        return 'Member invited successfully.';
    }
}
