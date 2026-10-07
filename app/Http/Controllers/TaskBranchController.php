<?php

namespace App\Http\Controllers;

use App\Http\Requests\TaskBranchCreateRequest;
use App\Models\Activity;
use App\Models\Task;
use App\Services\Git\GitProviderException;
use App\Services\Git\GitProviderManager;

class TaskBranchController extends Controller
{
    public function __invoke(TaskBranchCreateRequest $request, Task $task, GitProviderManager $manager)
    {
        $project = $task->project;
        $integration = $project->gitIntegration;

        abort_if($integration === null, 422, 'This project is not connected to a git repository.');

        $branchName = $request->validated('branch_name') ?: "task/{$task->slug}";

        try {
            $branch = $manager->driver($integration->provider)->createBranch(
                $integration->access_token,
                $integration->repo_full_name,
                $branchName,
                $integration->default_branch,
            );
        } catch (GitProviderException $e) {
            return back()->withErrors(['branch_name' => $e->getMessage()]);
        }

        $user = $request->user();

        $task->update([
            'branch_name' => $branch['name'],
            'branch_url' => $branch['url'],
            'branch_created_by' => $user->id,
            'branch_created_at' => now(),
        ]);

        Activity::record($task, Activity::TYPE_BRANCH_CREATED, $task->workspace_id, $user, [
            'branch' => $branch['name'],
        ]);

        return back()->with('success', 'Branch created successfully');
    }
}
