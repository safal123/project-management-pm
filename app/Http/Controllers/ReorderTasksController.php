<?php

namespace App\Http\Controllers;

use App\Actions\Task\ReorderTasks;
use App\Http\Requests\TaskReorderRequest;
use App\Models\Workspace;

class ReorderTasksController extends Controller
{
    public function __invoke(Workspace $workspace, TaskReorderRequest $request, ReorderTasks $reorderTasks)
    {
        $validated = $request->validated();

        $reorderTasks->execute(
            $request->user(),
            $validated['taskIds'],
            $validated['moved_task_id'] ?? null,
            $validated['parent_task_id'] ?? null,
        );

        return redirect()
            ->back()
            ->with('success', 'Tasks reordered successfully');
    }
}
