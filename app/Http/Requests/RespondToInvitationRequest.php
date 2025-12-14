<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RespondToInvitationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'user_id' => 'required|exists:users,id',
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required' => 'The user ID is required.',
            'user_id.exists' => 'The user ID is invalid.',
        ];
    }

    public function action(): string
    {
        return $this->route('action');
    }

    public function userId(): string
    {
        return $this->validated('user_id');
    }
}
