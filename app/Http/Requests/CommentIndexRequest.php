<?php

namespace App\Http\Requests;

use App\Models\Comment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CommentIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        $commentable = $this->resolveCommentable();

        if ($commentable === null) {
            return true;
        }

        return $this->user()->can('create', [Comment::class, $commentable]);
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'commentable_type' => ['required', 'string', Rule::in(array_keys(Comment::COMMENTABLE_MODELS))],
            'commentable_id' => ['required', 'string'],
        ];
    }

    public function resolveCommentable(): ?Model
    {
        return Comment::findCommentable(
            $this->input('commentable_type'),
            $this->input('commentable_id'),
        );
    }
}
