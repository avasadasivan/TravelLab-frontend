import Link from 'next/link';
import { Activity, formatDay, getJson, groupByDay, Trip } from '../../lib/api';
import ActivityItem from './activity-item';
import NewActivityForm from './new-activity-form';
import { LiveSync } from './live-sync';
import { ShareLink } from './share-link';

// Fetch the trip on every request, never at build time: the data changes all the
// time, and the backend may not even be reachable while the site is building.
export const dynamic = 'force-dynamic';

export default async function TripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // In the App Router params arrives as a promise, so it has to be awaited.
  const { id } = await params;
  const [trip, activities] = await Promise.all([
    getJson<Trip>(`/trips/${id}`),
    getJson<Activity[]>(`/trips/${id}/activities`),
  ]);
  const days = groupByDay(activities);

  return (
    <main>
      <Link
        href="/"
        className="text-sm text-slate-500 hover:text-slate-800"
      >
        ← All trips
      </Link>

      <div className="mt-3 mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{trip.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <LiveSync tripId={trip.id} />
            <span>
              {activities.length}{' '}
              {activities.length === 1 ? 'activity' : 'activities'}
              {days.length > 0 &&
                ` over ${days.length} ${days.length === 1 ? 'day' : 'days'}`}
            </span>
          </div>
        </div>
        <ShareLink />
      </div>

      {/* grid-cols-1 caps the column at the screen width on phones; without it
          wide content (like date inputs) stretches the grid off screen. */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-label="Itinerary" className="min-w-0">
          {activities.length === 0 ? (
            <div className="card p-10 text-center">
              <div className="text-3xl">🧳</div>
              <p className="mt-2 font-medium">Nothing planned yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Add the first activity and it shows up here, for everyone on
                this trip.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {days.map(([day, dayActivities], index) => (
                <section key={day}>
                  <h3 className="mb-3 flex items-center gap-3 text-sm font-semibold text-slate-700">
                    <span className="rounded-full bg-sky-600 px-2.5 py-0.5 text-xs text-white">
                      Day {index + 1}
                    </span>
                    {formatDay(day)}
                  </h3>
                  <ul className="space-y-3 border-l-2 border-sky-100 pl-4">
                    {dayActivities.map((activity) => (
                      <ActivityItem key={activity.id} activity={activity} />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </section>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="card p-5">
            <h2 className="mb-4 font-semibold">Add an activity</h2>
            <NewActivityForm tripId={trip.id} />
          </div>
        </aside>
      </div>
    </main>
  );
}
