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
        Schema::table('project_user', function (Blueprint $table) {
            $table->dropForeign(['invited_by']);
            $table->dropForeign(['accepted_by']);
            $table->dropForeign(['rejected_by']);

            $table->dropColumn([
                'invited_by',
                'accepted_by',
                'rejected_by',
                'invited_at',
                'accepted_at',
                'rejected_at',
                'status',
            ]);
        });

        // add created_by, joined_at
        Schema::table('project_user', function (Blueprint $table) {
            $table->foreignUlid('created_by')
                ->nullable()
                ->constrained('users')
                ->cascadeOnDelete();
            $table->timestamp('joined_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('project_user', function (Blueprint $table) {

            $table->foreignUlid('invited_by')->nullable();
            $table->foreignUlid('accepted_by')->nullable();
            $table->foreignUlid('rejected_by')->nullable();

            $table->enum('status', ['pending', 'accepted', 'rejected'])
                ->default('pending');

            $table->timestamp('invited_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
        });

        Schema::table('project_user', function (Blueprint $table) {
            $table->foreign('invited_by')
                ->references('id')
                ->on('users')
                ->nullOnDelete();

            $table->foreign('accepted_by')
                ->references('id')
                ->on('users')
                ->nullOnDelete();

            $table->foreign('rejected_by')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
        });

        Schema::table('project_user', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropColumn('created_by');
            $table->dropColumn('joined_at');
        });
    }
};
