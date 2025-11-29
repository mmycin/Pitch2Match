<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register()
    {
        $response = $this->postJson('/api/register', [
            'firstname' => 'John',
            'lastname' => 'Doe',
            'email' => 'john@example.com',
            'phone' => '1234567890',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'user' => [
                    'id',
                    'firstname',
                    'lastname',
                    'email',
                    'phone',
                    'created_at',
                    'updated_at',
                ],
            ])
            ->assertJson([
                'message' => 'success',
                'user' => [
                    'firstname' => 'John',
                    'email' => 'john@example.com',
                ],
            ]);
            
        // Ensure token is NOT returned
        $response->assertJsonMissing(['token']);
    }

    public function test_user_can_login()
    {
        $user = User::factory()->create([
            'email' => 'jane@example.com',
            'password' => 'password',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'jane@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'token',
            ])
            ->assertJson([
                'message' => 'success',
            ]);
            
        // Ensure user object is NOT returned (as per request, though typical APIs might return it)
        // Wait, the user request for login was: { "message": "success", "token":"..." }
        // So I should verify user is missing if I strictly followed that.
        // My code currently returns: ['message' => 'success', 'token' => $token]
        // So user should be missing.
        $response->assertJsonMissing(['user']);
    }
}
