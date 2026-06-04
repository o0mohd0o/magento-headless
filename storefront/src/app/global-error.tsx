"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center font-sans">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-gray-500">A critical error occurred.</p>
        <button
          onClick={reset}
          className="rounded-full bg-indigo-600 px-6 py-3 font-medium text-white"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
