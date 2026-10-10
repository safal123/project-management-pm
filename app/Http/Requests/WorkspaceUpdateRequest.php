<?php

namespace App\Http\Requests;

use App\Models\Workspace;
use Illuminate\Foundation\Http\FormRequest;

class WorkspaceUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $workspace = $this->route('workspace');

        return $user !== null
            && $workspace instanceof Workspace
            && $workspace->users()->where('users.id', $user->id)->exists()
            && $workspace->isOwnedBy($user);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
        ];
    }
}
