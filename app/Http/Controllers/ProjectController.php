<?php

namespace App\Http\Controllers;

use App\Actions\Project\CreateProject;
use App\Actions\Project\InviteProjectMember;
use App\Actions\Project\RemoveProjectMember;
use App\Actions\Project\RespondToInvitation;
use App\Exceptions\CannotRemoveMemberException;
use App\Exceptions\ProjectCreationException;
use App\Exceptions\UserAlreadyInvitedException;
use App\Http\Requests\ProjectCreateRequest;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Inertia\Inertia;
use App\Http\Requests\ProjectMemberRequest;
use App\Http\Requests\RespondToInvitationRequest;

class ProjectController extends Controller
{
    public function index()
    {
        return Inertia::render('projects/index', [
            'projects' => Project::where('workspace_id', auth()->user()->currentWorkspace()->first()->id)->get(),
        ]);
    }

    public function store(ProjectCreateRequest $request, CreateProject $createProject)
    {
        try {
            $validated = $request->validated();
            $project = $createProject->execute(auth()->user(), $validated);
            return redirect()
                ->route('projects.show', $project->slug)
                ->withSuccess("Project created successfully");
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
        $workspace = $project->workspace;
        $members = $workspace->users()->get();

        return Inertia::render('projects/project/index', [
            'project' => $project->load('users'),
            'tasks' => $tasks,
            'members' => $members,
        ]);
    }

    public function inviteMember(
        ProjectMemberRequest $request,
        Project $project,
        InviteProjectMember $inviteProjectMember
    ) {
        try {
            $user = User::where('email', $request->validated('email'))->firstOrFail();

            $message = $inviteProjectMember->execute(
                $project,
                auth()->user(),
                $user,
            );

            return redirect()->back()->with('success', $message);
        } catch (UserAlreadyInvitedException $e) {
            return redirect()->back()->withErrors(['message' => $e->getMessage()]);
        }
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

    public function respondToInvitation(
        RespondToInvitationRequest $request,
        Project $project,
        RespondToInvitation $action
    ) {
        try {
            $message = $action->execute(
                $project,
                $request->userId(),
                $request->action()
            );

            return back()->with('success', $message);
        } catch (\Exception $e) {
            return back()->withErrors(['message' => $e->getMessage()]);
        }
    }
}
