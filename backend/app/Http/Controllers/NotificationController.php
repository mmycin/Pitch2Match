<?php

namespace App\Http\Controllers;

use App\Services\NotificationService;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * List user's notifications.
     *
     * Returns all notifications where the user is either scanner or scanned.
     */
    public function index(Request $request)
    {
        $notifications = $this->notificationService->getUserNotifications($request->user());

        return response()->json($notifications);
    }

    /**
     * Mark notification as read.
     */
    public function markAsRead(Request $request, $id)
    {
        $notification = $this->notificationService->markAsRead($request->user(), $id);

        if (!$notification) {
            return response()->json(['message' => 'Notification not found or not authorized'], 404);
        }

        return response()->json($notification);
    }
}
