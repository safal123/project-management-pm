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
        Schema::table('tasks', function (Blueprint $table) {
            $table->string('branch_name')->nullable()->after('due_date');
            $table->string('branch_url')->nullable()->after('branch_name');
            $table->foreignUlid('branch_created_by')
                ->nullable()
                ->after('branch_url')
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamp('branch_created_at')->nullable()->after('branch_created_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropConstrainedForeignId('branch_created_by');
            $table->dropColumn(['branch_name', 'branch_url', 'branch_created_at']);
        });
    }
};
