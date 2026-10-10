<?php

namespace App\Http\Requests;

use App\Models\Activity;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class WorkspaceActivityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'q' => ['nullable', 'string', 'max:100'],
            'type' => ['nullable', 'string', Rule::in(Activity::TYPES)],
            'subject' => ['nullable', 'string', Rule::in(array_keys(Activity::SUBJECT_MODELS))],
            'project_id' => ['nullable', 'string', 'exists:projects,id'],
            'user_id' => ['nullable', 'string', 'exists:users,id'],
            'sort' => ['nullable', 'string', Rule::in(['created_at', 'type', 'user'])],
            'direction' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('q')) {
            $this->merge([
                'q' => trim((string) $this->input('q')),
            ]);
        }
    }
}
