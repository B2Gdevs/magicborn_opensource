// components/content-editor/SaveStatusIndicator.tsx
// Reusable save status indicator component

"use client";

import { Cloud, CloudOff, Loader2 } from "lucide-react";
import { SaveStatus } from "@lib/content-editor/types";

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  lastSaved?: Date | null;
}

export function SaveStatusIndicator({ status, lastSaved }: SaveStatusIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-sm border-l border-border pl-4 ml-2">
      {status === SaveStatus.Saved && (
        <>
          <Cloud className="w-4 h-4 text-green-500" />
          <span className="text-text-muted">
            Saved
            {lastSaved && (
              <span className="ml-1 opacity-60">
                {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </span>
        </>
      )}
      {status === SaveStatus.Saving && (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-ember-glow" />
          <span className="text-text-muted">Saving...</span>
        </>
      )}
      {status === SaveStatus.Unsaved && (
        <>
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-text-muted">Unsaved</span>
        </>
      )}
      {status === SaveStatus.Error && (
        <>
          <CloudOff className="w-4 h-4 text-red-500" />
          <span className="text-red-400">Error</span>
        </>
      )}
    </div>
  );
}

