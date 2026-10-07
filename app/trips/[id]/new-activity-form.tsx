'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { browserTimeZone, sendJson } from '../../lib/api';

export default function NewActivityForm({ tripId }: { tripId: number }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await sendJson('POST', `/trips/${tripId}/activities`, {
        title,
        // The contract wants one local wall-clock string, and the two inputs
        // already give it in the right format.
        startTime: `${date}T${time}`,
        timeZone: browserTimeZone(),
        location,
        // An empty box means "no notes", which the API spells as null.
        notes: notes === '' ? null : notes,
      });
      setTitle('');
      setDate('');
      setTime('');
      setLocation('');
      setNotes('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something broke');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <div>
        <label className="label" htmlFor="activity-title">
          What
        </label>
        <input
          id="activity-title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Visit the Louvre"
          className="input"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="activity-date">
            Date
          </label>
          <input
            id="activity-date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="activity-time">
            Time
          </label>
          <input
            id="activity-time"
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="input"
          />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="activity-location">
          Where
        </label>
        <input
          id="activity-location"
          type="text"
          required
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Paris"
          className="input"
        />
      </div>
      <div>
        <label className="label" htmlFor="activity-notes">
          Notes <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          id="activity-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Buy tickets beforehand"
          rows={2}
          className="input"
        />
      </div>
      <button type="submit" disabled={saving} className="btn-primary w-full">
        {saving ? 'Adding...' : 'Add to itinerary'}
      </button>
      {error && <p className="error-text">{error}</p>}
    </form>
  );
}
