<?php

namespace App\Http\Controllers;

use App\Http\Requests\TaskCreateRequest;
use App\Http\Requests\TaskUpdateRequest;
use App\Models\Task;
use Illuminate\Support\Str;

class TaskController extends Controller
{
    public function store(TaskCreateRequest $request)
    {
        $validated = $request->validated();
        $user = $request->user();

        Task::create([
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

        return back()->with('success', 'Task created successfully');
    }

    public function update(Task $task, TaskUpdateRequest $request)
    {
        $task->update($request->validated());

        return redirect()->back()->with('success', 'Task updated successfully');
    }

    public function destroy(Task $task)
    {
        $this->authorize('delete', $task);

        $task->delete();

        return redirect()->back()->with('success', 'Task deleted successfully');
    }
}
