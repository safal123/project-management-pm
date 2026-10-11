<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('availability', 16)->default('online');
            $table->string('status_text', 100)->nullable();
            $table->string('status_emoji', 32)->nullable();
            $table->timestamp('status_expires_at')->nullable();
            $table->boolean('notifications_muted')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn([
            'availability', 'status_text', 'status_emoji', 'status_expires_at', 'notifications_muted',
        ]));
    }
};
