<?php

namespace App\Actions\Dashboard;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Carbon;

class GetWorkspaceDashboard
{
    /**
     * @return array<string, mixed>
     */
    public function execute(User $user, Workspace $workspace): array
    {
        $workspaceId = $workspace->id;

        $projects = Project::query()
            ->whereWorkspaceId($workspaceId)
            ->forUser($user)
            ->with('users:id,name,avatar')
            ->get();

        $workspaces = Workspace::query()->forUser($user)->get();

        $taskStats = Task::query()
            ->where('workspace_id', $workspaceId)
            ->whereNotNull('parent_task_id', 'and')
            ->selectRaw("COALESCE(status, 'todo') as status, count(*) as count")
            ->groupByRaw("COALESCE(status, 'todo')")
            ->pluck('count', 'status')
            ->map(fn($count) => (int) $count)
            ->toArray();

        $tasksByStatus = [
            'todo' => (int) ($taskStats['todo'] ?? 0),
            'in_progress' => (int) ($taskStats['in_progress'] ?? 0),
            'done' => (int) ($taskStats['done'] ?? 0),
        ];

        $overdueCount = Task::query()
            ->where('workspace_id', $workspaceId)
            ->whereNull('parent_task_id')
            ->whereNotNull('due_date')
            ->where('due_date', '<', now()->toDateString())
            ->whereIn('status', [Task::STATUS_TODO, Task::STATUS_IN_PROGRESS])
            ->count();

        $recentTasks = Task::query()
            ->where('workspace_id', $workspaceId)
            ->whereNull('parent_task_id')
            ->with(['project:id,name,slug', 'assignedTo:id,name,avatar'])
            ->orderByDesc('updated_at')
            ->limit(8)
            ->get()
            ->map(fn(Task $task) => [
                'id' => $task->id,
                'title' => $task->title,
                'status' => $task->status,
                'priority' => $task->priority,
                'due_date' => $task->due_date,
                'project' => $task->project ? [
                    'id' => $task->project->id,
                    'name' => $task->project->name,
                    'slug' => $task->project->slug,
                ] : null,
                'assigned_to' => $task->assignedTo ? [
                    'id' => $task->assignedTo->id,
                    'name' => $task->assignedTo->name,
                    'avatar' => $task->assignedTo->avatar,
                ] : null,
                'updated_at' => $task->updated_at,
            ]);

        $tasksByProject = Project::query()
            ->whereWorkspaceId($workspaceId)
            ->forUser($user)
            ->withCount(['tasks' => fn($q) => $q->whereNull('parent_task_id')])
            ->orderByDesc('tasks_count')
            ->limit(6)
            ->get()
            ->map(fn(Project $p) => [
                'name' => $p->name,
                'total' => (int) $p->tasks_count,
                'slug' => $p->slug,
            ])
            ->values()
            ->toArray();

        return [
            'projects' => $projects,
            'workspaces' => $workspaces,
            'stats' => [
                'total_projects' => $projects->count(),
                'total_tasks' => array_sum($taskStats),
                'tasks_todo' => $tasksByStatus['todo'],
                'tasks_in_progress' => $tasksByStatus['in_progress'],
                'tasks_done' => $tasksByStatus['done'],
                'overdue_tasks' => $overdueCount,
                'total_workspaces' => $workspaces->count(),
            ],
            'tasksByStatus' => $tasksByStatus,
            'tasksByProject' => $tasksByProject,
            'taskActivity' => $this->taskActivity($workspaceId),
            'recentTasks' => $recentTasks,
        ];
    }

    /**
     * @return list<array{date: string, created: int, completed: int}>
     */
    private function taskActivity(string $workspaceId): array
    {
        $activityStart = now()->subDays(13)->startOfDay();

        $createdByDay = Task::query()
            ->where('workspace_id', $workspaceId)
            ->whereNull('parent_task_id')
            ->where('created_at', '>=', $activityStart)
            ->pluck('created_at')
            ->countBy(fn($date) => Carbon::parse($date)->toDateString());

        $completedByDay = Task::query()
            ->where('workspace_id', $workspaceId)
            ->whereNull('parent_task_id')
            ->where('status', Task::STATUS_DONE)
            ->where('updated_at', '>=', $activityStart)
            ->pluck('updated_at')
            ->countBy(fn($date) => Carbon::parse($date)->toDateString());

        return collect(range(0, 13))->map(function (int $offset) use ($createdByDay, $completedByDay) {
            $date = now()->subDays(13 - $offset)->toDateString();

            return [
                'date' => $date,
                'created' => (int) ($createdByDay[$date] ?? 0),
                'completed' => (int) ($completedByDay[$date] ?? 0),
            ];
        })->values()->all();
    }
}
