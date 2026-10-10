<?php

namespace App\Http\Requests;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Http\FormRequest;

class WorkspacePersonRequest extends FormRequest
{
    public function authorize(): bool
    {
        $person = $this->route('person');
        $workspace = $this->route('workspace');

        if (! $person instanceof User || ! $workspace instanceof Workspace) {
            return false;
        }

        return $this->user()?->can('viewMember', [$workspace, $person]) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [];
    }
}
