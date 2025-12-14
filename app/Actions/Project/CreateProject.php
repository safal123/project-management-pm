<?php

namespace App\Actions\Project;

use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CreateProject
{
    public function __construct(
        private AttachProjectMember $attachProjectMember
    ) {}

    public function execute(User $user, array $data)
    {
        try {
            DB::beginTransaction();
            $project = Project::create([
                'name' => $data['name'],
                'description' => $data['description'],
                'created_by' => $user->id,
                'slug' => $this->generateUniqueSlugForProject($data['name']),
                'workspace_id' => $user->currentWorkspace()->first()->id,
            ]);

            $this->attachProjectMember->execute($project, $user, [
                'role' => 'owner',
                'status' => 'accepted',
                'accepted_by' => $user->id,
                'accepted_at' => now(),
            ]);

            DB::commit();

            return $project;
        } catch (\Exception $e) {
            DB::rollBack();
            throw new \Exception('Cannot create project');
        }
    }

    private function generateUniqueSlugForProject(string $name): string
    {
        $slug = Str::slug($name);
        $count = 1;
        while (Project::where('slug', $slug)->exists()) {
            $slug = Str::slug($name) . '-' . $count;
            $count++;
        }
        return $slug;
    }
}
