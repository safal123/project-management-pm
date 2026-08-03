<?php

namespace App\Http\Requests;

use App\Models\Task;
use Illuminate\Foundation\Http\FormRequest;

class TaskReorderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $taskIds = collect($this->input('taskIds', []))
            ->merge([
                $this->input('sourceColumnId'),
                $this->input('targetColumnId'),
                $this->input('moved_task_id'),
                $this->input('parent_task_id'),
            ])
            ->filter()
            ->unique();

        if ($taskIds->isEmpty()) {
            return true;
        }

        $tasks = Task::query()->whereIn('id', $taskIds)->get();

        return $tasks->every(fn (Task $task) => $this->user()->can('update', $task));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'taskIds' => ['required', 'array'],
            'taskIds.*' => ['exists:tasks,id'],
            'sourceColumnId' => ['nullable', 'exists:tasks,id'],
            'targetColumnId' => ['nullable', 'exists:tasks,id'],
            'moved_task_id' => ['nullable', 'exists:tasks,id'],
            'parent_task_id' => ['nullable', 'exists:tasks,id'],
            'orderType' => ['nullable', 'string', 'in:column,task'],
        ];
    }
}
