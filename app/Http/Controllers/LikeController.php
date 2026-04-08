<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LikeController extends Controller
{
    /**
     * Polymorphic model map — extend this when adding likes to new entities.
     */
    private const LIKEABLE_MODELS = [
        'task' => \App\Models\Task::class,
        'project' => \App\Models\Project::class,
        'event' => \App\Models\Event::class,
    ];

    public function toggle(Request $request)
    {
        $request->validate([
            'likeable_type' => 'required|string|in:' . implode(',', array_keys(self::LIKEABLE_MODELS)),
            'likeable_id' => 'required|string',
        ]);

        $modelClass = self::LIKEABLE_MODELS[$request->likeable_type];
        $likeable = $modelClass::findOrFail($request->likeable_id);

        $isLiked = $likeable->toggleLike(Auth::id());

        return back()->with('success', $isLiked ? 'Liked' : 'Unliked');
    }
}
