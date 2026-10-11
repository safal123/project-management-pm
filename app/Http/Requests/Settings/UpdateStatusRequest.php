<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'availability' => ['required', Rule::in(['online', 'offline'])],
            'status_text' => ['nullable', 'string', 'max:100'],
            'status_emoji' => ['nullable', 'string', 'max:32'],
            'clear_after' => ['required', Rule::in(['never', '30m', '1h', '4h', 'today', 'week'])],
            'timezone' => ['required', 'timezone'],
        ];
    }
}
