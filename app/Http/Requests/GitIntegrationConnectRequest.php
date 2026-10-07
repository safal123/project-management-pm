<?php

namespace App\Http\Requests;

use App\Models\Project;
use App\Models\ProjectIntegration;
use App\Policies\GitIntegrationPolicy;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GitIntegrationConnectRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        /** @var Project $project */
        $project = $this->route('project');

        return app(GitIntegrationPolicy::class)->manage($this->user(), $project);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'provider' => ['required', 'string', Rule::in([ProjectIntegration::PROVIDER_GITHUB])],
            'token' => ['required', 'string'],
            'repo_full_name' => ['required', 'string', 'regex:/^[\w.-]+\/[\w.-]+$/'],
        ];
    }
}
