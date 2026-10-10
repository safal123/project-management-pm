<?php

namespace App\Http\Controllers;

use App\Actions\Activity\GetActivityFeed;
use App\Actions\Activity\ListWorkspaceActivities;
use App\Http\Requests\WorkspaceActivityRequest;
use App\Models\Activity;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ActivityController extends Controller
{
    /**
     * Workspace activity timeline for the current workspace.
     */
    public function workspace(
        Workspace $workspace,
        WorkspaceActivityRequest $request,
        ListWorkspaceActivities $listWorkspaceActivities,
    ): Response {
        return Inertia::render(
            'activity/index',
            $listWorkspaceActivities->execute($workspace, $request->user(), $request->validated()),
        );
    }

    /**
     * List the activity feed for a subject, project, or workspace, newest first.
     */
    public function index(Workspace $workspace, Request $request, GetActivityFeed $feed)
    {
        return match ($request->input('scope')) {
            'workspace' => $feed->forWorkspace($workspace),
            'project' => $feed->forProject(
                $workspace,
                $request->validate([
                    'project_id' => ['required', 'string', 'exists:projects,id'],
                ])['project_id'],
            ),
            default => $feed->forSubject(
                $request->validate([
                    'subject_type' => ['required', 'string', Rule::in(array_keys(Activity::SUBJECT_MODELS))],
                    'subject_id' => ['required', 'string'],
                ]),
            ),
        };
    }
}
