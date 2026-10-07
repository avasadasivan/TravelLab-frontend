'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendJson } from './lib/api';

export default function NewTripForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await sendJson('POST', '/trips', { name });
      setName('');
      // Re-runs the Server Component above, so the new trip appears in the
      // list without a full page reload.
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something broke');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Trip name, e.g. Paris spring break"
          aria-label="Trip name"
          className="input"
        />
        <button type="submit" disabled={saving} className="btn-primary shrink-0">
          {saving ? 'Creating...' : 'Create trip'}
        </button>
      </div>
      {error && <p className="error-text">{error}</p>}
    </form>
  );
}
