<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserMatch;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MatchTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_scan_another_user()
    {
        $scanner = User::factory()->create();
        $scanned = User::factory()->create();

        $response = $this->actingAs($scanner)->postJson('/api/matches/scan', [
            'scanned_id' => $scanned->id,
            'reason' => 'Met at conference',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'scanner_id' => $scanner->id,
                'scanned_id' => $scanned->id,
                'reason' => 'Met at conference',
                'scanner_status' => true,
                'scanned_status' => false,
            ]);

        $this->assertDatabaseHas('matches', [
            'scanner_id' => $scanner->id,
            'scanned_id' => $scanned->id,
        ]);
    }

    public function test_user_can_accept_match()
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

        $response->assertStatus(200)
            ->assertJson([
                'scanned_status' => true,
            ]);

        $this->assertDatabaseHas('matches', [
            'id' => $match->id,
            'scanned_status' => true,
        ]);
    }

    public function test_user_can_list_matches()
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        // Match where user is scanner
        UserMatch::create([
            'scanner_id' => $user->id,
            'scanned_id' => $other->id,
            'reason' => 'I scanned them',
            'scanner_status' => true,
        ]);

        // Match where user is scanned
        UserMatch::create([
            'scanner_id' => $other->id,
            'scanned_id' => $user->id,
            'reason' => 'They scanned me',
            'scanner_status' => true,
        ]);

        $response = $this->actingAs($user)->getJson('/api/matches');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'scans',
                'scanned_by',
            ]);
        
        // Check that reason is hidden for scanned_by
        $scannedBy = $response->json('scanned_by');
        $this->assertArrayNotHasKey('reason', $scannedBy[0]);
    }

    public function test_user_can_get_match_by_id()
    {
        $scanner = User::factory()->create();
        $scanned = User::factory()->create();

        $match = UserMatch::create([
            'scanner_id' => $scanner->id,
            'scanned_id' => $scanned->id,
            'reason' => 'Secret reason',
            'scanner_status' => true,
        ]);

        // Scanner can see reason
        $response = $this->actingAs($scanner)->getJson("/api/matches/{$match->id}");
        $response->assertStatus(200)
            ->assertJson([
                'id' => $match->id,
                'reason' => 'Secret reason',
            ]);

        // Scanned user cannot see reason
        $response = $this->actingAs($scanned)->getJson("/api/matches/{$match->id}");
        $response->assertStatus(200)
            ->assertJson([
                'id' => $match->id,
            ])
            ->assertJsonMissing(['reason']);

        // Unauthorized user cannot see match
        $other = User::factory()->create();
        $response = $this->actingAs($other)->getJson("/api/matches/{$match->id}");
        $response->assertStatus(404);
    }
}
