<?php

namespace App\Actions\Activity;

use App\Models\Event;
use App\Models\Task;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Pagination\AbstractPaginator;
use Illuminate\Support\Collection;

class LoadActivitySubjects
{
    /**
     * @param  AbstractPaginator|Collection  $activities
     * @return AbstractPaginator|Collection
     */
    public function execute($activities)
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
