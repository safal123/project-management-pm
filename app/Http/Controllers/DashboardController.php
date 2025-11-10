<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $projects = Project::where('workspace_id', auth()->user()->currentWorkspace()->first()->id)->get();
        $workspaces = auth()->user()->workspaces;
        return Inertia::render('dashboard', [
            'projects' => $projects,
            'workspaces' => $workspaces,
        ]);
    }
}
