'use client';

interface Event {
  name: string;
  code: string;
  isCurrent: boolean;
}

interface EventListProps {
  events: Event[];
}

export default function EventList({ events }: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="bg-sky-50 border border-sky-200 text-sky-700 px-6 py-8 rounded-lg text-center">
        <svg className="w-12 h-12 mx-auto text-sky-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="font-medium">No 2026 events found</p>
        <p className="text-sm mt-1">No events have been configured for this team.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => {
        const hasTbaCode = event.code && event.code.trim() !== '';
        
        return (
          <div
            key={event.name}
            className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 ${
              event.isCurrent ? 'border-sky-400 ring-2 ring-sky-200' : 'border-sky-100'
            }`}
          >
            {/* Event Header */}
            <div className={`px-6 py-4 ${
              event.isCurrent 
                ? 'bg-gradient-to-r from-sky-500 to-sky-600' 
                : 'bg-gradient-to-r from-sky-400 to-sky-500'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {event.name.replace(/_/g, ' ')}
                </h3>
                {event.isCurrent && (
                  <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Current
                  </span>
                )}
              </div>
            </div>

            {/* Event Body */}
            <div className="p-6">
              <div className="flex items-center gap-2 text-sky-600 mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="font-mono text-sm">
                  {hasTbaCode ? event.code : 'No TBA Code'}
                </span>
              </div>

              {/* TBA Link or Disabled */}
              {hasTbaCode ? (
                <a
                  href={`https://www.thebluealliance.com/event/${event.code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-sky-50 text-sky-700 py-2.5 px-4 rounded-lg font-medium hover:bg-sky-100 transition-colors border border-sky-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View on TBA
                </a>
              ) : (
                <div className="flex items-center justify-center gap-2 w-full bg-gray-50 text-gray-400 py-2.5 px-4 rounded-lg font-medium border border-gray-200 cursor-not-allowed">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  No TBA Link
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
