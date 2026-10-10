<?php

namespace App\Http\Middleware;

use App\Http\Resources\UserResource;
use App\Models\Project;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $workspace = $request->route('workspace');
        $workspace = $workspace instanceof Workspace
            ? $workspace
            : $user?->currentWorkspace;
        $workspaceId = $workspace?->id ?? $user?->current_workspace_id;

        if ($workspaceId) {
            URL::defaults(['workspace' => $workspaceId]);
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'flash' => [
                'success' => $request->session()->get('success'),
            ],
            'sidebar_projects' => $user && $workspace
                ? Project::query()
                    ->forUserAndWorkspace($user, $workspace)
                    ->orderBy('name')
                    ->get(['id', 'name', 'slug'])
                : [],
            'auth' => [
                'user' => $request->user()
                    ? (new UserResource($request
                        ->user()
                        ->load('workspaces', 'currentWorkspace', 'media')))
                    : null,
                'permissions' => [
                    'can' => $user && $workspace
                        ? $workspace->abilitiesFor($user)
                        : ($user ? ['workspace.create'] : []),
                ],
            ],
        ];
    }
}
