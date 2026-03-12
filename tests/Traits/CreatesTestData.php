<?php

namespace Tests\Traits;

use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;

trait CreatesTestData
{
    public function createUser(array $attributes = []): User
    {
        return User::factory()->create($attributes);
    }

    public function createUserWithWorkspace(int $workspaceCount = 1): array
    {
        $user = $this->createUser();

        $workspaces = Workspace::factory()
            ->count($workspaceCount)
            ->create(['created_by' => $user->id]);

        $workspaces->each(fn (Workspace $ws) => $user->workspaces()->attach($ws->id));

        $user->current_workspace_id = $workspaces->first()->id;
        $user->saveQuietly();

        return ['user' => $user, 'workspaces' => $workspaces];
    }

    public function createProjectsForUser(User $user, Workspace $workspace, int $count = 1): \Illuminate\Database\Eloquent\Collection
    {
        $projects = Project::factory()
            ->count($count)
            ->create([
                'workspace_id' => $workspace->id,
                'created_by' => $user->id,
            ]);

        $projects->each(fn (Project $project) => $project->users()->attach($user->id, [
            'role' => 'owner',
            'joined_at' => now(),
        ]));

        return $projects;
    }
}
