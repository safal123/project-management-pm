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
        Schema::create('invitations', function (Blueprint $table) {
            $table->ulid('id')->primary();
            // Workspace_id is required. At least we can invite a user to a workspace.
            $table->foreignUlid('workspace_id')
                ->constrained('workspaces')
                ->cascadeOnDelete();
            // User can be invited on a workspace or a project.
            $table->foreignUlid('project_id')
                ->nullable()
                ->constrained('projects')
                ->cascadeOnDelete();
            $table->foreignUlid('invited_by')
                ->constrained('users')
                ->cascadeOnDelete();
            // User may not exist yet.
            $table->foreignUlid('invited_to')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->enum('status', ['pending', 'accepted', 'rejected'])
                ->default('pending');
            $table->string('email')
                ->nullable();
            $table->string('token');
            // token expires in 24 hours.
            $table->timestamp('expires_at')
                ->nullable();
            $table->timestamp('invited_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamps();

            // Unique index
            $table->unique(['workspace_id', 'project_id', 'email']);
            $table->index(['workspace_id', 'project_id', 'invited_to']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invitations');
    }
};
