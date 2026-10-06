// Everything the app knows about the backend lives here. In production,
// NEXT_PUBLIC_API_BASE is the deployed backend's URL. NEXT_PUBLIC_ variables
// are baked in when the app is built, so set it before building.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3001';

export type Trip = { id: number; name: string; version: number };

export type Activity = {
  id: number;
  tripId: number;
  title: string;
  // Local wall-clock time at the destination: "2026-11-03T10:00"
  startTime: string;
  timeZone: string;
  location: string;
  notes: string | null;
  version: number;
};

export async function getJson<T>(path: string): Promise<T> {
  // no-store keeps Next from caching the response, so a reload always shows
  // the current data.
  const res = await fetch(API_BASE + path, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`GET ${path} failed with ${res.status}`);
  }
  return res.json();
}

// Used by the forms, which run in the browser. This is the call CORS applies
// to: the page is on port 3000 and the backend on 3001.
export async function sendJson(
  method: 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<void> {
  const res = await fetch(API_BASE + path, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    // The backend sends one error shape for every endpoint, so one reader
    // works everywhere.
    const problem = await res.json().catch(() => null);
    const message = Array.isArray(problem?.message)
      ? problem.message.join(', ')
      : problem?.message;
    throw new Error(message || `${method} ${path} failed with ${res.status}`);
  }
}

// "2026-11-03T10:00" -> "Tue, Nov 3, 10:00"
export function formatStartTime(startTime: string): string {
  const [date, time] = startTime.split('T');
  return `${formatDay(date)}, ${time}`;
}

// "2026-11-03" -> "Tue, Nov 3"
export function formatDay(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  // Built from the parts in local time, so the day never shifts across time
  // zones.
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

// Splits activities into days, keyed by "2026-11-03". The API already sorts
// by startTime, so the days and each day's activities come out in order.
export function groupByDay(activities: Activity[]): [string, Activity[]][] {
  const days = new Map<string, Activity[]>();
  for (const activity of activities) {
    const day = activity.startTime.slice(0, 10);
    days.set(day, [...(days.get(day) ?? []), activity]);
  }
  return [...days];
}

// The zone the person is sitting in. Good enough until there's a city picker.
export function browserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
