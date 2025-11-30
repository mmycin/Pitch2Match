import { create } from 'zustand';
import type { Notification } from '@/model/types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  
  setNotifications: (notifications: Notification[]) => void;
  markAsRead: (id: number) => void;
  addNotification: (notification: Notification) => void;
}

/**
 * Zustand store for notifications state
 */
export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) => {
    const unreadCount = notifications.filter((n) => !n.read).length;
    set({ notifications, unreadCount });
  },

  markAsRead: (id) =>
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      const unreadCount = notifications.filter((n) => !n.read).length;
      return { notifications, unreadCount };
    }),

  addNotification: (notification) =>
    set((state) => {
      const notifications = [notification, ...state.notifications];
      const unreadCount = notifications.filter((n) => !n.read).length;
      return { notifications, unreadCount };
    }),
}));
