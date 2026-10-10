<?php

namespace App\Http\Requests;

use App\Models\Task;
use Illuminate\Foundation\Http\FormRequest;

class ColumnMoveRequest extends FormRequest
{
    public function authorize(): bool
    {
        $column = $this->column();

        return $column === null || $this->user()->can('update', $column);
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'task_id' => ['required', 'exists:tasks,id'],
            'direction' => ['required', 'string', 'in:left,right,first,last'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $task = $this->column();

            if ($task && ! $task->isColumn()) {
                $validator->errors()->add('task_id', 'Only columns can be moved.');
            }
        });
    }

    public function column(): ?Task
    {
        $id = $this->input('task_id');

        return $id ? Task::query()->find($id) : null;
    }
}
