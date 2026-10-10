<?php

namespace App\Http\Middleware;

use App\Models\Workspace;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\Response;

class EnsureWorkspaceFromRoute
{
    public function handle(Request $request, Closure $next): Response
    {
        $workspace = $request->route('workspace');

        if (! $workspace instanceof Workspace) {
            $workspace = Workspace::query()->findOrFail($workspace);
            $request->route()?->setParameter('workspace', $workspace);
        }

        $user = $request->user();

        abort_unless($user, 401);
        abort_unless(
            $user->workspaces()->where('workspaces.id', $workspace->id)->exists(),
            403,
            'You do not have access to this workspace.',
        );

        if ($user->current_workspace_id !== $workspace->id) {
            $user->current_workspace_id = $workspace->id;
            $user->save();
        }

        $user->unsetRelation('currentWorkspace');
        $user->setRelation('currentWorkspace', $workspace);

        URL::defaults(['workspace' => $workspace->id]);

        return $next($request);
    }
}
