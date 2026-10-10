<?php

namespace App\Http\Controllers;

use App\Actions\Dashboard\GetWorkspaceDashboard;
use App\Models\Workspace;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Workspace $workspace, GetWorkspaceDashboard $getWorkspaceDashboard)
    {
        abort_if(! $workspace->id, 403, 'Please create a workspace first.');

        return Inertia::render(
            'dashboard',
            $getWorkspaceDashboard->execute(Auth::user(), $workspace),
        );
    }
}
