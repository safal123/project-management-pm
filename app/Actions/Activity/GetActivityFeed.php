<?php

namespace App\Actions\Activity;

use App\Http\Resources\ActivityResource;
use App\Models\Activity;
use App\Models\Project;
use App\Models\Workspace;
use Illuminate\Support\Facades\Gate;

class GetActivityFeed
{
    public function __construct(private LoadActivitySubjects $loadSubjects) {}

    public function forWorkspace(Workspace $workspace)
    {
        $activities = Activity::query()
            ->forWorkspace($workspace->id)
            ->with(['user.media'])
            ->latest()
            ->limit(80)
            ->get();

        return ActivityResource::collection($this->loadSubjects->execute($activities));
    }

    public function forProject(Workspace $workspace, string $projectId)
    {
        $project = Project::query()
            ->where('workspace_id', $workspace->id)
            ->findOrFail($projectId);

        Gate::authorize('view', [Activity::class, $project]);

        $activities = Activity::query()
            ->forWorkspace($workspace->id)
            ->relatedToProject($project)
            ->with(['user.media'])
            ->latest()
            ->limit(80)
            ->get();

        return ActivityResource::collection($this->loadSubjects->execute($activities));
    }

    /**
     * @param  array{subject_type: string, subject_id: string}  $input
     */
    public function forSubject(array $input)
    {
        $modelClass = Activity::SUBJECT_MODELS[$input['subject_type']];
        $subject = $modelClass::query()->findOrFail($input['subject_id']);

        Gate::authorize('view', [Activity::class, $subject]);

        $activities = $subject->activities()->with(['user.media'])->get();

        return ActivityResource::collection($this->loadSubjects->execute($activities));
    }
}
