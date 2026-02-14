<?php

namespace App\Actions\Project;

use App\Exceptions\ProjectCreationException;
use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

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
                'created_by' => $user->id,
                'joined_at' => now(),
            ]);

            DB::commit();

            return $project;
        } catch (\Exception $e) {
            Log::error('Cannot create project: ' . $e->getMessage());
            DB::rollBack();
            throw new ProjectCreationException('Cannot create project: ' . $e->getMessage());
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
