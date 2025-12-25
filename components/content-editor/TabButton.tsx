// components/content-editor/TabButton.tsx
// Reusable tab button component

"use client";

import { LucideIcon } from "lucide-react";
import { ContentEditorTab } from "@lib/content-editor/types";

interface TabButtonProps {
  tab: ContentEditorTab;
  active: boolean;
  onClick: (tab: ContentEditorTab) => void;
  icon: LucideIcon;
}

export function TabButton({ tab, active, onClick, icon: Icon }: TabButtonProps) {
  return (
    <button
      onClick={() => onClick(tab)}
      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all capitalize flex items-center gap-2 ${
        active
          ? "bg-ember/20 border border-ember/30 text-ember-glow"
          : "text-text-secondary hover:text-white hover:bg-deep/50"
      }`}
    >
      <Icon className="w-4 h-4" />
      {tab}
    </button>
  );
}



