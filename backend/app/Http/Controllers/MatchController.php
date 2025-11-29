<?php

namespace App\Http\Controllers;

use App\Services\MatchService;
use Illuminate\Http\Request;

class MatchController extends Controller
{
    protected $matchService;

    public function __construct(MatchService $matchService)
    {
        $this->matchService = $matchService;
    }

    /**
     * Scan another user.
     *
     * Creates a match record with scanner_status = true.
     */
    public function scan(Request $request)
    {
        $validated = $request->validate([
            'scanned_id' => 'required|exists:users,id',
            'reason' => 'nullable|string|max:255',
        ]);

        if ($request->user()->id == $validated['scanned_id']) {
            return response()->json(['message' => 'You cannot scan yourself'], 400);
        }

        $match = $this->matchService->scan(
            $request->user(),
            $validated['scanned_id'],
            $validated['reason'] ?? null
        );

        return response()->json($match, 201);
    }

    /**
     * Accept a match.
     *
     * Updates the match record with scanned_status = true.
     */
    public function accept(Request $request, $id)
    {
        $match = $this->matchService->accept($request->user(), $id);

        if (!$match) {
            return response()->json(['message' => 'Match not found or not authorized'], 404);
        }

        return response()->json($match);
    }

    /**
     * List matches.
     *
     * Returns matches where the user is the scanner and matches where the user was scanned.
     */
    public function index(Request $request)
    {
        $scans = $this->matchService->getMatchesForScanner($request->user());
        $scanned = $this->matchService->getMatchesForScanned($request->user());

        return response()->json([
            'scans' => $scans,
            'scanned_by' => $scanned,
        ]);
    }

    /**
     * Get a specific match.
     *
     * Returns match details if the user is authorized (scanner or scanned).
     */
    public function show(Request $request, $id)
    {
        $match = $this->matchService->getMatchById($request->user(), $id);

        if (!$match) {
            return response()->json(['message' => 'Match not found or not authorized'], 404);
        }

        return response()->json($match);
    }
}
