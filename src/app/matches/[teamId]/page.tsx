'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import EventList from '@/components/MatchList';

interface Event {
  name: string;
  code: string;
  isCurrent: boolean;
}

export default function MatchesPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId as string;
  
  const [events, setEvents] = useState<Event[]>([]);
  const [currentEvent, setCurrentEvent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/matches/${teamId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data.events || []);
      setCurrentEvent(data.currentEvent);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    if (teamId) {
      fetchData();
    }
  }, [teamId, fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-sky-200 rounded w-1/3" />
            <div className="h-4 bg-sky-100 rounded w-1/4" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white rounded-2xl h-40" />
              <div className="bg-white rounded-2xl h-40" />
              <div className="bg-white rounded-2xl h-40" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <p className="font-medium">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <button
          onClick={() => router.push(`/teams/${teamId}`)}
          className="flex items-center gap-2 text-sky-600 hover:text-sky-800 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Team Details
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-gradient-to-r from-sky-500 to-sky-600 text-white px-4 py-2 rounded-lg font-bold text-2xl">
              #{teamId}
            </div>
            <h1 className="text-3xl font-bold text-sky-900">
              2026 Events
            </h1>
          </div>
          <p className="text-sky-600">
            {events.length} event{events.length !== 1 ? 's' : ''} configured
            {currentEvent && ` • Current: ${currentEvent.replace(/_/g, ' ')}`}
          </p>
        </div>

        {/* Events List */}
        <EventList events={events} />
      </main>
    </div>
  );
}
