// components/content-editor/GameThreadView.tsx
// Node-based editor for game threads (future Yarn integration)

"use client";

import { useState } from "react";
import { GitBranch, Loader2 } from "lucide-react";

interface GameThreadViewProps {
  projectId: string;
  onSaveStatusChange?: (status: any) => void;
  onLastSavedChange?: (date: Date) => void;
}

export function GameThreadView({
  projectId,
  onSaveStatusChange,
  onLastSavedChange,
}: GameThreadViewProps) {
  const [loading] = useState(false);

  return (
    <div className="h-full flex items-center justify-center bg-deep/30">
      <div className="text-center max-w-md">
        <GitBranch className="w-16 h-16 text-ember-glow mx-auto mb-4" />
        <h2 className="text-xl font-medium text-text-primary mb-2">
          Game Thread View
        </h2>
        <p className="text-text-muted mb-4">
          Node-based editor for game threads. Yarn script integration coming soon.
        </p>
        <div className="bg-shadow border border-border rounded-lg p-4 text-left">
          <p className="text-sm text-text-muted">
            This view will support:
          </p>
          <ul className="text-sm text-text-muted mt-2 space-y-1 list-disc list-inside">
            <li>Visual node-based editing</li>
            <li>Yarn script integration</li>
            <li>Branching dialogue trees</li>
            <li>Game state management</li>
          </ul>
        </div>
      </div>
    </div>
  );
}


