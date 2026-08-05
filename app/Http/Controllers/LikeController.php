<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Event;
use App\Models\Media;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LikeController extends Controller
{
    /**
     * Polymorphic model map — extend this when adding likes to new entities.
     */
    private const LIKEABLE_MODELS = [
        'task' => Task::class,
        'project' => Project::class,
        'event' => Event::class,
        'media' => Media::class,
        'comment' => Comment::class,
        'user' => User::class,
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

        if ($request->wantsJson()) {
            return response()->json([
                'liked' => $isLiked,
                'likes_count' => $likeable->likes()->count(),
            ]);
        }

        return back()->with('success', $isLiked ? 'Liked' : 'Unliked');
    }
}
