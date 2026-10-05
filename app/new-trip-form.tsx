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
      <input
        type="text"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Paris spring break"
      />
      <button type="submit" disabled={saving}>
        {saving ? 'Adding...' : 'Add trip'}
      </button>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
    </form>
  );
}
