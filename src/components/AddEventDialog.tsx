'use client';

import { useState, useEffect, useRef } from 'react';

interface TBAEvent {
  key: string;
  name: string;
  code: string;
  city: string;
  state: string;
  country: string;
  startDate: string;
  endDate: string;
}

interface AddEventDialogProps {
  isOpen: boolean;
  teamId: string;
  currentEventCount: number;
  eventQuota: number;
  existingEventCodes: string[];
  onSuccess: () => void;
  onClose: () => void;
}

export default function AddEventDialog({
  isOpen,
  teamId,
  currentEventCount,
  eventQuota,
  existingEventCodes,
  onSuccess,
  onClose,
}: AddEventDialogProps) {
  const [events, setEvents] = useState<TBAEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<TBAEvent[]>([]);
  const [tbaSearch, setTbaSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showTbaDropdown, setShowTbaDropdown] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form fields
  const [eventName, setEventName] = useState('');
  const [selectedTba, setSelectedTba] = useState<TBAEvent | null>(null);

  const remainingQuota = eventQuota - currentEventCount;

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
      setEventName('');
      setSelectedTba(null);
      setTbaSearch('');
      setError('');
      fetchEvents();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  useEffect(() => {
    if (tbaSearch) {
      const lower = tbaSearch.toLowerCase();
      setFilteredEvents(
        events.filter(
          e =>
            e.name.toLowerCase().includes(lower) ||
            e.code.toLowerCase().includes(lower) ||
            e.city?.toLowerCase().includes(lower)
        ).slice(0, 10)
      );
    } else {
      setFilteredEvents(events.slice(0, 10));
    }
  }, [tbaSearch, events]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowTbaDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tba/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      const available = data.events.filter(
        (e: TBAEvent) => !existingEventCodes.includes(e.code)
      );
      setEvents(available);
      setFilteredEvents(available.slice(0, 10));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTba = (event: TBAEvent) => {
    setSelectedTba(event);
    setTbaSearch('');
    setShowTbaDropdown(false);
    // Auto-fill event name if empty
    if (!eventName) {
      setEventName(event.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim()) {
      setError('Event name is required');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const formattedName = `2026_${eventName.trim().replace(/\s+/g, '_')}`;
      const response = await fetch(`/api/matches/${teamId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: formattedName,
          tbaCode: selectedTba?.code || '',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add event');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add event');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 bg-transparent p-0"
      onClose={onClose}
    >
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-sky-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-sky-900">Add 2026 Event</h3>
              <button
                onClick={onClose}
                className="text-sky-400 hover:text-sky-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-sky-600 mt-1">
              {remainingQuota > 0
                ? `You can add ${remainingQuota} more event(s)`
                : 'Event quota reached'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Event Name */}
            <div>
              <label className="block text-sm font-medium text-sky-800 mb-2">
                Event Name *
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Central Illinois Regional"
                className="w-full px-4 py-3 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                required
              />
              <p className="text-xs text-sky-500 mt-1">
                Saved as: 2026_{eventName.trim().replace(/\s+/g, '_') || 'Event_Name'}
              </p>
            </div>

            {/* TBA Code (optional dropdown) */}
            <div ref={dropdownRef} className="relative">
              <label className="block text-sm font-medium text-sky-800 mb-2">
                Link to TBA Event (optional)
              </label>
              
              {selectedTba ? (
                <div className="flex items-center gap-2 p-3 bg-sky-50 border border-sky-200 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sky-900 truncate">{selectedTba.name}</p>
                    <p className="text-xs text-sky-500 font-mono">{selectedTba.code}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTba(null)}
                    className="text-sky-400 hover:text-sky-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={tbaSearch}
                    onChange={(e) => {
                      setTbaSearch(e.target.value);
                      setShowTbaDropdown(true);
                    }}
                    onFocus={() => setShowTbaDropdown(true)}
                    placeholder="Search TBA events or leave empty..."
                    className="w-full px-4 py-3 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  />
                  
                  {showTbaDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-sky-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {loading ? (
                        <div className="p-4 text-center text-sky-500">Loading...</div>
                      ) : filteredEvents.length === 0 ? (
                        <div className="p-4 text-center text-sky-500">No events found</div>
                      ) : (
                        filteredEvents.map((event) => (
                          <button
                            key={event.key}
                            type="button"
                            onClick={() => handleSelectTba(event)}
                            className="w-full text-left px-4 py-2 hover:bg-sky-50 border-b border-sky-50 last:border-0"
                          >
                            <p className="font-medium text-sky-900 truncate text-sm">{event.name}</p>
                            <p className="text-xs text-sky-500 font-mono">{event.code}</p>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
              <p className="text-xs text-sky-500 mt-1">
                {selectedTba ? 'Event will link to The Blue Alliance' : 'Leave empty for no TBA link'}
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving || remainingQuota <= 0 || !eventName.trim()}
              className="w-full bg-sky-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Adding...' : 'Add Event'}
            </button>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-sky-100">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-sky-700 hover:bg-sky-50 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
