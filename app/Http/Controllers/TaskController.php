<?php

namespace App\Http\Controllers;

use App\Http\Requests\TaskCreateRequest;
use App\Http\Requests\TaskUpdateRequest;
use App\Models\Activity;
use App\Models\Task;
use Illuminate\Support\Str;

class TaskController extends Controller
{
    public function store(TaskCreateRequest $request)
    {
        $validated = $request->validated();
        $user = $request->user();

        $task = Task::create([
            ...$validated,
            'created_by' => $user->id,
            'assigned_by' => $user->id,
            'workspace_id' => $user->current_workspace_id,
            'slug' => Str::slug($validated['title']).'-'.Str::lower(Str::random(6)),
            'order' => Task::nextOrder(
                $validated['project_id'],
                $validated['parent_task_id'] ?? null,
            ),
        ]);

        Activity::record($task, Activity::TYPE_CREATED, $task->workspace_id, $user);

        return back()->with('success', 'Task created successfully');
    }

    public function update(Task $task, TaskUpdateRequest $request)
    {
        $validated = $request->validated();
        $user = $request->user();

        $originalStatus = $task->status;
        $originalAssignedTo = $task->assigned_to;

        $task->update($validated);

        if (array_key_exists('status', $validated) && $validated['status'] !== $originalStatus) {
            Activity::record($task, Activity::TYPE_STATUS_CHANGED, $task->workspace_id, $user, [
                'from' => $originalStatus,
                'to' => $validated['status'],
            ]);
        }

        if (array_key_exists('assigned_to', $validated) && $validated['assigned_to'] !== $originalAssignedTo) {
            Activity::record($task, Activity::TYPE_ASSIGNED, $task->workspace_id, $user, [
                'from' => $originalAssignedTo,
                'to' => $validated['assigned_to'],
            ]);
        }

        return redirect()->back()->with('success', 'Task updated successfully');
    }

    public function destroy(Task $task)
    {
        $this->authorize('delete', $task);

        $task->delete();

        return redirect()->back()->with('success', 'Task deleted successfully');
    }
}
