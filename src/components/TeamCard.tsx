import Link from 'next/link';

interface TeamCardProps {
  team: {
    id: string;
    name: string;
    number: number;
    serial: string;
    serialQuantity: number;
  };
}

export default function TeamCard({ team }: TeamCardProps) {
  return (
    <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-sky-100 overflow-hidden hover:-translate-y-1">
      {/* Team Number Banner */}
      <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-6 py-4">
        <div className="text-4xl font-bold text-white">
          #{team.number}
        </div>
      </div>

      {/* Team Info */}
      <div className="p-6">
        <h2 className="text-xl font-semibold text-sky-900 mb-4 group-hover:text-sky-700 transition-colors">
          {team.name}
        </h2>

        <div className="space-y-2 text-sm text-sky-700">
          {team.serial && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>Serial: {team.serial}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            <span>Serial Quantity: {team.serialQuantity}</span>
          </div>
        </div>

        {/* Action Button */}
        <Link
          href={`/teams/${team.id}`}
          className="mt-6 w-full bg-sky-50 text-sky-700 py-2.5 px-4 rounded-lg font-medium hover:bg-sky-100 transition-colors border border-sky-200 block text-center"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
