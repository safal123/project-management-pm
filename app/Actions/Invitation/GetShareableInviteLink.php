<?php

namespace App\Actions\Invitation;

use App\Models\Invitation;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;

class GetShareableInviteLink
{
    public function execute(User $user, Workspace $workspace, ?Project $project = null): string
    {
        $invitation = Invitation::query()
            ->where('workspace_id', $workspace->id)
            ->when(
                $project,
                fn ($query) => $query->where('project_id', $project->id),
                fn ($query) => $query->whereNull('project_id'),
            )
            ->whereNull('email')
            ->pending()
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (! $invitation) {
            $invitation = Invitation::query()->create([
                'workspace_id' => $workspace->id,
                'project_id' => $project?->id,
                'invited_by' => $user->id,
                'email' => null,
            ]);

            $invitation->forceFill([
                'expires_at' => now()->addDays(7),
                'last_sent_at' => null,
            ])->save();
        }

        return $invitation->signedUrl();
    }
}
