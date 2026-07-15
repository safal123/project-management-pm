<?php

namespace App\Http\Requests;

use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;

class EventCreateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
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
            'description' => 'nullable|string|max:1000',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'location' => 'nullable|string|in:office,online,other',
            'type' => 'required|string|in:meeting,deadline,reminder,call',
            'attendees' => 'nullable|array',
            'created_by' => 'required|exists:users,id',
            'workspace_id' => 'required|exists:workspaces,id',
        ];
    }
    
    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $merge = [
            'created_by'   => auth()->id(),
            'workspace_id' => auth()->user()->current_workspace_id,
        ];

        if ($this->start_date && $this->start_time) {
            $merge['start_date'] = Carbon::parse($this->start_date)->format('Y-m-d') . ' ' . $this->start_time;
        }

        if ($this->end_date && $this->end_time) {
            $merge['end_date'] = Carbon::parse($this->end_date)->format('Y-m-d') . ' ' . $this->end_time;
        }

        $this->merge($merge);
    }
}
