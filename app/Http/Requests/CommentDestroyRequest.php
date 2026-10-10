<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CommentDestroyRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var \App\Models\Comment|null $comment */
        $comment = $this->route('comment');

        return $comment !== null && $this->user()->can('delete', $comment);
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [];
    }
}
