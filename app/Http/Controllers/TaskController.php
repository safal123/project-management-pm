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
            'workspace_id' => auth()->user()->currentWorkspace()->first()->id,
            'project_id' => $validated['project_id'],
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

        DB::transaction(function () use ($request, $validated) {
            if ($request->filled('parent_task_id') && $request->filled('moved_task_id')) {
                Task::where('id', $request->moved_task_id)
                    ->update(['parent_task_id' => $request->parent_task_id]);
            }

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

    public function move(Request $request)
    {
        $validated = $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'direction' => 'required|string|in:left,right,first,last',
        ]);

        $task = Task::findOrFail($validated['task_id']);

        // Only allow moving parent tasks (columns)
        if ($task->parent_task_id !== null) {
            return redirect()->back()->with('error', 'Only columns can be moved');
        }

        DB::transaction(function () use ($task, $validated) {
            $siblingTasks = Task::where('project_id', $task->project_id)
                ->whereNull('parent_task_id')
                ->where('id', '!=', $task->id)
                ->orderBy('order')
                ->get();

            $currentIndex = $siblingTasks->search(fn($t) => $t->order > $task->order);

            if ($currentIndex === false) {
                $currentIndex = $siblingTasks->count();
            }

            switch ($validated['direction']) {
                case 'left':
                    if ($currentIndex > 0) {
                        $targetTask = $siblingTasks[$currentIndex - 1];
                        $newOrder = $targetTask->order;
                        $targetTask->update(['order' => $task->order]);
                        $task->update(['order' => $newOrder]);
                    }
                    break;

                case 'right':
                    if ($currentIndex < $siblingTasks->count()) {
                        $targetTask = $siblingTasks[$currentIndex];
                        $newOrder = $targetTask->order;
                        $targetTask->update(['order' => $task->order]);
                        $task->update(['order' => $newOrder]);
                    }
                    break;

                case 'first':
                    $minOrder = Task::where('project_id', $task->project_id)
                        ->whereNull('parent_task_id')
                        ->min('order') ?? 0;
                    $task->update(['order' => $minOrder - 1]);
                    break;

                case 'last':
                    $maxOrder = Task::where('project_id', $task->project_id)
                        ->whereNull('parent_task_id')
                        ->max('order') ?? 0;
                    $task->update(['order' => $maxOrder + 1]);
                    break;
            }

            // Reorder all parent tasks to ensure sequential ordering
            $allParentTasks = Task::where('project_id', $task->project_id)
                ->whereNull('parent_task_id')
                ->orderBy('order')
                ->get();

            foreach ($allParentTasks as $index => $parentTask) {
                $parentTask->update(['order' => $index + 1]);
            }
        });

        return redirect()->back()->with('success', 'Column moved successfully');
    }
}
