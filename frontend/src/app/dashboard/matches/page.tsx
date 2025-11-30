'use client';

import { useEffect, useState } from 'react';
import { Users, User, X, Check } from 'lucide-react';
import { matchAPI } from '@/lib/apiEndpoints';
import Notify from 'notifier-mycin';
import type { Match, MatchesResponse } from '@/model/types';

/**
 * My Matches page - list and view matches with tabs
 */
export default function MyMatchesPage() {
  const [matches, setMatches] = useState<MatchesResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'scans' | 'scanned_by'>('scans');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const data = await matchAPI.getMatches();
      setMatches(data);
    } catch (error) {
      Notify.error('Failed to load matches');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptMatch = async (matchId: number) => {
    setProcessingIds((prev) => new Set(prev).add(matchId));

    try {
      await matchAPI.accept(matchId);
      Notify.success('Match accepted successfully!');
      await loadMatches();
    } catch (error: any) {
      Notify.error(error.response?.data?.message || 'Failed to accept match');
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(matchId);
        return newSet;
      });
    }
  };

  const currentMatches = matches ? matches[activeTab] : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Matches</h1>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('scans')}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === 'scans'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            My Matches ({matches?.scans.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('scanned_by')}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === 'scanned_by'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Matched By ({matches?.scanned_by.length || 0})
          </button>
        </div>

        <div className="p-6">
          {currentMatches.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No matches yet
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {activeTab === 'scans'
                  ? 'Start scanning QR codes to create matches'
                  : 'No one has scanned you yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentMatches.map((match) => {
                const otherUser = activeTab === 'scans' ? match.scanned : match.scanner;
                const isAccepted = match.scanner_status && match.scanned_status;
                const isPending = activeTab === 'scanned_by' && !match.scanned_status;
                const isProcessing = processingIds.has(match.id);

                return (
                  <div
                    key={match.id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                  >
                    <button
                      onClick={() => setSelectedMatch(match)}
                      className="w-full text-left mb-3"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {otherUser?.firstname} {otherUser?.lastname}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {otherUser?.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            isAccepted
                              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                              : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                          }`}
                        >
                          {isAccepted ? 'Accepted' : 'Pending'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(match.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {activeTab === 'scans' && match.reason && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {match.reason}
                        </p>
                      )}
                    </button>

                    {/* Accept button removed as matches are now auto-accepted */}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Match Detail Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Match Details
              </h2>
              <button
                onClick={() => setSelectedMatch(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Name</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {activeTab === 'scans'
                    ? `${selectedMatch.scanned?.firstname} ${selectedMatch.scanned?.lastname}`
                    : `${selectedMatch.scanner?.firstname} ${selectedMatch.scanner?.lastname}`}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
                <p className="text-gray-900 dark:text-white">
                  {activeTab === 'scans' ? selectedMatch.scanned?.email : selectedMatch.scanner?.email}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Phone</p>
                <p className="text-gray-900 dark:text-white">
                  {activeTab === 'scans' ? selectedMatch.scanned?.phone : selectedMatch.scanner?.phone}
                </p>
              </div>

              {activeTab === 'scans' && selectedMatch.reason && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Reason</p>
                  <p className="text-gray-900 dark:text-white">{selectedMatch.reason}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                <span
                  className={`inline-block text-sm px-3 py-1 rounded ${
                    selectedMatch.scanner_status && selectedMatch.scanned_status
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                      : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                  }`}
                >
                  {selectedMatch.scanner_status && selectedMatch.scanned_status
                    ? 'Fully Accepted'
                    : 'Pending Acceptance'}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Matched On</p>
                <p className="text-gray-900 dark:text-white">
                  {new Date(selectedMatch.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
