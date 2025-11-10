<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProjectCreateRequest;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;


class ProjectController extends Controller
{
    public function index()
    {
        return Inertia::render('projects/index', [
            'projects' => Project::where('workspace_id', auth()->user()->currentWorkspace()->first()->id)->get(),
        ]);
    }

    public function store(ProjectCreateRequest $request)
    {
        $validated = $request->validated();

        Project::create([
            ...$validated,
            'created_by' => auth()->user()->id,
            'slug' => Str::slug($validated['name']) . '-' . Str::random(6),
            'workspace_id' => auth()->user()->currentWorkspace()->first()->id,
        ]);

        return redirect()->back()->with('success', 'Project created successfully');
    }

    public function show(Project $project)
    {
        $tasks = Task::where('project_id', $project->id)
            ->with('parentTask', 'assignedBy', 'assignedTo', 'createdBy', 'project', 'workspace')
            ->orderBy('order')
            ->get();

        // Get workspace members
        $workspace = $project->workspace;
        $members = $workspace->users()->get();

        return Inertia::render('projects/project/index', [
            'project' => $project,
            'tasks' => $tasks,
            'members' => $members,
        ]);
    }
}
