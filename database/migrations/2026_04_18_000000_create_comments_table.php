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
        Schema::create('comments', function (Blueprint $table) {
            $table->ulid('id');
            // Declared explicitly (rather than chaining ->primary() on the column) so the
            // primary key command is queued before the self-referencing foreign key below.
            // Otherwise Postgres tries to add the FK constraint before the PK exists.
            $table->primary('id');
            $table->ulidMorphs('commentable');
            $table->foreignUlid('parent_comment_id')
                ->nullable()
                ->constrained('comments')
                ->cascadeOnDelete();
            $table->foreignUlid('user_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->foreignUlid('workspace_id')
                ->constrained('workspaces')
                ->cascadeOnDelete();
            $table->text('body');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};
