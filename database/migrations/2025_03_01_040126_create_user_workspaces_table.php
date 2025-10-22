<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_workspaces', function (Blueprint $table) {
            $table->foreignUlid('user_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->foreignUlid('workspace_id')
                ->constrained()
                ->cascadeOnDelete();

            // index
            $table->unique(['user_id', 'workspace_id']);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_workspaces');
    }
};
