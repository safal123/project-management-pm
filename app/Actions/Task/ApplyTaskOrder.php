<?php

namespace App\Actions\Task;

use Illuminate\Support\Facades\DB;

class ApplyTaskOrder
{
    /**
     * @param  list<string>  $taskIds
     */
    public function execute(array $taskIds): void
    {
        $taskIds = array_values($taskIds);

        if ($taskIds === []) {
            return;
        }

        $caseStatements = [];
        $caseBindings = [];

        foreach ($taskIds as $index => $taskId) {
            $caseStatements[] = 'WHEN ? THEN CAST(? AS INTEGER)';
            $caseBindings[] = $taskId;
            $caseBindings[] = $index + 1;
        }

        $placeholders = implode(', ', array_fill(0, count($taskIds), '?'));

        DB::statement(
            'UPDATE tasks SET "order" = CASE id '.implode(' ', $caseStatements).' END WHERE id IN ('.$placeholders.')',
            [...$caseBindings, ...$taskIds],
        );
    }
}
