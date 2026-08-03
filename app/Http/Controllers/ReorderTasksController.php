<?php

namespace App\Http\Controllers;

use App\Http\Requests\TaskReorderRequest;
use App\Models\Task;
use Illuminate\Support\Facades\DB;

class ReorderTasksController extends Controller
{
    public function __invoke(TaskReorderRequest $request)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($request, $validated) {
            if ($request->filled('parent_task_id') && $request->filled('moved_task_id')) {
                Task::where('id', $request->moved_task_id)
                    ->update(['parent_task_id' => $request->parent_task_id]);
            }

            $taskIds = $validated['taskIds'];

            // Batch update all task orders in a single, database-agnostic query
            // using a CASE expression instead of driver-specific syntax.
            if (! empty($taskIds)) {
                $caseStatements = [];
                $caseBindings = [];

                foreach ($taskIds as $index => $taskId) {
                    // Cast the THEN value explicitly: PDO parameters have no
                    // inherent type, and Postgres otherwise infers the whole
                    // CASE expression as text, which fails against the
                    // integer "order" column. CAST(... AS INTEGER) is
                    // standard SQL and works the same on SQLite.
                    $caseStatements[] = 'WHEN ? THEN CAST(? AS INTEGER)';
                    $caseBindings[] = $taskId;
                    $caseBindings[] = $index + 1;
                }

                $caseSql = implode(' ', $caseStatements);
                $placeholders = implode(', ', array_fill(0, count($taskIds), '?'));

                DB::statement(
                    "UPDATE tasks SET \"order\" = CASE id {$caseSql} END WHERE id IN ({$placeholders})",
                    [...$caseBindings, ...$taskIds],
                );
            }
        });

        return redirect()
            ->back()
            ->with('success', 'Tasks reordered successfully');
    }
}
