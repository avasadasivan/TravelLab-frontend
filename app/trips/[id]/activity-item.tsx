'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, formatStartTime, sendJson } from '../../lib/api';

const rowStyle = { border: '1px solid #ccc', padding: 12, marginBottom: 8 };

export default function ActivityItem({ activity }: { activity: Activity }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(activity.title);
  const [notes, setNotes] = useState(activity.notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await sendJson('PATCH', `/activities/${activity.id}`, {
        title,
        notes: notes === '' ? null : notes,
        // The version this screen was built from. The server ignores it today
        // and will use it to reject stale edits with a 409 later.
        version: activity.version,
      });
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something broke');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      await sendJson('DELETE', `/activities/${activity.id}`);
      router.refresh();
    } catch (err) {
      // No finally: a successful delete removes this row from the page.
      setError(err instanceof Error ? err.message : 'Something broke');
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <li style={rowStyle}>
        <div style={{ display: 'grid', gap: 8 }}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
          />
          <div>
            <button type="button" onClick={save} disabled={busy}>
              {busy ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setTitle(activity.title);
                setNotes(activity.notes ?? '');
                setEditing(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
      </li>
    );
  }

  return (
    <li style={rowStyle}>
      <strong>{activity.title}</strong>
      <div>
        {formatStartTime(activity.startTime)} · {activity.location}
      </div>
      {activity.notes && <div>{activity.notes}</div>}
      <div style={{ marginTop: 8 }}>
        <button type="button" onClick={() => setEditing(true)} disabled={busy}>
          Edit
        </button>
        <button type="button" onClick={remove} disabled={busy}>
          Delete
        </button>
      </div>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
    </li>
  );
}
