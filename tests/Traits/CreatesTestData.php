<?php

namespace Tests\Traits;

use App\Models\Comment;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Str;

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

    public function createTaskForProject(User $user, Project $project, array $attributes = []): Task
    {
        return Task::query()->create([
            'title' => 'Test task',
            'slug' => Str::slug('Test task').'-'.Str::random(6),
            'project_id' => $project->id,
            'workspace_id' => $project->workspace_id,
            'created_by' => $user->id,
            'assigned_by' => $user->id,
            'status' => 'todo',
            'priority' => 'medium',
            'order' => 1,
            ...$attributes,
        ]);
    }

    public function createCommentForTask(User $user, Task $task, array $attributes = []): Comment
    {
        return Comment::query()->create([
            'user_id' => $user->id,
            'commentable_id' => $task->id,
            'commentable_type' => Task::class,
            'workspace_id' => $task->workspace_id,
            'body' => 'Test comment',
            ...$attributes,
        ]);
    }
}
