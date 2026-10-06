'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import { API_BASE } from '../../lib/api';

// Joins this trip's room and refetches the page whenever someone changes it.
// Refetching instead of patching state keeps the page simple and never stale.
export function LiveSync({ tripId }: { tripId: number }) {
  const router = useRouter();

  useEffect(() => {
    const socket = io(API_BASE);
    // Runs on the first connect and on every reconnect (backend restart, wifi
    // blip). Rooms don't survive a reconnect, so rejoin, then refetch to catch
    // anything that changed while this tab was offline.
    socket.on('connect', () => {
      socket.emit('trip.join', { tripId });
      router.refresh();
    });

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

  return null;
}
