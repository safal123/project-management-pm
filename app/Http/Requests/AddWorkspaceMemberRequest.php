<?php

namespace App\Http\Requests;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Http\FormRequest;

class AddWorkspaceMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        $workspace = $this->route('workspace');

        return $workspace && $this->user()?->can('addMember', $workspace);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'email' => [
                'required',
                'email',
                'exists:users,email',
                function (string $attribute, mixed $value, \Closure $fail) {
                    $workspace = $this->route('workspace');
                    $member = User::query()->where('email', $value)->first();

                    if (
                        $workspace instanceof Workspace
                        && $member
                        && $member->workspaces()->where('workspaces.id', $workspace->id)->exists()
                    ) {
                        $fail('This person is already a member of the workspace.');
                    }
                },
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.exists' => 'No account exists with this email. Invite them instead.',
        ];
    }
}
