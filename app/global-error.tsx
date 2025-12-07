"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-void text-text-primary">
          <div className="text-center max-w-md mx-auto px-4">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Application Error</h2>
            <p className="text-text-secondary mb-6">
              A critical error occurred. Please refresh the page.
            </p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-ember-glow text-black rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

