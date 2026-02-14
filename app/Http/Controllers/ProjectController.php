<?php

namespace App\Http\Controllers;

use App\Actions\Project\CreateProject;
use App\Actions\Project\RemoveProjectMember;
use App\Exceptions\CannotRemoveMemberException;
use App\Exceptions\ProjectCreationException;
use App\Http\Requests\ProjectCreateRequest;
use App\Http\Requests\ProjectUpdateRequest;
use App\Models\Invitation;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\TaskResource;
use App\Http\Resources\InvitationResource;

class ProjectController extends Controller
{
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        abort_if(! $user->current_workspace_id, 403, 'Please create a workspace first.');
        $projects = Project::query()
            ->forUserAndWorkspace($user, $user->currentWorkspace)
            ->get();

        return Inertia::render('projects/index', [
            'projects' => $projects,
        ]);
    }

    public function store(ProjectCreateRequest $request, CreateProject $createProject)
    {
        try {
            $validated = $request->validated();
            $project = $createProject->execute(auth()->user(), $validated);

            return redirect()
                ->route('projects.show', $project->slug)
                ->withSuccess('Project created successfully');
        } catch (ProjectCreationException $e) {
            return redirect()
                ->back()
                ->withErrors(['message' => 'Cannot create project']);
        }
    }

    public function show(Project $project)
    {
        $project->load([
            'tasks.parentTask',
            'tasks.assignedBy',
            'tasks.assignedTo',
            'tasks.createdBy',
            'tasks.project',
            'tasks.workspace',
            'tasks.media',
            'invitations',
            'invitations.invitedBy',
            'invitations.invitedTo',
        ]);

        return Inertia::render('projects/project/index', [
            'project' => ProjectResource::make($project),
            'tasks' => $project->tasks->sortBy('order')->values(),
            'invitations' => $project->invitations,
        ]);
    }

    public function update(ProjectUpdateRequest $request, Project $project)
    {
        $validated = $request->validated();

        $project->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        return redirect()
            ->back()
            ->with('success', 'Project updated successfully');
    }

    public function removeMember(
        Project $project,
        User $user,
        RemoveProjectMember $removeProjectMember
    ) {
        try {
            $message = $removeProjectMember->execute($project, $user);

            return redirect()->back()->with('success', $message);
        } catch (CannotRemoveMemberException $e) {
            return redirect()->back()->withErrors(['user' => $e->getMessage()]);
        }
    }

    public function destroy(Project $project)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        abort_if($project->created_by !== $user->id, 403, 'You are not authorized to delete this project.');

        $project->delete();

        return redirect()->route('projects.index')->with('success', 'Project deleted successfully');
    }
}
