<?php

namespace App\Http\Controllers;

use App\Http\Requests\CommentCreateRequest;
use App\Http\Requests\CommentUpdateRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CommentController extends Controller
{
    /**
     * Polymorphic model map — extend this when adding comments to new entities.
     */
    public const COMMENTABLE_MODELS = [
        'task' => Task::class,
    ];

    /**
     * List top-level comments (with one level of replies) for a commentable model.
     */
    public function index(Request $request)
    {
        $request->validate([
            'commentable_type' => ['required', 'string', Rule::in(array_keys(self::COMMENTABLE_MODELS))],
            'commentable_id' => ['required', 'string'],
        ]);

        $modelClass = self::COMMENTABLE_MODELS[$request->string('commentable_type')->toString()];
        $commentable = $modelClass::query()->findOrFail($request->input('commentable_id'));

        // Viewing comments requires the same project/workspace access as creating one.
        $this->authorize('create', [Comment::class, $commentable]);

        $comments = $commentable->comments()
            ->topLevel()
            ->with(['user', 'replies.user'])
            ->oldest()
            ->get();

        return CommentResource::collection($comments);
    }

    public function store(CommentCreateRequest $request)
    {
        $commentable = $request->resolveCommentable();
        $user = $request->user();

        $comment = $commentable->comments()->create([
            'user_id' => $user->id,
            'workspace_id' => $commentable->workspace_id,
            'parent_comment_id' => $request->input('parent_comment_id'),
            'body' => $request->validated('body'),
        ]);

        $comment->load('user');

        return new CommentResource($comment);
    }

    public function update(Comment $comment, CommentUpdateRequest $request)
    {
        $comment->update($request->validated());

        $comment->load('user');

        return new CommentResource($comment);
    }

    public function destroy(Comment $comment)
    {
        $this->authorize('delete', $comment);

        $comment->delete();

        return response()->json(['message' => 'Comment deleted']);
    }
}
