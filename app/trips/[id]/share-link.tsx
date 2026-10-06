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
    <div style={{ marginBottom: 16 }}>
      <button type="button" onClick={copy}>
        {status === 'copied' ? 'Copied!' : 'Copy link'}
      </button>{' '}
      <small>Anyone with the link can view and edit this trip.</small>
      {status === 'failed' && (
        <p>
          Copy this link:{' '}
          <input
            readOnly
            value={window.location.href}
            onFocus={(e) => e.target.select()}
            style={{ width: '100%' }}
          />
        </p>
      )}
    </div>
  );
}
