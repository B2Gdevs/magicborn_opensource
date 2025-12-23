// components/content-editor/SaveStatusIndicator.tsx
// Reusable save status indicator component

"use client";

import { Cloud, CloudOff, Loader2 } from "lucide-react";
import { SaveStatus } from "@lib/content-editor/types";
import { Tooltip } from "@/components/ui/Tooltip";

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  lastSaved?: Date | null;
}

export function SaveStatusIndicator({ status, lastSaved }: SaveStatusIndicatorProps) {
  const getTooltipText = () => {
    switch (status) {
      case SaveStatus.Saved:
        return lastSaved 
          ? `Saved ${lastSaved.toLocaleTimeString()}`
          : "Saved";
      case SaveStatus.Saving:
        return "Saving...";
      case SaveStatus.Unsaved:
        return "Unsaved changes";
      case SaveStatus.Error:
        return "Error saving";
      default:
        return "";
    }
  };

  return (
    <div className="flex items-center border-l border-border pl-3 ml-2">
      <Tooltip content={getTooltipText()}>
        {status === SaveStatus.Saved && (
          <Cloud className="w-4 h-4 text-green-500" />
        )}
        {status === SaveStatus.Saving && (
          <Loader2 className="w-4 h-4 animate-spin text-ember-glow" />
        )}
        {status === SaveStatus.Unsaved && (
          <div className="w-2 h-2 rounded-full bg-amber-500" />
        )}
        {status === SaveStatus.Error && (
          <CloudOff className="w-4 h-4 text-red-500" />
        )}
      </Tooltip>
    </div>
  );
}

