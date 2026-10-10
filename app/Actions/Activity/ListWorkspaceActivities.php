<?php

namespace App\Actions\Activity;

use App\Http\Resources\ActivityResource;
use App\Models\Activity;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;

class ListWorkspaceActivities
{
    public function __construct(private LoadActivitySubjects $loadSubjects) {}

    /**
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function execute(Workspace $workspace, User $user, array $filters): array
    {
        $activities = Activity::query()
            ->forWorkspace($workspace->id)
            ->with('user.media')
            ->search($filters['q'] ?? null)
            ->filterBy($filters)
            ->sortBy(
                $filters['sort'] ?? 'created_at',
                $filters['direction'] ?? 'desc',
            )
            ->paginate(20)
            ->withQueryString();

        return [
            'activities' => ActivityResource::collection(
                $this->loadSubjects->execute($activities)
            ),
            'filters' => array_merge([
                'q' => '',
                'type' => '',
                'subject' => '',
                'project_id' => '',
                'user_id' => '',
                'sort' => 'created_at',
                'direction' => 'desc',
            ], $filters),
            'filterOptions' => [
                'types' => Activity::TYPES,
                'subjects' => array_keys(Activity::SUBJECT_MODELS),
                'projects' => Project::query()
                    ->forUserAndWorkspace($user, $workspace)
                    ->orderBy('name')
                    ->get(['id', 'name']),
                'users' => $workspace->users()
                    ->orderBy('name')
                    ->get(['users.id', 'users.name']),
            ],
        ];
    }
}
