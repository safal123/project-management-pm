<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Workspace;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $workspaceId = $user->currentWorkspaceId();

        abort_if(! $workspaceId, 403, 'Please create a workspace first.');

        return Inertia::render('dashboard', [
            'projects' => Project::query()
                ->whereWorkspaceId($workspaceId)
                ->forUser($user)
                ->with('users:id,name,avatar')
                ->get(),

            'workspaces' => Workspace::query()
                ->forUser($user)
                ->get(),
        ]);
    }
}
