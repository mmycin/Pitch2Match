<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    protected $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    /**
     * Register a new user.
     *
     * @unauthenticated
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'firstname' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $this->userService->register($validated);

        return response()->json([
            'message' => 'success',
            'user' => new UserResource($user),
        ], 201);
    }

    /**
     * Login user.
     *
     * @unauthenticated
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($validated)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials'],
            ]);
        }

        $user = $request->user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'success',
            'token' => $token,
        ]);
    }

    /**
     * Get authenticated user profile.
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Logout user.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }
}
