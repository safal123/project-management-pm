<?php

namespace App\Http\Controllers;

use App\Http\Requests\TaskCreateRequest;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TaskController extends Controller
{
    public function store(TaskCreateRequest $request)
    {
        $validated = $request->validated();

        // Calculate the order position (append to end of list)
        $maxOrder = Task::where('project_id', $validated['project_id'])
            ->when(isset($validated['parent_task_id']), function ($query) use ($validated) {
                return $query->where('parent_task_id', $validated['parent_task_id']);
            }, function ($query) {
                return $query->whereNull('parent_task_id');
            })
            ->max('order');

        $data = [
            ...$validated,
            'created_by' => auth()->user()->id,
            'slug' => Str::slug($validated['title']) . '-' . Str::random(6),
            'assigned_by' => auth()->user()->id,
            'order' => ($maxOrder ?? 0) + 1,
        ];

        // Parse due_date if provided (handle ISO 8601 format from frontend)
        if (isset($validated['due_date']) && $validated['due_date']) {
            $data['due_date'] = Carbon::parse($validated['due_date']);
        }

        Task::create($data);

        return redirect()->back()->with('success', 'Task created successfully');
    }

    public function update(Task $task, Request $request)
    {
        $validated = $request->only(['title', 'assigned_to', 'due_date', 'status', 'description', 'priority', 'parent_task_id', 'order']);

        // Parse due_date if provided (handle ISO 8601 format from frontend)
        if (isset($validated['due_date']) && $validated['due_date']) {
            $validated['due_date'] = Carbon::parse($validated['due_date']);
        }

        $task->update($validated);

        return redirect()->back()->with('success', 'Task updated successfully');
    }

    public function destroy(Task $task)
    {
        $task->delete();

        return redirect()->back()->with('success', 'Task deleted successfully');
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'taskIds' => 'required|array',
            'taskIds.*' => 'exists:tasks,id',
            'sourceColumnId' => 'nullable|exists:tasks,id',
            'targetColumnId' => 'nullable|exists:tasks,id',
            'moved_task_id' => 'nullable|exists:tasks,id',
            'parent_task_id' => 'nullable|exists:tasks,id',
            'orderType' => 'nullable|string|in:column,task',
        ]);

        // Debug: Log what we received
        Log::info('Reorder request data:', [
            'all' => $request->all(),
            'parent_task_id_filled' => $request->filled('parent_task_id'),
            'moved_task_id_filled' => $request->filled('moved_task_id'),
            'parent_task_id_value' => $request->parent_task_id,
            'moved_task_id_value' => $request->moved_task_id,
        ]);

        DB::transaction(function () use ($request, $validated) {
            // If moving a task across columns, update the parent_task_id first
            if ($request->filled('parent_task_id') && $request->filled('moved_task_id')) {
                Log::info('Updating parent_task_id:', [
                    'task_id' => $request->moved_task_id,
                    'new_parent' => $request->parent_task_id
                ]);

                Task::where('id', $request->moved_task_id)
                    ->update(['parent_task_id' => $request->parent_task_id]);
            } else {
                Log::warning('Skipped parent_task_id update', [
                    'parent_filled' => $request->filled('parent_task_id'),
                    'moved_filled' => $request->filled('moved_task_id'),
                ]);
            }

            // Update the order for all tasks in the list
            $taskIds = $validated['taskIds'];

            if (!empty($taskIds)) {
                $caseSql = '';
                foreach ($taskIds as $index => $taskId) {
                    $order = $index + 1;
                    $safeId = addslashes($taskId);
                    $caseSql .= "WHEN id = '$safeId' THEN $order ";
                }

                $ids = implode(',', array_map(fn($id) => "'" . addslashes($id) . "'", $taskIds));
                DB::update("UPDATE tasks SET `order` = CASE $caseSql END WHERE id IN ($ids)");
            }
        });

        return redirect()
            ->back()
            ->with('success', 'Tasks reordered successfully');
    }
}
