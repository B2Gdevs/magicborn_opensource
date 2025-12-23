// components/content-editor/ViewButton.tsx
// Reusable view button component

"use client";

import { LucideIcon } from "lucide-react";
import { ContentEditorView } from "@lib/content-editor/types";

interface ViewButtonProps {
  view: ContentEditorView;
  active: boolean;
  onClick: (view: ContentEditorView) => void;
  icon: LucideIcon;
}

const viewLabels: Record<ContentEditorView, string> = {
  [ContentEditorView.Writer]: "Writer",
  [ContentEditorView.GameThread]: "Game Thread",
  [ContentEditorView.NarrativeThread]: "Narrative Thread",
};

export function ViewButton({ view, active, onClick, icon: Icon }: ViewButtonProps) {
  return (
    <button
      onClick={() => onClick(view)}
      className={`px-3 py-1.5 text-sm rounded flex items-center gap-1.5 ${
        active
          ? "bg-ember/20 border border-ember/30 text-ember-glow"
          : "text-text-secondary hover:text-white hover:bg-deep/50 border border-transparent"
      }`}
    >
      <Icon className="w-4 h-4" />
      {viewLabels[view]}
    </button>
  );
}

