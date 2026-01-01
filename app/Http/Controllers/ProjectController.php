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
    $tasks = Task::where('project_id', $project->id)
      ->with(
        'parentTask',
        'assignedBy',
        'assignedTo',
        'createdBy',
        'project',
        'workspace',
        'media'
      )
      ->orderBy('order')
      ->get();
    // TODO: get tasks for the project
    // $workspace = $project->workspace;
    $members = $project->users;
    $invitations = Invitation::query()
      ->forProject($project)
      ->with(['invitedBy', 'invitedTo'])
      ->get();

    return Inertia::render('projects/project/index', [
      'project' => $project->load('users'),
      'tasks' => $tasks,
      'members' => $members,
      'invitations' => $invitations,
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
