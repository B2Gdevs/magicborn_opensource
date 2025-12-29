// components/content-editor/GameThreadView.tsx
// Node-based editor for game threads (future Yarn integration)

"use client";

import { useState } from "react";
import { DialogueEditorV2, type DialogueTree, type ViewMode, VIEW_MODE, FlagSchema } from "@magicborn/dialogue-forge";

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
  const [dialogueTree, setDialogueTree] = useState<DialogueTree | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(VIEW_MODE.GRAPH);
  const [flagSchema, setFlagSchema] = useState<FlagSchema | undefined>(undefined);
  const [showFlagManager, setShowFlagManager] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const handleExportYarn = (yarn: string) => {
    console.log("Exported Yarn:", yarn);
  };
  return (
    <div className="h-full flex items-center justify-center bg-deep/30">
      {/* Editor/Player */}
      <div className="flex-1 w-full min-h-0">
        <DialogueEditorV2
          dialogue={dialogueTree}
          onChange={setDialogueTree}
          onExportYarn={handleExportYarn}
          flagSchema={flagSchema}
          characters={undefined}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          className="w-full h-full"
          onOpenFlagManager={() => setShowFlagManager(true)}
          onOpenGuide={() => setShowGuide(true)}
        />
      </div>
    </div>
  );
}





