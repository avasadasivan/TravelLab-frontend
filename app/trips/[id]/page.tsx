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

  return (
    <main style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 640 }}>
      <p>
        <Link href="/">← All trips</Link>
      </p>
      <h1>{trip.name}</h1>
      <LiveSync tripId={trip.id} />
      <ShareLink />
      <h2>Activities</h2>
      {activities.length === 0 ? (
        <p>Nothing planned yet.</p>
      ) : (
        groupByDay(activities).map(([day, dayActivities]) => (
          <section key={day}>
            <h3>{formatDay(day)}</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {dayActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </ul>
          </section>
        ))
      )}
      <h2>Add an activity</h2>
      <NewActivityForm tripId={trip.id} />
    </main>
  );
}
