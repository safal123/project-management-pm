<?php

namespace App\Http\Controllers;

use App\Actions\Project\CreateProject;
use App\Actions\Project\RemoveProjectMember;
use App\Exceptions\CannotRemoveMemberException;
use App\Exceptions\ProjectCreationException;
use App\Http\Requests\ProjectCreateRequest;
use App\Http\Requests\ProjectUpdateRequest;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\TaskResource;
use App\Models\Invitation;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
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

    public function show(Project $project, Request $request)
    {
        /** @var User $user */
        $user = Auth::user();
        abort_unless(
            $user->workspaces()->where('workspaces.id', $project->workspace_id)->exists(),
            403,
        );

        $userId = $user->id;

        $project->load([
            'createdBy',
            'invitations' => fn ($q) => $q
                ->whereNotNull('email')
                ->where('expires_at', '>=', now())
                ->with([
                    'invitedBy',
                    'invitedTo',
                ]),
            'gitIntegration.connectedBy',
            'workspace.users' => fn ($q) => $q
                ->with('media')
                ->orderBy('users.name'),
        ]);

        $project->setRelation('users', $project->workspace?->users ?? collect());

        $taskQuery = Task::query()
            ->where('project_id', $project->id)
            ->with([
                'assignedTo',
                'assignedTo.media',
                'media',
                'parentTask:id,title,parent_task_id',
                'dependsOn:id,title',
            ])
            ->withCount([
                'likes',
                'likes as is_liked_by_user' => fn ($q) => $q->where('user_id', $userId),
                'comments',
            ])
            ->orderBy('order');

        $paginatedTasks = $request->get('tab') === 'table'
            ? (clone $taskQuery)
                ->whereHas('parentTask', fn ($query) => $query->whereNull('parent_task_id'))
                ->paginate(10)
                ->withQueryString()
            : null;

        $payload = [
            'project' => ProjectResource::make($project),
            'invite_link' => Invitation::shareableLinkFor($project, $user),
            'tasks' => TaskResource::collection((clone $taskQuery)->get()),
            'paginatedTasks' => $paginatedTasks
                ? TaskResource::collection($paginatedTasks)
                : null,
        ];

        if ($request->get('tab') === 'calendar') {
            $payload = array_merge($payload, app(CalendarController::class)->payload($request, $project));
        }

        return Inertia::render('projects/project/index', $payload);
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
