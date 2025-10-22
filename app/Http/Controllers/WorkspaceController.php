<?php

namespace App\Http\Controllers;

use App\Http\Requests\WorkspaceCreateRequest;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WorkspaceController extends Controller
{
    public function store(WorkspaceCreateRequest $request)
    {
        $validated = $request->validated();

        $validated['created_by'] = auth()->user()->id;
        $validated['slug'] = Str::slug($validated['name']);

        $workspace = Workspace::create($validated);

        $workspace->users()->attach(auth()->user()->id);

        return redirect()->back()->with('success', 'Workspace created successfully');
    }
}
