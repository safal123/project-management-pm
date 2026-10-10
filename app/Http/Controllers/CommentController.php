<?php

namespace App\Http\Controllers;

use App\Actions\Comment\CreateComment;
use App\Actions\Comment\ListComments;
use App\Http\Requests\CommentCreateRequest;
use App\Http\Requests\CommentDestroyRequest;
use App\Http\Requests\CommentIndexRequest;
use App\Http\Requests\CommentUpdateRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Workspace;

class CommentController extends Controller
{
    public function index(Workspace $workspace, CommentIndexRequest $request, ListComments $listComments)
    {
        $commentable = $request->resolveCommentable();
        abort_unless($commentable, 404);

        return $listComments->execute($commentable, $request->user());
    }

    public function store(Workspace $workspace, CommentCreateRequest $request, CreateComment $createComment)
    {
        $comment = $createComment->execute(
            $request->user(),
            $request->resolveCommentable(),
            $request->validated(),
        );

        return new CommentResource($comment);
    }

    public function update(Workspace $workspace, Comment $comment, CommentUpdateRequest $request)
    {
        $comment->update($request->validated());
        $comment->load('user');

        return new CommentResource($comment);
    }

    public function destroy(Workspace $workspace, Comment $comment, CommentDestroyRequest $request)
    {
        $comment->delete();

        return response()->json(['message' => 'Comment deleted']);
    }
}
