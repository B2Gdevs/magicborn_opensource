// components/content-editor/DetailToolbar.tsx
// Icon-only toolbar with tooltips for NarrativeThread, GameThread, and Detail views

"use client";

import { Network, GitBranch, FileText } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";

export enum DetailTab {
  Detail = "detail",
  NarrativeThread = "narrative-thread",
  GameThread = "game-thread",
}

interface DetailToolbarProps {
  activeTab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
}

const tabConfig = {
  [DetailTab.Detail]: {
    label: "Detail",
    icon: FileText,
  },
  [DetailTab.NarrativeThread]: {
    label: "Narrative Thread",
    icon: Network,
  },
  [DetailTab.GameThread]: {
    label: "Game Thread",
    icon: GitBranch,
  },
};

export function DetailToolbar({ activeTab, onTabChange }: DetailToolbarProps) {
  return (
    <div className="flex items-center gap-0">
      {Object.values(DetailTab).map((tab) => {
        const config = tabConfig[tab];
        const Icon = config.icon;
        const isActive = activeTab === tab;
        
        return (
          <Tooltip key={tab} content={config.label}>
            <button
              onClick={() => onTabChange(tab)}
              className={`p-1.5 rounded transition-colors ${
                isActive
                  ? "bg-ember/20 text-ember-glow"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}

