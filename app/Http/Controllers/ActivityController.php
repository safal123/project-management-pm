<?php

namespace App\Http\Controllers;

use App\Http\Resources\ActivityResource;
use App\Models\Activity;
use App\Models\Event;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

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
     * List the activity feed for a subject, newest first.
     */
    public function index(Request $request)
    {
        $request->validate([
            'subject_type' => ['required', 'string', Rule::in(array_keys(self::SUBJECT_MODELS))],
            'subject_id' => ['required', 'string'],
        ]);

        $modelClass = self::SUBJECT_MODELS[$request->string('subject_type')->toString()];
        $subject = $modelClass::query()->findOrFail($request->input('subject_id'));

        $this->authorize('view', [Activity::class, $subject]);

        $activities = $subject->activities()->with('user')->get();

        return ActivityResource::collection($activities);
    }
}
