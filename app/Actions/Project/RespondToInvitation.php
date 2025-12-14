<?php

namespace App\Actions\Project;

use App\Exceptions\InvalidInvitationException;
use App\Models\Project;
use Illuminate\Support\Facades\DB;

class RespondToInvitation
{
    public function execute(Project $project, string $userId, string $action): string
    {
        $member = $project->users()->where('user_id', $userId)->first();

        if (!$member || $member->pivot->status !== 'pending') {
            throw new InvalidInvitationException("Invalid invitation.");
        }

        return DB::transaction(function () use ($project, $userId, $action) {

            if ($action === 'accept') {
                $project->users()->updateExistingPivot($userId, [
                    'status' => 'accepted',
                    'accepted_at' => now(),
                ]);

                return "Invitation accepted successfully.";
            }

            $project->users()->detach($userId);
            return "Invitation rejected successfully.";
        });
    }
}
