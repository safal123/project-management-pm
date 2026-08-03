<?php

namespace App\Http\Controllers;

use App\Http\Requests\TaskMoveRequest;
use App\Models\Task;
use Illuminate\Support\Facades\DB;

class MoveTaskColumnController extends Controller
{
    public function __invoke(TaskMoveRequest $request)
    {
        $validated = $request->validated();

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

            $currentIndex = $siblingTasks->search(fn ($t) => $t->order > $task->order);

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
