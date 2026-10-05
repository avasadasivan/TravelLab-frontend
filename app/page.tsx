import Link from 'next/link';
import { getJson, Trip } from './lib/api';
import NewTripForm from './new-trip-form';

// A Server Component: this fetch runs on the Next.js server, not in the
// browser, so CORS doesn't apply to it.
export default async function Home() {
  const trips = await getJson<Trip[]>('/trips');

  return (
    <main style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 640 }}>
      <h1>TravelLab</h1>
      <h2>Your trips</h2>
      {trips.length === 0 ? (
        <p>No trips yet. Add one below.</p>
      ) : (
        <ul>
          {trips.map((trip) => (
            <li key={trip.id}>
              <Link href={`/trips/${trip.id}`}>{trip.name}</Link>
            </li>
          ))}
        </ul>
      )}
      <h2>New trip</h2>
      <NewTripForm />
    </main>
  );
}
