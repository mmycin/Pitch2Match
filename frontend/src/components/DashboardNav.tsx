'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, QrCode, Camera, Bell, Users, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { authAPI } from '@/lib/apiEndpoints';
import Notify from 'notifier-mycin';

/**
 * Dashboard navigation component
 */
export default function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { notifications } = useNotificationStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Calculate unread count with same filtering logic as notifications page
  const unreadCount = user ? notifications.filter((n) => {
    // Only count notifications relevant to current user
    if (n.type === 'Scanned' && n.scanned_id !== user.id) return false;
    if (n.type === 'Scanner' && n.scanner_id !== user.id) return false;
    return !n.read;
  }).length : 0;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authAPI.logout();
      logout();
      Notify.success('Logged out successfully');
      router.push('/auth/login');
    } catch (error) {
      Notify.error('Logout failed');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/my-info', icon: QrCode, label: 'My Info' },
    { href: '/dashboard/scan', icon: Camera, label: 'Scan Code' },
    { href: '/dashboard/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
    { href: '/dashboard/matches', icon: Users, label: 'My Matches' },
  ];

  return (
    <>
      {/* Top Navigation Bar - Sticky Top */}
      <nav className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                Pitch2Match
              </h1>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center px-3 py-2 rounded-lg transition ${
                      isActive
                        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    <span>{item.label}</span>
                    {item.badge ? (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {user?.firstname} {user?.lastname}
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50"
              >
                <LogOut className="w-5 h-5 mr-2" />
                <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar - Fixed Bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center w-full h-full transition ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
                  {item.badge ? (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
