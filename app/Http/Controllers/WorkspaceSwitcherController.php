<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use Illuminate\Http\Request;

class WorkspaceSwitcherController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();

        $workspace = Workspace::where('id', $request->workspace)
            ->whereHas('users', fn($q) => $q->where('user_id', $user->id))
            ->first();

        if (! $workspace) {
            return back()->with('error', 'You are not authorized to switch to this workspace');
        }

        $user
            ->currentWorkspace()
            ->associate($workspace)
            ->save();

        return redirect()
            ->intended(route('dashboard'))
            ->with('success', 'Workspace switched successfully');
    }
}
