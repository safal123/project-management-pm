<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_workspaces', function (Blueprint $table) {
            $table->string('role')->default('member');
        });

        $workspaces = DB::table('workspaces')->select('id', 'created_by')->get();

        foreach ($workspaces as $workspace) {
            DB::table('user_workspaces')
                ->where('workspace_id', $workspace->id)
                ->where('user_id', $workspace->created_by)
                ->update(['role' => 'owner']);
        }
    }

    public function down(): void
    {
        Schema::table('user_workspaces', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
