<?php

namespace App\Http\Controllers;

use App\Http\Requests\GitIntegrationConnectRequest;
use App\Models\Project;
use App\Policies\GitIntegrationPolicy;
use App\Services\Git\GitProviderException;
use App\Services\Git\GitProviderManager;
use Illuminate\Http\Request;

class GitIntegrationController extends Controller
{
    /**
     * Connect a project to a git repository, verifying access before saving.
     */
    public function store(GitIntegrationConnectRequest $request, Project $project, GitProviderManager $manager)
    {
        $validated = $request->validated();

        try {
            $repository = $manager->driver($validated['provider'])
                ->getRepository($validated['token'], $validated['repo_full_name']);
        } catch (GitProviderException $e) {
            return back()->withErrors(['token' => $e->getMessage()]);
        }

        $project->gitIntegration()->delete();

        $project->gitIntegration()->create([
            'provider' => $validated['provider'],
            'repo_full_name' => $repository['full_name'],
            'repo_url' => $repository['html_url'],
            'default_branch' => $repository['default_branch'],
            'access_token' => $validated['token'],
            'connected_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Repository connected successfully');
    }

    /**
     * Disconnect the project's git integration.
     */
    public function destroy(Request $request, Project $project)
    {
        abort_unless(app(GitIntegrationPolicy::class)->manage($request->user(), $project), 403);

        $project->gitIntegration()->delete();

        return back()->with('success', 'Repository disconnected');
    }
}
