// Shown while a page waits for the backend. On the free hosting plan the
// backend sleeps when idle, so the first visit can take up to a minute.
export default function Loading() {
  return (
    <div className="grid place-items-center py-24 text-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600" />
      <p className="mt-4 font-medium">Loading your trips...</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        If this is the first visit in a while, the server is waking up. This
        can take up to a minute.
      </p>
    </div>
  );
}
