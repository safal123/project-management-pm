<?php

namespace App\Http\Requests;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Validation\Rule;

class UpdatePersonRoleRequest extends WorkspacePersonRequest
{
    public function authorize(): bool
    {
        $person = $this->route('person');
        $workspace = $this->route('workspace');

        return $person instanceof User
            && $workspace instanceof Workspace
            && ($this->user()?->can('updateMemberRole', [$workspace, $person]) ?? false);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'role' => ['required', Rule::in([Workspace::ROLE_ADMIN, Workspace::ROLE_MEMBER])],
        ];
    }
}
