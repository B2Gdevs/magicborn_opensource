"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-void text-text-primary">
      <div className="text-center max-w-md mx-auto px-4">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Something went wrong!</h2>
        <p className="text-text-secondary mb-6">
          {error.message || "An unexpected error occurred"}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-ember-glow text-black rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

