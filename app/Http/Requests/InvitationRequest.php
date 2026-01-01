<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InvitationRequest extends FormRequest
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
            'workspace_id' => 'sometimes|required|exists:workspaces,id',
            'project_id' => 'sometimes|required|exists:projects,id',
            // can be invited to a user who is not registered yet.
            'email' => 'sometimes|required|email',
            'invited_to' => 'sometimes|required|exists:users,id',
        ];
    }
}
