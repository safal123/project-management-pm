<?php

namespace App\Http\Middleware;

use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
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
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'flash' => [
                'success' => $request->session()->get('success'),
            ],
            'auth' => [
                'user' => $request->user()
                    ? (new UserResource($request
                        ->user()
                        ->load('workspaces', 'currentWorkspace')))
                    : null,
                'permissions' => [
                    'can' => [
                        'workspace.create',
                        'workspace.update',
                        'workspace.delete',
                        'workspace.view',
                        'workspace.invite_members',
                        'workspace.remove_members',
                        'workspace.view_tasks',
                        'workspace.view_members',
                        'workspace.view_invitations',
                        'project.create',
                        'project.update',
                        'project.delete',
                        'project.view',
                        'project.invite_members',
                        'project.remove_members',
                        'project.view_tasks',
                        'project.view_members',
                        'project.view_invitations',
                        'task.create',
                        'task.update',
                        'task.delete',
                        'task.view',
                        'task.invite_members',
                        'task.remove_members',
                        'task.view_tasks',
                        'task.view_members',
                        'task.view_invitations',
                    ]
                ],
            ],
        ];
    }
}
