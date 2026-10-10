<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create one main user (Safal)
        $user = User::factory()->create([
            'name' => 'Safal Pokharel',
            'email' => 'safal@safal.com',
            'password' => bcrypt('password'),
        ]);

        // Create 2 workspaces owned by that user
        $workspaces = Workspace::factory(2)
            ->create(['created_by' => $user->id]);

        // Attach the user to all created workspaces
        foreach ($workspaces as $workspace) {
            $workspace->users()->attach($user->id, ['role' => Workspace::ROLE_OWNER]);
        }

        // Set one workspace as Safal’s current active workspace
        $user->currentWorkspace()->associate($workspaces->first());
        $user->save();
    }
}
