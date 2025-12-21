// components/content-editor/ContentNavigation.tsx
// Top navigation bar (Plan, Write, Chat, Review tabs and view options)

"use client";

import { useState } from "react";
import { ProjectSwitcher } from "./ProjectSwitcher";
import { VersionHistoryModal } from "./VersionHistoryModal";
import { RoadmapDialog } from "./RoadmapDialog";
import { SaveStatusIndicator } from "./SaveStatusIndicator";
import { TabButton } from "./TabButton";
import { ViewButton } from "./ViewButton";
import { SearchInput } from "@components/ui/SearchInput";
import { 
  ClipboardList,
  LayoutGrid,
  History,
  Map,
} from "lucide-react";
import { ContentEditorTab, ContentEditorView, SaveStatus } from "@lib/content-editor/types";

interface ContentNavigationProps {
  activeTab: ContentEditorTab;
  onTabChange: (tab: ContentEditorTab) => void;
  activeView: ContentEditorView;
  onViewChange: (view: ContentEditorView) => void;
  projectId: string;
  saveStatus?: SaveStatus;
  lastSaved?: Date | null;
}

const tabIcons = {
  [ContentEditorTab.Plan]: ClipboardList,
};

const viewIcons = {
  [ContentEditorView.Grid]: LayoutGrid,
};

export function ContentNavigation({
  activeTab,
  onTabChange,
  activeView,
  onViewChange,
  projectId,
  saveStatus = SaveStatus.Saved,
  lastSaved,
}: ContentNavigationProps) {
  const [showVersions, setShowVersions] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const availableTabs = [ContentEditorTab.Plan];
  const availableViews = [ContentEditorView.Grid];

  return (
    <div className="border-b border-border bg-shadow px-6 py-4 flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <ProjectSwitcher projectId={projectId} />
          <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRoadmap(true)}
            className="px-3 py-1.5 text-sm bg-deep border border-border rounded hover:bg-deep/80 flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <Map className="w-4 h-4" />
            Roadmap
          </button>
          <button
            onClick={() => setShowVersions(true)}
            className="px-3 py-1.5 text-sm bg-deep border border-border rounded hover:bg-deep/80 flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <History className="w-4 h-4" />
            Versions
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-1 mb-4">
        {availableTabs.map((tab) => (
          <TabButton
            key={tab}
            tab={tab}
            active={activeTab === tab}
            onClick={onTabChange}
            icon={tabIcons[tab]}
          />
        ))}
      </div>

      {/* View Options and Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted mr-2">View:</span>
          {availableViews.map((view) => (
            <ViewButton
              key={view}
              view={view}
              active={activeView === view}
              onClick={onViewChange}
              icon={viewIcons[view]}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <SearchInput
            placeholder="Search content..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
      </div>

      {/* Roadmap Dialog */}
      {showRoadmap && (
        <RoadmapDialog onClose={() => setShowRoadmap(false)} />
      )}

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

