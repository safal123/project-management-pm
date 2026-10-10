<?php

namespace App\Http\Requests;

use App\Models\Task;
use Illuminate\Foundation\Http\FormRequest;

class TaskReorderRequest extends FormRequest
{
    public function authorize(): bool
    {
        $taskIds = collect($this->input('taskIds', []))
            ->merge([
                $this->input('moved_task_id'),
                $this->input('parent_task_id'),
            ])
            ->filter()
            ->unique();

        if ($taskIds->isEmpty()) {
            return true;
        }

        return Task::query()
            ->whereIn('id', $taskIds)
            ->get()
            ->every(fn (Task $task) => $this->user()->can('update', $task));
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'taskIds' => ['required', 'array'],
            'taskIds.*' => ['exists:tasks,id'],
            'moved_task_id' => ['nullable', 'exists:tasks,id'],
            'parent_task_id' => ['nullable', 'exists:tasks,id'],
        ];
    }
}
