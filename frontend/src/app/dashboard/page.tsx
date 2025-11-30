'use client';

import { useAuthStore } from '@/store/authStore';
import { QrCode, Camera, Bell, Users } from 'lucide-react';
import Link from 'next/link';

/**
 * Dashboard home page
 */
export default function DashboardPage() {
  const { user } = useAuthStore();

  const features = [
    {
      title: 'My Info',
      description: 'View and download your QR code',
      icon: QrCode,
      href: '/dashboard/my-info',
      color: 'indigo',
    },
    {
      title: 'Scan Code',
      description: 'Scan QR codes to match with others',
      icon: Camera,
      href: '/dashboard/scan',
      color: 'green',
    },
    {
      title: 'Notifications',
      description: 'View and manage your notifications',
      icon: Bell,
      href: '/dashboard/notifications',
      color: 'yellow',
    },
    {
      title: 'My Matches',
      description: 'View all your matches',
      icon: Users,
      href: '/dashboard/matches',
      color: 'purple',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.firstname}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          What would you like to do today?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link
              key={feature.href}
              href={feature.href}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg bg-${feature.color}-100 dark:bg-${feature.color}-900/20`}>
                  <Icon className={`w-6 h-6 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                    {feature.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
