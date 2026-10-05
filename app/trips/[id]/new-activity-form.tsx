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
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8 }}>
      <input
        type="text"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Visit the Louvre"
      />
      <input
        type="date"
        required
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <input
        type="time"
        required
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />
      <input
        type="text"
        required
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Paris"
      />
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
      />
      <button type="submit" disabled={saving}>
        {saving ? 'Adding...' : 'Add activity'}
      </button>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
    </form>
  );
}
