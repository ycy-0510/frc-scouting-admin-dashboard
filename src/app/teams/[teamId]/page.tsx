'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import Navbar from '@/components/Navbar';
import MemberList from '@/components/MemberList';
import AddEventDialog from '@/components/AddEventDialog';
import EditTeamDialog from '@/components/EditTeamDialog';
import EditEventDialog from '@/components/EditEventDialog';

interface Member {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  disabled: boolean;
  createdAt?: string;
}

interface Team {
  id: string;
  name: string;
  number: number;
  eventQuota?: number;
  serial?: string;
  serialQuantity?: number;
}

interface Event {
  name: string;
  code: string;
  isCurrent: boolean;
}

type TabType = 'members' | 'events';

export default function TeamDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const teamId = params.teamId as string;
  
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('members');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showEditTeam, setShowEditTeam] = useState(false);
  const [showEditEvent, setShowEditEvent] = useState<Event | null>(null);

  const eventQuota = team?.eventQuota ?? 1;
  const isMaster = user?.role === 'master';

  const fetchData = useCallback(async () => {
    try {
      // Fetch team info
      const teamsRes = await fetch('/api/teams');
      const teamsData = await teamsRes.json();
      const teamInfo = teamsData.teams?.find((t: Team) => t.id === teamId);
      if (teamInfo) {
        setTeam(teamInfo);
      }

      // Fetch members
      const membersRes = await fetch(`/api/teams/${teamId}/members`);
      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData.members || []);
      }

      // Fetch events
      const eventsRes = await fetch(`/api/matches/${teamId}`);
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData.events || []);
      }
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

  const handleDeleteEvent = async (eventName: string) => {
    if (!confirm(`Are you sure you want to delete event "${eventName}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/matches/${teamId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName }),
      });

      if (!res.ok) throw new Error('Failed to delete event');
      fetchData();
    } catch {
      alert('Failed to delete event');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-sky-200 rounded w-1/3" />
            <div className="h-4 bg-sky-100 rounded w-1/4" />
            <div className="bg-white rounded-2xl h-64" />
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

  const tabs: { id: TabType; label: string; count: number }[] = [
    { id: 'members', label: 'Members', count: members.length },
    { id: 'events', label: 'Events', count: events.length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sky-600 hover:text-sky-800 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Teams
        </button>

        {/* Team Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-gradient-to-r from-sky-500 to-sky-600 text-white px-4 py-2 rounded-lg font-bold text-2xl">
                #{team?.number || teamId}
              </div>
              <h1 className="text-3xl font-bold text-sky-900">
                {team?.name || `Team ${teamId}`}
              </h1>
            </div>
            
            {isMaster && (
              <button
                onClick={() => setShowEditTeam(true)}
                className="flex items-center gap-2 bg-white text-sky-600 border border-sky-200 px-4 py-2 rounded-lg font-medium hover:bg-sky-50 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Team
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-1 p-1 bg-sky-100 rounded-xl w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-white text-sky-700 shadow-sm'
                    : 'text-sky-600 hover:text-sky-800'
                }`}
              >
                {tab.label}
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === tab.id
                    ? 'bg-sky-100 text-sky-700'
                    : 'bg-sky-200/50 text-sky-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Add Event Button - only show on events tab */}
          {activeTab === 'events' && (
            <button
              onClick={() => setShowAddEvent(true)}
              disabled={!isMaster && events.length >= eventQuota}
              className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Event
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                {events.length}/{eventQuota}
              </span>
            </button>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'members' && (
          <MemberList
            members={members}
            currentUserUid={user?.uid || ''}
            currentUserRole={user?.role}
            teamId={teamId}
            onRefresh={fetchData}
          />
        )}

        {activeTab === 'events' && (
          <div className="space-y-4">
             {events.map((event) => (
              <div key={event.code} className="bg-white p-4 rounded-xl shadow-sm border border-sky-100 flex justify-between items-center group">
                 <div>
                    <h3 className="font-semibold text-lg text-sky-900">{event.name}</h3>
                    <p className="text-sm text-sky-500 font-mono">{event.code}</p>
                 </div>
                 <div className="flex items-center gap-3">
                   {event.isCurrent && (
                     <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                       Active
                     </span>
                   )}
                   {isMaster && (
                     <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button
                         onClick={() => setShowEditEvent(event)}
                         className="text-sky-400 hover:text-sky-600 p-2"
                         title="Edit Event Connection"
                       >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                         </svg>
                       </button>
                       <button
                         onClick={() => handleDeleteEvent(event.name)}
                         className="text-red-400 hover:text-red-600 p-2"
                         title="Delete Event"
                       >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                       </button>
                     </div>
                   )}
                 </div>
              </div>
             ))}
             {events.length === 0 && (
               <div className="text-center py-12 text-sky-400">
                 No events found
               </div>
             )}
          </div>
        )}
      </main>

      {/* Add Event Dialog */}
      <AddEventDialog
        isOpen={showAddEvent}
        teamId={teamId}
        currentEventCount={events.length}
        eventQuota={eventQuota}
        existingEventCodes={events.map(e => e.code)}
        onSuccess={fetchData}
        onClose={() => setShowAddEvent(false)}
      />

      {/* Edit Team Dialog */}
      {team && (
        <EditTeamDialog
          isOpen={showEditTeam}
          onClose={() => setShowEditTeam(false)}
          onSuccess={fetchData}
          team={team}
        />
      )}
      {/* Edit Event Dialog */}
      {showEditEvent && (
        <EditEventDialog
          isOpen={!!showEditEvent}
          teamId={teamId}
          eventName={showEditEvent.name}
          currentCode={showEditEvent.code}
          onSuccess={fetchData}
          onClose={() => setShowEditEvent(null)}
        />
      )}
    </div>
  );
}
