export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full bg-void text-text-muted">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-ember border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p>Loading development page...</p>
      </div>
    </div>
  );
}

