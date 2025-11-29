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
        Schema::create('matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('scanner_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('scanned_id')->constrained('users')->onDelete('cascade');
            $table->string('reason')->nullable();
            $table->boolean('scanner_status')->default(false);
            $table->boolean('scanned_status')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('matches');
    }
};
