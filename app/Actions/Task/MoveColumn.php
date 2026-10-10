<?php

namespace App\Actions\Task;

use App\Models\Task;
use Illuminate\Support\Facades\DB;

class MoveColumn
{
    public function __construct(private ApplyTaskOrder $applyTaskOrder) {}

    public function execute(Task $column, string $direction): void
    {
        DB::transaction(function () use ($column, $direction) {
            $columns = Task::query()
                ->where('project_id', $column->project_id)
                ->columns()
                ->orderBy('order')
                ->get();

            $from = $columns->search(fn (Task $item) => $item->id === $column->id);

            if ($from === false) {
                return;
            }

            $to = match ($direction) {
                'left' => max(0, $from - 1),
                'right' => min($columns->count() - 1, $from + 1),
                'first' => 0,
                'last' => $columns->count() - 1,
                default => $from,
            };

            if ($from === $to) {
                return;
            }

            $moved = $columns->splice($from, 1)->first();
            $columns->splice($to, 0, [$moved]);

            $this->applyTaskOrder->execute(
                $columns->values()->pluck('id')->all()
            );
        });
    }
}
