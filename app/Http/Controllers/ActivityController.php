<?php

namespace App\Http\Controllers;

use App\Http\Resources\ActivityResource;
use App\Models\Activity;
use App\Models\Event;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ActivityController extends Controller
{
    /**
     * Polymorphic model map — extend this when adding activity logging to new entities.
     */
    public const SUBJECT_MODELS = [
        'task' => Task::class,
        'project' => Project::class,
        'event' => Event::class,
    ];

    /**
     * Workspace activity timeline for the current workspace.
     */
    public function workspace(Request $request): Response
    {
        /** @var User $user */
        $user = Auth::user();
        $workspaceId = $user->currentWorkspaceId();

        abort_if(! $workspaceId, 403, 'Please create a workspace first.');

        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'type' => ['nullable', 'string', Rule::in(Activity::TYPES)],
            'subject' => ['nullable', 'string', Rule::in(array_keys(self::SUBJECT_MODELS))],
            'project_id' => ['nullable', 'string', 'exists:projects,id'],
            'user_id' => ['nullable', 'string', 'exists:users,id'],
            'sort' => ['nullable', 'string', Rule::in(['created_at', 'type', 'user'])],
            'direction' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
        ]);

        $sort = $filters['sort'] ?? 'created_at';
        $direction = $filters['direction'] ?? 'desc';
        $search = trim((string) ($filters['q'] ?? ''));

        $query = Activity::query()
            ->forWorkspace($workspaceId)
            ->with(['user.media']);

        if ($search !== '') {
            $query->where(function ($activityQuery) use ($search) {
                $activityQuery
                    ->where('type', 'like', '%'.$search.'%')
                    ->orWhereHas('user', fn ($userQuery) => $userQuery->where('name', 'like', '%'.$search.'%'));
            });
        }

        if (! empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (! empty($filters['subject'])) {
            $query->where('subject_type', self::SUBJECT_MODELS[$filters['subject']]);
        }

        if (! empty($filters['project_id'])) {
            $project = Project::query()
                ->whereKey($filters['project_id'])
                ->where('workspace_id', $workspaceId)
                ->first();

            if ($project) {
                $query->relatedToProject($project);
            }
        }

        if (! empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if ($sort === 'user') {
            $query->orderBy(
                User::query()->select('name')->whereColumn('users.id', 'activities.user_id'),
                $direction,
            )->orderByDesc('activities.created_at');
        } elseif ($sort === 'type') {
            $query->orderBy('type', $direction)->orderByDesc('created_at');
        } else {
            $query->orderBy('created_at', $direction);
        }

        $workspace = $user->currentWorkspace;
        $projects = Project::query()
            ->forUserAndWorkspace($user, $workspace)
            ->orderBy('name')
            ->get(['id', 'name']);

        $members = $workspace
            ? $workspace->users()->orderBy('name')->get(['users.id', 'users.name'])
            : collect();

        $activities = $query
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('activity/index', [
            'activities' => ActivityResource::collection($this->withSubjects($activities)),
            'filters' => [
                'q' => $search ?? '',
                'type' => $filters['type'] ?? '',
                'subject' => $filters['subject'] ?? '',
                'project_id' => $filters['project_id'] ?? '',
                'user_id' => $filters['user_id'] ?? '',
                'sort' => $sort,
                'direction' => $direction,
            ],
            'filterOptions' => [
                'types' => Activity::TYPES,
                'subjects' => array_keys(self::SUBJECT_MODELS),
                'projects' => $projects,
                'users' => $members,
            ],
        ]);
    }

    /**
     * List the activity feed for a subject, project, or workspace, newest first.
     */
    public function index(Request $request)
    {
        $scope = $request->input('scope');

        if ($scope === 'workspace') {
            return $this->workspaceFeed();
        }

        if ($scope === 'project') {
            return $this->projectFeed($request);
        }

        $request->validate([
            'subject_type' => ['required', 'string', Rule::in(array_keys(self::SUBJECT_MODELS))],
            'subject_id' => ['required', 'string'],
        ]);

        $modelClass = self::SUBJECT_MODELS[$request->string('subject_type')->toString()];
        $subject = $modelClass::query()->findOrFail($request->input('subject_id'));

        $this->authorize('view', [Activity::class, $subject]);

        $activities = $subject->activities()->with(['user.media'])->get();

        return ActivityResource::collection($this->withSubjects($activities));
    }

    protected function workspaceFeed()
    {
        /** @var User $user */
        $user = Auth::user();
        $workspaceId = $user->currentWorkspaceId();

        abort_if(! $workspaceId, 403, 'Please create a workspace first.');

        $activities = Activity::query()
            ->forWorkspace($workspaceId)
            ->with(['user.media'])
            ->latest()
            ->limit(80)
            ->get();

        return ActivityResource::collection($this->withSubjects($activities));
    }

    protected function projectFeed(Request $request)
    {
        $request->validate([
            'project_id' => ['required', 'string', 'exists:projects,id'],
        ]);

        $project = Project::query()->findOrFail($request->input('project_id'));

        $this->authorize('view', [Activity::class, $project]);

        $activities = Activity::query()
            ->forWorkspace($project->workspace_id)
            ->relatedToProject($project)
            ->with(['user.media'])
            ->latest()
            ->limit(80)
            ->get();

        return ActivityResource::collection($this->withSubjects($activities));
    }

    /**
     * @param  \Illuminate\Support\Collection<int, Activity>  $activities
     * @return \Illuminate\Support\Collection<int, Activity>
     */
    protected function withSubjects($activities)
    {
        $activities->load([
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
