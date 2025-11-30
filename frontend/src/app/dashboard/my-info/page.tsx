'use client';

import { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { Download, User, Mail, Phone } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/apiEndpoints';
import Notify from 'notifier-mycin';

/**
 * My Info page - displays user info and generates QR code
 */
export default function MyInfoPage() {
  const { user, setUser } = useAuthStore();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const qrContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await authAPI.getUser();
      setUser(userData);
      generateQRCode(userData);
    } catch (error) {
      Notify.error('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCode = async (userData: any) => {
    try {
      // Generate URL for public profile
      // Using window.location.origin to get current domain
      const profileUrl = `${window.location.origin}/profile/${userData.id}`;

      const url = await QRCode.toDataURL(profileUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#4F46E5',
          light: '#FFFFFF',
        },
      });

      setQrCodeUrl(url);
    } catch (error) {
      Notify.error('Failed to generate QR code');
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) {
      Notify.error('QR code not ready');
      return;
    }

    try {
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `${user?.firstname}-${user?.lastname}-qrcode.png`;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Notify.success('QR code downloaded successfully!');
    } catch (error) {
      Notify.error('Failed to download QR code');
      console.error('Download error:', error);
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
      {/* <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Information</h1> */}

      <div className="flex flex-col-reverse md:flex-row gap-6">
        {/* User Info Card - Smaller and on side/bottom */}
        <div className="w-full md:w-1/3 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-fit">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Your Details
          </h2>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.firstname} {user?.lastname}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Card - Larger and Main Focus */}
        <div className="w-full md:w-2/3 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 flex flex-col items-center">
          {/* <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Your QR Code
          </h2> */}

          <div ref={qrContainerRef} className="bg-white mb-8 shadow-inner border border-gray-100">
            {qrCodeUrl ? (
              <div className="space-y-4">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  className="mx-auto w-64 h-64 md:w-100 md:h-100 object-contain" 
                />
                {/* <p className="text-center text-lg font-medium text-gray-900">
                  {user?.firstname} {user?.lastname}
                </p> */}
              </div>
            ) : (
              <div className="w-64 h-64 md:w-80 md:h-80 flex items-center justify-center text-gray-500">
                Loading QR Code...
              </div>
            )}
          </div>

          <div className="w-full max-w-md space-y-3">
            <button
              onClick={downloadQRCode}
              className="w-full flex items-center justify-center px-6 py-4 bg-indigo-600 text-white text-lg font-medium rounded-xl hover:bg-indigo-700 transition shadow-md"
            >
              <Download className="w-6 h-6 mr-2" />
              Download QR Code
            </button>

            <button
              onClick={() => {
                const profileUrl = `${window.location.origin}/profile/${user?.id}`;
                navigator.clipboard.writeText(profileUrl);
                Notify.success('Profile URL copied to clipboard');
              }}
              className="w-full flex items-center justify-center px-6 py-4 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <span className="mr-2 text-xl">📋</span>
              Copy Profile URL
            </button>
          </div>

          <p className="mt-6 text-base text-gray-500 dark:text-gray-400 text-center max-w-sm">
            Others can scan this code or visit the URL to match with you
          </p>
        </div>
      </div>
    </div>
  );
}
