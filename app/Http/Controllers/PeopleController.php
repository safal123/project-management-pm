<?php

namespace App\Http\Controllers;

use App\Http\Resources\ActivityResource;
use App\Models\Activity;
use App\Models\Event;
use App\Models\Invitation;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PeopleController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = Auth::user();
        $workspaceId = $user->currentWorkspaceId();

        abort_if(! $workspaceId, 403, 'Please create a workspace first.');

        $search = trim((string) $request->get('q', ''));
        $workspace = $user->currentWorkspace;

        $members = $workspace->users()
            ->with('media')
            ->withPivot('role', 'created_at')
            ->withCount([
                'projects as project_count' => fn ($query) => $query->where('projects.workspace_id', $workspaceId),
            ])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($memberQuery) use ($search) {
                    $memberQuery
                        ->where('users.name', 'like', '%'.$search.'%')
                        ->orWhere('users.email', 'like', '%'.$search.'%');
                });
            })
            ->orderBy('users.name')
            ->get();

        $activityCounts = Activity::query()
            ->forWorkspace($workspaceId)
            ->whereIn('user_id', $members->pluck('id'))
            ->selectRaw('user_id, count(*) as aggregate')
            ->groupBy('user_id')
            ->pluck('aggregate', 'user_id');

        return Inertia::render('people/index', [
            'people' => $members->map(fn (User $member) => [
                'id' => $member->id,
                'name' => $member->name,
                'email' => $member->email,
                'avatar' => $member->media?->url,
                'role' => Workspace::resolveRole($member->pivot?->role, $workspace->created_by === $member->id),
                'project_count' => (int) $member->project_count,
                'activity_count' => (int) ($activityCounts[$member->id] ?? 0),
                'joined_at' => $member->pivot?->created_at,
                'is_current_user' => $member->id === $user->id,
            ])->values(),
            'filters' => [
                'q' => $search,
            ],
            'invite_link' => Invitation::shareableWorkspaceLinkFor($workspace, $user),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        /** @var User $authUser */
        $authUser = Auth::user();
        $workspaceId = $authUser->currentWorkspaceId();

        abort_if(! $workspaceId, 403, 'Please create a workspace first.');

        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $member = User::query()->where('email', $validated['email'])->first();

        if (! $member) {
            return redirect()
                ->back()
                ->withErrors(['email' => 'No account exists with this email. Invite them instead.']);
        }

        if ($member->workspaces()->where('workspaces.id', $workspaceId)->exists()) {
            return redirect()
                ->back()
                ->withErrors(['email' => 'This person is already a member of the workspace.']);
        }

        $authUser->currentWorkspace->users()->attach($member->id, [
            'role' => Workspace::ROLE_MEMBER,
        ]);

        return redirect()
            ->back()
            ->withSuccess($member->name.' was added to the workspace.');
    }

    public function show(User $person): Response
    {
        /** @var User $user */
        $user = Auth::user();
        $workspaceId = $this->authorizePerson($person, $user);

        $person->load('media');
        $workspace = $user->currentWorkspace;

        $projects = $person->projects()
            ->where('projects.workspace_id', $workspaceId)
            ->orderBy('name')
            ->get()
            ->map(fn (Project $project) => [
                'id' => $project->id,
                'name' => $project->name,
                'slug' => $project->slug,
                'description' => $project->description,
                'role' => $project->pivot?->role ?? 'member',
            ]);

        $assignedTasks = Task::query()
            ->where('workspace_id', $workspaceId)
            ->where('assigned_to', $person->id)
            ->whereNotNull('parent_task_id')
            ->count();

        $activities = $this->personActivities($person, $workspaceId);

        $membership = $person->workspaces()
            ->where('workspaces.id', $workspaceId)
            ->first();

        $role = $workspace->roleFor($person);
        $activityCount = Activity::query()
            ->forWorkspace($workspaceId)
            ->where('user_id', $person->id)
            ->count();
        $lastActiveAt = Activity::query()
            ->forWorkspace($workspaceId)
            ->where('user_id', $person->id)
            ->latest()
            ->value('created_at');

        return Inertia::render('people/show', [
            'person' => [
                'id' => $person->id,
                'name' => $person->name,
                'email' => $person->email,
                'avatar' => $person->media?->url,
                'role' => $role,
                'joined_at' => $membership?->pivot?->created_at,
                'last_active_at' => $lastActiveAt,
                'is_current_user' => $person->id === $user->id,
            ],
            'can_manage_roles' => $workspace->canManageRoles($user)
                && $person->id !== $user->id
                && $role !== Workspace::ROLE_OWNER,
            'stats' => [
                'projects' => $projects->count(),
                'tasks' => $assignedTasks,
                'activities' => $activityCount,
            ],
            'projects' => $projects,
            'activities' => [
                'data' => ActivityResource::collection($activities->getCollection())->resolve(),
                'meta' => [
                    'current_page' => $activities->currentPage(),
                    'last_page' => $activities->lastPage(),
                    'has_more' => $activities->hasMorePages(),
                ],
            ],
        ]);
    }

    public function activities(Request $request, User $person): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();
        $workspaceId = $this->authorizePerson($person, $user);

        $activities = $this->personActivities($person, $workspaceId, $request->integer('page', 1));

        return response()->json([
            'data' => ActivityResource::collection($activities->getCollection())->resolve(),
            'meta' => [
                'current_page' => $activities->currentPage(),
                'last_page' => $activities->lastPage(),
                'has_more' => $activities->hasMorePages(),
            ],
        ]);
    }

    public function update(Request $request, User $person): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();
        $this->authorizePerson($person, $user);
        $workspace = $user->currentWorkspace;

        abort_unless($workspace->canManageRoles($user), 403);
        abort_if($person->id === $user->id, 403, 'You cannot change your own role.');
        abort_if($workspace->roleFor($person) === Workspace::ROLE_OWNER, 403, 'The workspace owner role cannot be changed.');

        $validated = $request->validate([
            'role' => ['required', Rule::in([Workspace::ROLE_ADMIN, Workspace::ROLE_MEMBER])],
        ]);

        $workspace->users()->updateExistingPivot($person->id, [
            'role' => $validated['role'],
        ]);

        return redirect()
            ->back()
            ->withSuccess($person->name.' is now a '.$validated['role'].'.');
    }

    protected function authorizePerson(User $person, User $user): string
    {
        $workspaceId = $user->currentWorkspaceId();

        abort_if(! $workspaceId, 403, 'Please create a workspace first.');
        abort_unless(
            $person->workspaces()->where('workspaces.id', $workspaceId)->exists(),
            403,
        );

        return $workspaceId;
    }

    /**
     * @return LengthAwarePaginator<int, Activity>
     */
    protected function personActivities(User $person, string $workspaceId, int $page = 1): LengthAwarePaginator
    {
        $activities = Activity::query()
            ->forWorkspace($workspaceId)
            ->where('user_id', $person->id)
            ->with(['user.media'])
            ->latest()
            ->paginate(8, ['*'], 'page', $page);

        $activities->getCollection()->load([
            'subject' => function (MorphTo $morphTo) {
                $morphTo->morphWith([
                    Task::class => ['project:id,name,slug'],
                    Event::class => ['project:id,name,slug'],
                ]);
            },
        ]);

        return $activities;
    }
}
