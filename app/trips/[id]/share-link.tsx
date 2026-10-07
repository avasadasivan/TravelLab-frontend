'use client';

import { useState } from 'react';

// There are no accounts yet, so sharing a trip means sharing its URL.
export function ShareLink() {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus('copied');
      setTimeout(() => setStatus('idle'), 2000);
    } catch {
      // The clipboard API needs https (or localhost) and permission; if it's
      // unavailable, show the link so it can be copied by hand.
      setStatus('failed');
    }
  }

  return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      <button type="button" onClick={copy} className="btn-secondary">
        {status === 'copied' ? '✓ Copied!' : '🔗 Copy link'}
      </button>
      <p className="text-xs text-slate-500">
        Anyone with the link can view and edit this trip.
      </p>
      {status === 'failed' && (
        <div className="w-full max-w-sm">
          <label className="label">Copy this link:</label>
          <input
            readOnly
            value={window.location.href}
            onFocus={(e) => e.target.select()}
            className="input"
          />
        </div>
      )}
    </div>
  );
}
