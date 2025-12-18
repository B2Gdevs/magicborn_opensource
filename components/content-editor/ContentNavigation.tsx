// components/content-editor/ContentNavigation.tsx
// Top navigation bar (Plan, Write, Chat, Review tabs and view options)

"use client";

import { useState } from "react";
import { ProjectSwitcher } from "./ProjectSwitcher";
import { VersionHistoryModal } from "./VersionHistoryModal";
import { 
  Download, 
  HelpCircle, 
  LayoutGrid, 
  Table2, 
  List, 
  Search,
  FileEdit,
  MessageSquare,
  CheckSquare,
  ClipboardList,
  Cloud,
  CloudOff,
  Loader2,
  History,
} from "lucide-react";

export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

interface ContentNavigationProps {
  activeTab: "plan" | "write" | "chat" | "review";
  onTabChange: (tab: "plan" | "write" | "chat" | "review") => void;
  activeView: "grid" | "matrix" | "outline";
  onViewChange: (view: "grid" | "matrix" | "outline") => void;
  projectId: string;
  saveStatus?: SaveStatus;
  lastSaved?: Date | null;
}

const tabIcons = {
  plan: ClipboardList,
  write: FileEdit,
  chat: MessageSquare,
  review: CheckSquare,
};

const viewIcons = {
  grid: LayoutGrid,
  matrix: Table2,
  outline: List,
};

export function ContentNavigation({
  activeTab,
  onTabChange,
  activeView,
  onViewChange,
  projectId,
  saveStatus = "saved",
  lastSaved,
}: ContentNavigationProps) {
  const [showVersions, setShowVersions] = useState(false);

  return (
    <div className="border-b border-border bg-shadow px-6 py-4 flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <ProjectSwitcher projectId={projectId} />
          {/* Save Status */}
          <div className="flex items-center gap-2 text-sm border-l border-border pl-4 ml-2">
            {saveStatus === "saved" && (
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
            {saveStatus === "saving" && (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-ember-glow" />
                <span className="text-text-muted">Saving...</span>
              </>
            )}
            {saveStatus === "unsaved" && (
              <>
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-text-muted">Unsaved</span>
              </>
            )}
            {saveStatus === "error" && (
              <>
                <CloudOff className="w-4 h-4 text-red-500" />
                <span className="text-red-400">Error</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVersions(true)}
            className="px-3 py-1.5 text-sm bg-deep border border-border rounded hover:bg-deep/80 flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <History className="w-4 h-4" />
            Versions
          </button>
          <button className="px-3 py-1.5 text-sm bg-deep border border-border rounded hover:bg-deep/80 flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="px-3 py-1.5 text-sm bg-deep border border-border rounded hover:bg-deep/80 flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors">
            <HelpCircle className="w-4 h-4" />
            Help
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-1 mb-4">
        {(["plan", "write", "chat", "review"] as const).map((tab) => {
          const Icon = tabIcons[tab];
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all capitalize flex items-center gap-2 ${
                activeTab === tab
                  ? "bg-ember/20 border border-ember/30 text-ember-glow"
                  : "text-text-secondary hover:text-white hover:bg-deep/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab}
            </button>
          );
        })}
      </div>

      {/* View Options and Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted mr-2">View:</span>
          {(["grid", "matrix", "outline"] as const).map((view) => {
            const Icon = viewIcons[view];
            return (
              <button
                key={view}
                onClick={() => onViewChange(view)}
                className={`px-3 py-1.5 text-sm rounded capitalize flex items-center gap-1.5 ${
                  activeView === view
                    ? "bg-ember/20 border border-ember/30 text-ember-glow"
                    : "text-text-secondary hover:text-white hover:bg-deep/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {view}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search content..."
              className="pl-9 pr-4 py-1.5 bg-deep border border-border rounded text-text-primary placeholder-text-muted focus:outline-none focus:border-ember-glow w-48"
            />
          </div>
        </div>
      </div>

      {/* Version History Modal */}
      {showVersions && (
        <VersionHistoryModal
          projectId={projectId}
          onClose={() => setShowVersions(false)}
        />
      )}
    </div>
  );
}

