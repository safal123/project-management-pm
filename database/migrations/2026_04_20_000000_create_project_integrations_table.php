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
        Schema::create('project_integrations', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('project_id')
                ->unique()
                ->constrained()
                ->cascadeOnDelete();
            $table->string('provider');
            $table->string('repo_full_name');
            $table->string('repo_url');
            $table->string('default_branch')->default('main');
            $table->text('access_token');
            $table->foreignUlid('connected_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_integrations');
    }
};
