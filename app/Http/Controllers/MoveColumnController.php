<?php

namespace App\Http\Controllers;

use App\Actions\Task\MoveColumn;
use App\Http\Requests\ColumnMoveRequest;
use App\Models\Workspace;

class MoveColumnController extends Controller
{
    public function __invoke(Workspace $workspace, ColumnMoveRequest $request, MoveColumn $moveColumn)
    {
        $column = $request->column();
        abort_unless($column, 404);

        $moveColumn->execute($column, $request->validated('direction'));

        return redirect()->back()->with('success', 'Column moved successfully');
    }
}
