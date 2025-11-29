<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class NotificationService
{
    public function getUserNotifications(User $user): Collection
    {
        return Notification::where('scanner_id', $user->id)
            ->orWhere('scanned_id', $user->id)
            ->with(['scanner', 'scanned'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function markAsRead(User $user, int $notificationId): ?Notification
    {
        $notification = Notification::where('id', $notificationId)
            ->where(function ($query) use ($user) {
                $query->where('scanner_id', $user->id)
                    ->orWhere('scanned_id', $user->id);
            })
            ->first();

        if ($notification) {
            $notification->update(['read' => true]);
            return $notification;
        }

        return null;
    }
}
