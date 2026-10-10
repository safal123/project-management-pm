<?php

namespace App\Actions\Task;

use App\Models\Activity;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ReorderTasks
{
    public function __construct(private ApplyTaskOrder $applyTaskOrder) {}

    /**
     * @param  list<string>  $taskIds
     */
    public function execute(User $user, array $taskIds, ?string $movedTaskId = null, ?string $parentTaskId = null): void
    {
        DB::transaction(function () use ($user, $taskIds, $movedTaskId, $parentTaskId) {
            if ($movedTaskId && $parentTaskId) {
                $this->moveToColumn($user, $movedTaskId, $parentTaskId);
            }

            $this->applyTaskOrder->execute($taskIds);
        });
    }

    private function moveToColumn(User $user, string $taskId, string $parentTaskId): void
    {
        $task = Task::query()->find($taskId);

        if (! $task || $task->parent_task_id === $parentTaskId) {
            return;
        }

        $fromColumn = $task->parent_task_id
            ? Task::query()->find($task->parent_task_id)
            : null;
        $toColumn = Task::query()->find($parentTaskId);

        $task->update(['parent_task_id' => $parentTaskId]);

        Activity::record($task, Activity::TYPE_MOVED, $task->workspace_id, $user, [
            'from' => $fromColumn?->title,
            'to' => $toColumn?->title,
        ]);
    }
}
