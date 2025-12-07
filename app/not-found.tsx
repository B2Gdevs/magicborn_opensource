import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-void text-text-primary">
      <div className="text-center max-w-md mx-auto px-4">
        <h2 className="text-4xl font-bold text-ember-glow mb-4">404</h2>
        <p className="text-xl text-text-secondary mb-2">Page Not Found</p>
        <p className="text-text-muted mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-ember-glow text-black rounded-lg font-semibold hover:opacity-90 transition-opacity inline-block"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

