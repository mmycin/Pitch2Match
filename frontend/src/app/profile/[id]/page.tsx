'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User, Mail, Phone, Check } from 'lucide-react';
import { authAPI, matchAPI } from '@/lib/apiEndpoints';
import { useAuthStore } from '@/store/authStore';
import Notify from 'notifier-mycin';
import type { User as UserType } from '@/model/types';

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const [profileUser, setProfileUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  const [reason, setReason] = useState('');
  const [showMatchModal, setShowMatchModal] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadProfile(params.id as string);
    }
  }, [params.id]);

  const loadProfile = async (id: string) => {
    try {
      const data = await authAPI.getPublicUser(id);
      setProfileUser(data);
    } catch (error) {
      Notify.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectClick = () => {
    if (!isAuthenticated) {
      // Store intent and redirect to login
      localStorage.setItem('pendingMatchId', params.id as string);
      router.push('/auth/login');
      return;
    }

    // If logged in, show match modal
    setShowMatchModal(true);
  };

  const handleMatchSubmit = async () => {
    if (!profileUser) return;

    setIsMatching(true);
    try {
      await matchAPI.scan({
        scanned_id: profileUser.id,
        reason: reason || undefined,
      });
      Notify.success('Match created successfully!');
      setShowMatchModal(false);
      setReason('');
      
      // Redirect to matches page
      router.push('/dashboard/matches');
    } catch (error: any) {
      Notify.error(error.response?.data?.message || 'Failed to create match');
    } finally {
      setIsMatching(false);
    }
  };

  // Check if already matched
  const [isAlreadyMatched, setIsAlreadyMatched] = useState(false);

  useEffect(() => {
    const checkMatchStatus = async () => {
      if (isAuthenticated && profileUser) {
        try {
          const matches = await matchAPI.getMatches();
          const alreadyMatched = 
            matches.scans.some(m => m.scanned_id === profileUser.id) ||
            matches.scanned_by.some(m => m.scanner_id === profileUser.id);
          
          setIsAlreadyMatched(alreadyMatched);
        } catch (error) {
          console.error('Failed to check match status', error);
        }
      }
    };
    
    checkMatchStatus();
  }, [isAuthenticated, profileUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">User not found</h1>
        <button
          onClick={() => router.push('/')}
          className="text-indigo-600 hover:text-indigo-500"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-indigo-600 h-32"></div>
        <div className="px-6 pb-6">
          <div className="relative -mt-16 mb-6">
            <div className="w-32 h-32 bg-white dark:bg-gray-700 rounded-full p-2 mx-auto shadow-lg">
              <div className="w-full h-full bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                <User className="w-16 h-16 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {profileUser.firstname} {profileUser.lastname}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Pitch2Match User</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Mail className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-gray-700 dark:text-gray-300">{profileUser.email}</span>
            </div>
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Phone className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-gray-700 dark:text-gray-300">{profileUser.phone}</span>
            </div>
          </div>

          {currentUser?.id !== profileUser.id && (
            <button
              onClick={isAlreadyMatched ? () => router.push('/dashboard/matches') : handleConnectClick}
              className={`w-full py-3 px-4 font-medium rounded-lg shadow-md transition transform flex items-center justify-center ${
                isAlreadyMatched
                  ? 'bg-green-600 hover:bg-green-700 text-white active:scale-95'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
              }`}
            >
              {isAlreadyMatched ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Already Matched - View Matches
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Connect / Match
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Match Modal */}
      {showMatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Send Match Request
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Send a request to connect with {profileUser.firstname}.
            </p>
            
            <div className="mb-6">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason (Optional)
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Hi! I'd like to connect because..."
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleMatchSubmit}
                disabled={isMatching}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {isMatching ? 'Sending...' : 'Send Request'}
              </button>
              <button
                onClick={() => setShowMatchModal(false)}
                disabled={isMatching}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
