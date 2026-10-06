import Link from 'next/link';
import { Activity, getJson, Trip } from '../../lib/api';
import ActivityItem from './activity-item';
import NewActivityForm from './new-activity-form';

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
      <h2>Activities</h2>
      {activities.length === 0 ? (
        <p>Nothing planned yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </ul>
      )}
      <h2>Add an activity</h2>
      <NewActivityForm tripId={trip.id} />
    </main>
  );
}
