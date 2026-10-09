<?php

namespace App\Http\Controllers;

use App\Http\Requests\TaskCreateRequest;
use App\Http\Requests\TaskUpdateRequest;
use App\Models\Activity;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Carbon;
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

        if (! empty($validated['parent_task_id'])) {
            $parent = Task::query()->find($validated['parent_task_id']);

            if ($parent?->parent_task_id) {
                Activity::record($parent, Activity::TYPE_SUBTASK_ADDED, $parent->workspace_id, $user, [
                    'title' => $task->title,
                    'subtask_id' => $task->id,
                ]);
            }
        }

        return back()->with('success', 'Task created successfully');
    }

    public function update(Task $task, TaskUpdateRequest $request)
    {
        $validated = $request->validated();
        $user = $request->user();

        $originalStatus = $task->status;
        $originalAssignedTo = $task->assigned_to;
        $originalTitle = $task->title;
        $originalDueDate = $task->due_date?->toDateString();
        $originalDependsOn = $task->depends_on_task_id;

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
                'from_name' => $originalAssignedTo ? User::query()->find($originalAssignedTo)?->name : null,
                'to_name' => $validated['assigned_to'] ? User::query()->find($validated['assigned_to'])?->name : null,
            ]);
        }

        if (array_key_exists('title', $validated) && $validated['title'] !== $originalTitle) {
            Activity::record($task, Activity::TYPE_TITLE_CHANGED, $task->workspace_id, $user, [
                'from' => $originalTitle,
                'to' => $validated['title'],
            ]);
        }

        if (array_key_exists('due_date', $validated)) {
            $newDueDate = $validated['due_date']
                ? Carbon::parse($validated['due_date'])->toDateString()
                : null;

            if ($newDueDate !== $originalDueDate) {
                Activity::record($task, Activity::TYPE_DUE_DATE_CHANGED, $task->workspace_id, $user, [
                    'from' => $originalDueDate,
                    'to' => $newDueDate,
                ]);
            }
        }

        if (array_key_exists('depends_on_task_id', $validated) && $validated['depends_on_task_id'] !== $originalDependsOn) {
            Activity::record($task, Activity::TYPE_DEPENDENCY_CHANGED, $task->workspace_id, $user, [
                'from' => $originalDependsOn,
                'to' => $validated['depends_on_task_id'],
                'from_title' => $originalDependsOn ? Task::query()->find($originalDependsOn)?->title : null,
                'to_title' => $validated['depends_on_task_id'] ? Task::query()->find($validated['depends_on_task_id'])?->title : null,
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
