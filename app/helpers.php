<?php

use App\Models\Workspace;
use Illuminate\Support\Arr;

/**
 * Generate a workspace-scoped named route.
 *
 * @param  array<string, mixed>|string|object|null  $parameters
 */
function workspace_route(string $name, mixed $parameters = [], Workspace|string|null $workspace = null, bool $absolute = true): string
{
    $parameters = is_array($parameters) ? $parameters : ($parameters !== null ? Arr::wrap($parameters) : []);

    if (! array_key_exists('workspace', $parameters)) {
        $workspaceId = $workspace instanceof Workspace
            ? $workspace->id
            : ($workspace ?? auth()->user()?->current_workspace_id ?? 'workspace');

        $parameters = ['workspace' => $workspaceId] + $parameters;
    }

    return route($name, $parameters, $absolute);
}
