import { NextResponse } from 'next/server';

interface TBAEvent {
  key: string;
  name: string;
  event_code: string;
  event_type: number;
  city: string;
  state_prov: string;
  country: string;
  start_date: string;
  end_date: string;
}

export async function GET() {
  try {
    const apiKey = process.env.TBA_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'TBA API key not configured' },
        { status: 500 }
      );
    }

    // Fetch 2026 events from TBA API
    const response = await fetch(
      'https://www.thebluealliance.com/api/v3/events/2026/simple',
      {
        headers: {
          'X-TBA-Auth-Key': apiKey,
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      console.error('TBA API error:', response.status, await response.text());
      return NextResponse.json(
        { error: 'Failed to fetch events from TBA' },
        { status: 502 }
      );
    }

    const tbaEvents: TBAEvent[] = await response.json();

    // Transform to simpler format
    const events = tbaEvents
      .filter(e => e.event_type !== 99 && e.event_type !== 100) // Exclude offseason and preseason
      .map(e => ({
        key: e.key,
        name: e.name,
        code: e.key,
        city: e.city,
        state: e.state_prov,
        country: e.country,
        startDate: e.start_date,
        endDate: e.end_date,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ events });
  } catch (error) {
    console.error('TBA events error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
