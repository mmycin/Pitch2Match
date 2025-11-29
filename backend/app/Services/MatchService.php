<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\UserMatch;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class MatchService
{
    public function scan(User $scanner, int $scannedId, ?string $reason): UserMatch
    {
        $match = UserMatch::create([
            'scanner_id' => $scanner->id,
            'scanned_id' => $scannedId,
            'reason' => $reason,
            'scanner_status' => true,
            'scanned_status' => false,
        ]);

        // Create notification for scanned user
        Notification::create([
            'type' => 'Scanned',
            'scanner_id' => $scanner->id,
            'scanned_id' => $scannedId,
            'status' => false,
            'read' => false,
        ]);

        return $match;
    }

    public function accept(User $user, int $matchId): ?UserMatch
    {
        $match = UserMatch::where('id', $matchId)
            ->where('scanned_id', $user->id)
            ->first();

        if ($match) {
            $match->update(['scanned_status' => true]);
            
            // Create notification for scanner
            Notification::create([
                'type' => 'Scanner',
                'scanner_id' => $match->scanner_id,
                'scanned_id' => $user->id,
                'status' => true,
                'read' => false,
            ]);
            
            return $match;
        }

        return null;
    }

    public function getMatchesForScanner(User $user): Collection
    {
        return UserMatch::where('scanner_id', $user->id)
            ->with('scanned')
            ->get();
    }

    public function getMatchesForScanned(User $user): Collection
    {
        return UserMatch::where('scanned_id', $user->id)
            ->with('scanner')
            ->get()
            ->makeHidden(['reason']); // Hide reason for scanned user as per requirements
    }

    public function getMatchById(User $user, int $matchId): ?UserMatch
    {
        $match = UserMatch::with(['scanner', 'scanned'])->find($matchId);

        if (!$match) {
            return null;
        }

        // Check authorization: User must be scanner or scanned
        if ($match->scanner_id !== $user->id && $match->scanned_id !== $user->id) {
            return null;
        }

        // Hide reason if user is the scanned person
        if ($match->scanned_id === $user->id) {
            $match->makeHidden(['reason']);
        }

        return $match;
    }
}
