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
        Schema::create('tasks', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('title');
            $table->string('description')->nullable();
            $table->string('slug')->unique();
            $table->string('color')->default('gray');
            $table->integer('order')->default(0);
            $table->integer('progress')->default(0);
            $table->foreignUlid('project_id')
                ->constrained('projects')
                ->cascadeOnDelete();
            $table->foreignUlid('parent_task_id')
                ->nullable()
                ->constrained('tasks')
                ->cascadeOnDelete();
            $table->foreignUlid('workspace_id')
                ->constrained('workspaces')
                ->cascadeOnDelete();

            $table->foreignUlid('created_by')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->foreignUlid('assigned_by')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->foreignUlid('assigned_to')
                ->nullable()
                ->constrained('users')
                ->cascadeOnDelete();
            $table->enum('status', ['todo', 'in_progress', 'done'])->default('todo');
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium');
            $table->dateTime('due_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
