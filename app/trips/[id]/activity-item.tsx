'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, sendJson } from '../../lib/api';

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
      <li className="card border-sky-300 p-4 ring-2 ring-sky-100">
        <div className="grid gap-3">
          <div>
            <label className="label" htmlFor={`title-${activity.id}`}>
              Title
            </label>
            <input
              id={`title-${activity.id}`}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor={`notes-${activity.id}`}>
              Notes
            </label>
            <textarea
              id={`notes-${activity.id}`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optional)"
              rows={2}
              className="input"
            />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={save} disabled={busy} className="btn-primary">
              {busy ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              disabled={busy}
              className="btn-secondary"
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
        {error && <p className="error-text">{error}</p>}
      </li>
    );
  }

  return (
    <li className="card group flex gap-4 p-4 transition hover:border-slate-300">
      {/* The day heading above already shows the date, so just the time. */}
      <div className="w-14 shrink-0 pt-0.5 font-mono text-sm font-semibold text-sky-700">
        {activity.startTime.slice(11, 16)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold">{activity.title}</h4>
          <div className="flex shrink-0 gap-1 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100 sm:focus-within:opacity-100">
            <button
              type="button"
              onClick={() => setEditing(true)}
              disabled={busy}
              className="btn-ghost"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="btn-ghost hover:bg-rose-50 hover:text-rose-600"
            >
              Delete
            </button>
          </div>
        </div>
        <p className="mt-0.5 text-sm text-slate-500">📍 {activity.location}</p>
        {activity.notes && (
          <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
            {activity.notes}
          </p>
        )}
        {error && <p className="error-text">{error}</p>}
      </div>
    </li>
  );
}
