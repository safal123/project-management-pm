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
        Schema::create('project_user', function (Blueprint $table) {
            $table->id();
            $table->foreignUlid('project_id')
                ->constrained('projects')
                ->cascadeOnDelete();
            $table->foreignUlid('user_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table
                ->string('role')
                ->default('member');
            $table
                ->enum('status', ['pending', 'accepted', 'rejected'])
                ->default('pending');
            $table
                ->foreignUlid('invited_by')
                ->constrained('users')
                ->cascadeOnDelete();
            $table
                ->foreignUlid('accepted_by')
                ->nullable()
                ->constrained('users')
                ->cascadeOnDelete();
            $table
                ->foreignUlid('rejected_by')
                ->nullable()
                ->constrained('users')
                ->cascadeOnDelete();
            $table
                ->timestamp('invited_at')
                ->nullable();
            $table
                ->timestamp('accepted_at')
                ->nullable();
            $table
                ->timestamp('rejected_at')
                ->nullable();
            $table->timestamps();
            $table->unique(['project_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_user');
    }
};
