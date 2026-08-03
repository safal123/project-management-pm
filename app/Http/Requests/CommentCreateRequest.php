<?php

namespace App\Http\Requests;

use App\Http\Controllers\CommentController;
use App\Models\Comment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CommentCreateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $commentable = $this->resolveCommentable();

        if ($commentable === null) {
            // Defer to validation, which will reject an invalid/missing commentable.
            return true;
        }

        return $this->user()->can('create', [Comment::class, $commentable]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'max:5000'],
            'commentable_type' => ['required', 'string', Rule::in(array_keys(CommentController::COMMENTABLE_MODELS))],
            'commentable_id' => ['required', 'string', function (string $attribute, mixed $value, \Closure $fail) {
                if ($this->resolveCommentable() === null) {
                    $fail('The selected commentable item does not exist.');
                }
            }],
            'parent_comment_id' => ['sometimes', 'nullable', 'string', function (string $attribute, mixed $value, \Closure $fail) {
                if ($value === null) {
                    return;
                }

                $commentable = $this->resolveCommentable();
                $parent = Comment::query()->find($value);

                if ($parent === null || $commentable === null) {
                    $fail('The selected parent comment does not exist.');

                    return;
                }

                if ($parent->commentable_type !== $commentable::class || $parent->commentable_id !== $commentable->getKey()) {
                    $fail('The parent comment does not belong to the same item.');
                }
            }],
        ];
    }

    /**
     * Resolve the commentable model instance from the request input.
     */
    public function resolveCommentable(): ?Model
    {
        $type = $this->input('commentable_type');
        $id = $this->input('commentable_id');

        if (! $type || ! $id) {
            return null;
        }

        $modelClass = CommentController::COMMENTABLE_MODELS[$type] ?? null;

        if ($modelClass === null) {
            return null;
        }

        return $modelClass::query()->find($id);
    }
}
