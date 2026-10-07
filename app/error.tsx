'use client'; // Error boundaries must be Client Components

import Link from 'next/link';

// Shown when a page can't load its data, e.g. the backend is down or a trip
// doesn't exist, instead of Next's default error screen.
export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div className="card mx-auto max-w-md p-8 text-center">
      <div className="text-3xl">🌧️</div>
      <h2 className="mt-2 font-semibold">Something went wrong</h2>
      <p className="mt-1 text-sm text-slate-500">
        We couldn&apos;t load this page. The server may still be waking up, or
        this trip may no longer exist.
      </p>
      <div className="mt-5 flex justify-center gap-2">
        {/* retry() fetches the page's data again and re-renders it. */}
        <button type="button" onClick={() => retry()} className="btn-primary">
          Try again
        </button>
        <Link href="/" className="btn-secondary">
          All trips
        </Link>
      </div>
    </div>
  );
}
