<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\User;
use App\Models\UserMatch;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_notification_created_on_scan()
    {
        $scanner = User::factory()->create();
        $scanned = User::factory()->create();

        $response = $this->actingAs($scanner)->postJson('/api/matches/scan', [
            'scanned_id' => $scanned->id,
            'reason' => 'Test scan',
        ]);

        $response->assertStatus(201);

        // Check notification was created
        $this->assertDatabaseHas('notifications', [
            'type' => 'Scanned',
            'scanner_id' => $scanner->id,
            'scanned_id' => $scanned->id,
            'status' => false,
            'read' => false,
        ]);
    }

    public function test_notification_created_on_accept()
    {
        $scanner = User::factory()->create();
        $scanned = User::factory()->create();

        $match = UserMatch::create([
            'scanner_id' => $scanner->id,
            'scanned_id' => $scanned->id,
            'reason' => 'Test',
            'scanner_status' => true,
            'scanned_status' => false,
        ]);

        $response = $this->actingAs($scanned)->postJson("/api/matches/{$match->id}/accept");

        $response->assertStatus(200);

        // Check notification was created
        $this->assertDatabaseHas('notifications', [
            'type' => 'Scanner',
            'scanner_id' => $scanner->id,
            'scanned_id' => $scanned->id,
            'status' => true,
            'read' => false,
        ]);
    }

    public function test_user_can_list_notifications()
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        Notification::create([
            'type' => 'Scanned',
            'scanner_id' => $other->id,
            'scanned_id' => $user->id,
            'status' => false,
            'read' => false,
        ]);

        $response = $this->actingAs($user)->getJson('/api/notifications');

        $response->assertStatus(200)
            ->assertJsonCount(1);
    }

    public function test_user_can_mark_notification_as_read()
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        $notification = Notification::create([
            'type' => 'Scanned',
            'scanner_id' => $other->id,
            'scanned_id' => $user->id,
            'status' => false,
            'read' => false,
        ]);

        $response = $this->actingAs($user)->postJson("/api/notifications/{$notification->id}/read");

        $response->assertStatus(200)
            ->assertJson([
                'read' => true,
            ]);

        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
            'read' => true,
        ]);
    }
}
