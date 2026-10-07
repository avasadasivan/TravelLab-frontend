import Link from 'next/link';
import { getJson, Trip } from './lib/api';
import NewTripForm from './new-trip-form';

// Fetch trips on every request, never at build time: the data changes all the
// time, and the backend may not even be reachable while the site is building.
export const dynamic = 'force-dynamic';

// A Server Component: this fetch runs on the Next.js server, not in the
// browser, so CORS doesn't apply to it.
export default async function Home() {
  const trips = await getJson<Trip[]>('/trips');

  return (
    <main className="space-y-10">
      <section className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Plan trips together, in real time.
        </h1>
        <p className="mt-3 text-slate-600">
          Build a day-by-day itinerary with friends. Open the same trip on two
          devices: every change shows up on both instantly.
        </p>
      </section>

      <section className="card p-5">
        <h2 className="mb-3 font-semibold">Start a new trip</h2>
        <NewTripForm />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Your trips</h2>
        {trips.length === 0 ? (
          <div className="card p-8 text-center text-slate-500">
            No trips yet. Create your first one above.
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <li key={trip.id}>
                <Link
                  href={`/trips/${trip.id}`}
                  className="card group block p-5 transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
                >
                  <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-xl">
                    🗺️
                  </div>
                  <h3 className="font-semibold group-hover:text-sky-700">
                    {trip.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Open itinerary →
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
