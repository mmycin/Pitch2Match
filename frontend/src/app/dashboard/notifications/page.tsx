'use client';

import { useEffect, useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { notificationAPI, matchAPI } from '@/lib/apiEndpoints';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuthStore } from '@/store/authStore';
import Notify from 'notifier-mycin';
import type { Notification } from '@/model/types';

/**
 * Notifications page - list, accept, and mark notifications
 */
export default function NotificationsPage() {
  const { user } = useAuthStore();
  const { notifications, setNotifications, markAsRead } = useNotificationStore();
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationAPI.getNotifications();
      setNotifications(data);
    } catch (error) {
      Notify.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (notification: Notification) => {
    if (!user) return;
    
    setProcessingIds((prev) => new Set(prev).add(notification.id));

    try {
      // We need to find the match that corresponds to this notification
      // The match is between scanner_id and scanned_id
      const matchesData = await matchAPI.getMatches();
      const match = matchesData.scanned_by.find(
        (m) => m.scanner_id === notification.scanner_id && m.scanned_id === notification.scanned_id
      );

      if (!match) {
        Notify.error('Match not found');
        return;
      }

      await matchAPI.accept(match.id);
      
      Notify.success('Match accepted successfully!');
      
      // Reload notifications to get updated status
      await loadNotifications();
      
      // Also mark as read
      await handleMarkAsRead(notification.id);
    } catch (error: any) {
      Notify.error(error.response?.data?.message || 'Failed to accept match');
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(notification.id);
        return newSet;
      });
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    setProcessingIds((prev) => new Set(prev).add(notificationId));

    try {
      await notificationAPI.markAsRead(notificationId);
      markAsRead(notificationId);
      Notify.success('Notification marked as read');
    } catch (error) {
      Notify.error('Failed to mark as read');
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
        {notifications.length > 0 && user && (
          <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium">
            {notifications.filter((n) => {
              // Apply same filtering logic as display
              if (n.type === 'Scanned' && n.scanned_id !== user.id) return false;
              if (n.type === 'Scanner' && n.scanner_id !== user.id) return false;
              return !n.read;
            }).length} unread
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
          <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No notifications yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You'll see notifications here when someone scans you or accepts your match
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications
            .filter((notification) => {
              if (!user) return false;
              
              // Only show 'Scanned' type notifications to the scanned person
              if (notification.type === 'Scanned' && notification.scanned_id !== user.id) {
                return false;
              }
              
              // Only show 'Scanner' type notifications to the scanner person
              if (notification.type === 'Scanner' && notification.scanner_id !== user.id) {
                return false;
              }
              
              return true;
            })
            .map((notification) => {
            if (!user) return null;
            
            const isProcessing = processingIds.has(notification.id);
            const isScannedType = notification.type === 'Scanned';
            const otherUser = isScannedType ? notification.scanner : notification.scanned;
            
            // Only show accept button if current user is the scanned person
            const canAccept = isScannedType && user.id === notification.scanned_id && !notification.status;

            return (
              <div
                key={notification.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${
                  !notification.read ? 'border-l-4 border-indigo-600' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          isScannedType
                            ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                            : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                        }`}
                      >
                        {isScannedType ? 'Match Request' : 'Match Accepted'}
                      </span>
                      {!notification.read && (
                        <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded text-xs font-medium">
                          New
                        </span>
                      )}
                    </div>

                    <p className="text-gray-900 dark:text-white font-medium mb-1">
                      {isScannedType
                        ? `${otherUser?.firstname} ${otherUser?.lastname} wants to match with you`
                        : `${otherUser?.firstname} ${otherUser?.lastname} accepted your match request`}
                    </p>

                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {/* Accept button removed as matches are now auto-accepted */}

                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={isProcessing}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
