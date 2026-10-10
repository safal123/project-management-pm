<?php

namespace App\Actions\People;

use App\Actions\Activity\LoadActivitySubjects;
use App\Http\Resources\ActivityResource;
use App\Models\Activity;
use App\Models\User;
use App\Models\Workspace;

class ListPersonActivities
{
    public function __construct(private LoadActivitySubjects $loadSubjects) {}

    /**
     * @return array{data: mixed, meta: array{current_page: int, last_page: int, has_more: bool}}
     */
    public function execute(User $person, Workspace $workspace, int $page = 1): array
    {
        $activities = Activity::query()
            ->forWorkspace($workspace->id)
            ->where('user_id', $person->id)
            ->with(['user.media'])
            ->latest()
            ->paginate(8, ['*'], 'page', $page);

        $this->loadSubjects->execute($activities);

        return [
            'data' => ActivityResource::collection($activities->getCollection())->resolve(),
            'meta' => [
                'current_page' => $activities->currentPage(),
                'last_page' => $activities->lastPage(),
                'has_more' => $activities->hasMorePages(),
            ],
        ];
    }
}
