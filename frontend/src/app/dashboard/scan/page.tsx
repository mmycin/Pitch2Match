'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';
import { Camera, X } from 'lucide-react';
import { matchAPI } from '@/lib/apiEndpoints';
import Notify from 'notifier-mycin';
import type { User } from '@/model/types';

/**
 * Scan Code page - camera QR scanning and match creation
 */
export default function ScanCodePage() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedUser, setScannedUser] = useState<User | null>(null);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startScanning = () => {
    setIsScanning(true);
    scanIntervalRef.current = setInterval(captureAndScan, 500);
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          handleQRCodeDetected(code.data);
        } else {
          Notify.error('No QR code found in the image');
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const captureAndScan = useCallback(() => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        handleQRCodeDetected(code.data);
      }
    };
    img.src = imageSrc;
  }, []);

  const handleQRCodeDetected = (data: string) => {
    stopScanning();

    // Check if it's a profile URL
    if (data.includes('/profile/')) {
      const parts = data.split('/profile/');
      if (parts.length > 1) {
        const userId = parts[1];
        router.push(`/profile/${userId}`);
        Notify.success('Redirecting to profile...');
        return;
      }
    }

    // Fallback for old JSON format (optional, but good for backward compatibility)
    try {
      const userData = JSON.parse(data);
      if (userData.id) {
        router.push(`/profile/${userData.id}`);
        Notify.success('Redirecting to profile...');
        return;
      }
    } catch (e) {
      // Not JSON, and not a matching URL
    }

    Notify.error('Invalid QR code format');
  };

  const handleMakeMatch = async () => {
    if (!scannedUser) return;

    setIsSubmitting(true);

    try {
      await matchAPI.scan({
        scanned_id: scannedUser.id,
        reason: reason || undefined,
      });

      Notify.success('Match created successfully!');
      setScannedUser(null);
      setReason('');
    } catch (error: any) {
      Notify.error(error.response?.data?.message || 'Failed to create match');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelScan = () => {
    setScannedUser(null);
    setReason('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Scan QR Code</h1>

      {!scannedUser ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="space-y-4">
            {!isScanning ? (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <Camera className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Scan QR Code
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Choose how you want to scan the QR code
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={startScanning}
                    className="flex flex-col items-center justify-center p-6 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition"
                  >
                    <Camera className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mb-3" />
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Use Camera
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      Scan QR code using your camera
                    </p>
                  </button>

                  <label className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <svg className="w-12 h-12 text-gray-600 dark:text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Upload Image
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      Upload an image containing a QR code
                    </p>
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      facingMode: 'environment',
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 border-4 border-indigo-500 rounded-lg"></div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Position the QR code within the frame
                  </p>
                  <button
                    onClick={stopScanning}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Stop Scanning
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Scanned User Information
          </h2>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Name</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {scannedUser.firstname} {scannedUser.lastname}
            </p>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Email</p>
            <p className="text-gray-900 dark:text-white mb-4">{scannedUser.email}</p>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Phone</p>
            <p className="text-gray-900 dark:text-white">{scannedUser.phone}</p>
          </div>

          <div className="mb-6">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason for Matching (Optional)
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Why do you want to match with this person?"
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleMakeMatch}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Match...' : 'Make Match'}
            </button>
            <button
              onClick={cancelScan}
              disabled={isSubmitting}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
