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
        Schema::create('media', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulidMorphs('mediable');
            $table->string('filename');
            $table->string('original_filename');
            $table->foreignUlid('created_by')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->foreignUlid('workspace_id')
                ->constrained('workspaces')
                ->cascadeOnDelete();
            $table->string('path');
            $table->string('filesize');
            $table->string('filetype');
            $table->string('disk')
                ->default('s3');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
