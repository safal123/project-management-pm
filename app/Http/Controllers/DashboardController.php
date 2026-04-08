<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\Workspace;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $workspaceId = $user->currentWorkspaceId();

        abort_if(! $workspaceId, 403, 'Please create a workspace first.');

        $projects = Project::query()
            ->whereWorkspaceId($workspaceId)
            ->forUser($user)
            ->with('users:id,name,avatar')
            ->get();

        $taskStats = Task::query()
            ->where('workspace_id', $workspaceId)
            ->whereNotNull('parent_task_id')
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
        $totalTasks = array_sum($taskStats);

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

        return Inertia::render('dashboard', [
            'projects' => $projects,
            'workspaces' => Workspace::query()->forUser($user)->get(),
            'stats' => [
                'total_projects' => $projects->count(),
                'total_tasks' => $totalTasks,
                'tasks_todo' => $tasksByStatus['todo'],
                'tasks_in_progress' => $tasksByStatus['in_progress'],
                'tasks_done' => $tasksByStatus['done'],
                'overdue_tasks' => $overdueCount,
                'total_workspaces' => Workspace::query()->forUser($user)->count(),
            ],
            'tasksByStatus' => $tasksByStatus,
            'tasksByProject' => $tasksByProject,
            'recentTasks' => $recentTasks,
        ]);
    }
}
