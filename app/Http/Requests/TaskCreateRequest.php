<?php

namespace App\Http\Requests;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Foundation\Http\FormRequest;

class TaskCreateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        if (! $this->filled('project_id')) {
            return true;
        }

        $project = Project::query()->find($this->input('project_id'));

        return $project !== null && $this->user()->can('create', [Task::class, $project]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1024',
            'project_id' => 'required|exists:projects,id',
            'workspace_id' => 'required|exists:workspaces,id',
            'parent_task_id' => 'nullable|exists:tasks,id',
            'due_date' => 'nullable|date',
            'status' => 'sometimes|string|in:todo,in_progress,done',
            'priority' => 'sometimes|string|in:low,medium,high',
        ];
    }
}
