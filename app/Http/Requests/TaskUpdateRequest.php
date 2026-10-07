<?php

namespace App\Http\Requests;

use App\Models\Task;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TaskUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        /** @var \App\Models\Task|null $task */
        $task = $this->route('task');

        return $task !== null && $this->user()->can('update', $task);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:1024'],
            'assigned_to' => ['sometimes', 'nullable', 'exists:users,id'],
            'due_date' => ['sometimes', 'nullable', 'date'],
            'status' => ['sometimes', 'string', Rule::in(Task::getStatusOptions())],
            'priority' => ['sometimes', 'string', Rule::in(Task::getPriorityOptions())],
            'parent_task_id' => ['sometimes', 'nullable', 'exists:tasks,id'],
            'depends_on_task_id' => ['sometimes', 'nullable', 'exists:tasks,id'],
            'order' => ['sometimes', 'integer', 'min:1'],
        ];
    }
}
