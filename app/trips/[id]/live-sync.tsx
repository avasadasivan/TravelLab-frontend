'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import { API_BASE } from '../../lib/api';

// Joins this trip's room and refetches the page whenever someone changes it.
// Refetching instead of patching state keeps the page simple and never stale.
// Also shows whether the live connection is up.
export function LiveSync({ tripId }: { tripId: number }) {
  const router = useRouter();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(API_BASE);
    // Runs on the first connect and on every reconnect (backend restart, wifi
    // blip). Rooms don't survive a reconnect, so rejoin, then refetch to catch
    // anything that changed while this tab was offline.
    socket.on('connect', () => {
      socket.emit('trip.join', { tripId });
      setConnected(true);
      router.refresh();
    });
    socket.on('disconnect', () => setConnected(false));

    const refresh = () => router.refresh();
    socket.on('trip.updated', refresh);
    socket.on('activity.created', refresh);
    socket.on('activity.updated', refresh);
    socket.on('activity.deleted', refresh);
    // The trip is gone, so there's nothing left to show here.
    socket.on('trip.deleted', () => router.push('/'));

    return () => {
      socket.disconnect();
    };
  }, [tripId, router]);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        connected
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-slate-100 text-slate-500'
      }`}
      title={
        connected
          ? 'Changes from anyone on this trip appear instantly'
          : 'Connecting to live updates...'
      }
    >
      <span className="relative flex h-2 w-2">
        {connected && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            connected ? 'bg-emerald-500' : 'bg-slate-400'
          }`}
        />
      </span>
      {connected ? 'Live' : 'Connecting...'}
    </span>
  );
}
