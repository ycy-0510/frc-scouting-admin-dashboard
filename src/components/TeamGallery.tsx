'use client';

import { useEffect, useState } from 'react';
import TeamCard from './TeamCard';

interface Team {
  id: string;
  name: string;
  number: number;
  serial: string;
  serialQuantity: number;
}

export default function TeamGallery() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTeams() {
      try {
        const response = await fetch('/api/teams');
        if (!response.ok) {
          throw new Error('Failed to fetch teams');
        }
        const data = await response.json();
        setTeams(data.teams);
      } catch (err) {
        console.error('Error fetching teams:', err);
        setError(err instanceof Error ? err.message : 'Failed to load teams');
      } finally {
        setLoading(false);
      }
    }

    fetchTeams();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white/60 rounded-2xl shadow-lg animate-pulse">
            <div className="h-20 bg-sky-200 rounded-t-2xl" />
            <div className="p-6 space-y-4">
              <div className="h-6 bg-sky-100 rounded w-3/4" />
              <div className="h-4 bg-sky-50 rounded w-1/2" />
              <div className="h-4 bg-sky-50 rounded w-2/3" />
              <div className="h-10 bg-sky-100 rounded mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
        <p className="font-medium">Error loading teams</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="bg-sky-50 border border-sky-200 text-sky-700 px-6 py-8 rounded-lg text-center">
        <svg className="w-12 h-12 mx-auto text-sky-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p className="font-medium">No teams found</p>
        <p className="text-sm mt-1">You don&apos;t have any teams assigned to your account.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teams.map((team) => (
        <TeamCard key={team.id} team={team} />
      ))}
    </div>
  );
}
