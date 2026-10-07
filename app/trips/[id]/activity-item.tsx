'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, ApiError, sendJson } from '../../lib/api';

export default function ActivityItem({ activity }: { activity: Activity }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(activity.title);
  const [notes, setNotes] = useState(activity.notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // The version this edit is based on, captured when editing starts. Not
  // activity.version: live sync refreshes that prop while you type, which
  // would quietly turn a stale edit into an overwrite.
  const [baseVersion, setBaseVersion] = useState(activity.version);
  // Someone else's newer version, when the server answered 409.
  const [conflict, setConflict] = useState<Activity | null>(null);

  function startEditing() {
    setTitle(activity.title);
    setNotes(activity.notes ?? '');
    setBaseVersion(activity.version);
    setConflict(null);
    setError(null);
    setEditing(true);
  }

  async function save(version = baseVersion) {
    setBusy(true);
    setError(null);
    try {
      await sendJson('PATCH', `/activities/${activity.id}`, {
        title,
        notes: notes === '' ? null : notes,
        version,
      });
      setEditing(false);
      setConflict(null);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // Someone saved first. Keep the user's edits on screen and show theirs.
        setConflict((err.body as { current: Activity }).current);
      } else {
        setError(err instanceof Error ? err.message : 'Something broke');
      }
    } finally {
      setBusy(false);
    }
  }

  function takeTheirs() {
    setConflict(null);
    setEditing(false);
    router.refresh();
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
            <button type="button" onClick={() => save()} disabled={busy} className="btn-primary">
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
        {conflict && (
          <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
            <p className="font-medium text-amber-900">
              Someone else changed this activity while you were editing.
            </p>
            <p className="mt-2 text-amber-900">Their version:</p>
            <p className="mt-1 rounded-md bg-white px-3 py-2 text-slate-700">
              <span className="font-semibold">{conflict.title}</span>
              {conflict.notes && <> · {conflict.notes}</>}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                className="btn-primary"
                // Re-save my edits on top of their version, on purpose this time.
                onClick={() => save(conflict.version)}
              >
                Keep my changes
              </button>
              <button
                type="button"
                disabled={busy}
                className="btn-secondary"
                onClick={takeTheirs}
              >
                Use their version
              </button>
            </div>
          </div>
        )}
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
              onClick={startEditing}
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
