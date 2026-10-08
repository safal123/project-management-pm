<?php

namespace App\Http\Controllers;

use App\Http\Requests\WorkspaceCreateRequest;
use App\Http\Requests\WorkspaceUpdateRequest;
use App\Models\Workspace;
use Illuminate\Http\RedirectResponse;

class WorkspaceController extends Controller
{
    public function store(WorkspaceCreateRequest $request)
    {
        $validated = $request->validated();

        $validated['created_by'] = auth()->user()->id;
        $validated['slug'] = Workspace::uniqueSlugFor($validated['name']);

        $workspace = Workspace::create($validated);

        $workspace->users()->attach(auth()->user()->id, ['role' => Workspace::ROLE_OWNER]);

        return redirect()->back()->with('success', 'Workspace created successfully');
    }

    public function update(WorkspaceUpdateRequest $request, Workspace $workspace): RedirectResponse
    {
        $user = $request->user();

        abort_unless(
            $workspace->users()->where('users.id', $user->id)->exists(),
            403
        );
        abort_unless($workspace->canManageRoles($user), 403);

        $name = $request->validated('name');

        $workspace->update([
            'name' => $name,
            'slug' => Workspace::uniqueSlugFor($name, $workspace->id),
        ]);

        return redirect()->back()->with('success', 'Workspace renamed.');
    }
}
