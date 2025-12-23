// components/content-editor/ContentNavigation.tsx
// Top navigation bar with view options

"use client";

import { useState } from "react";
import { ProjectSwitcher } from "./ProjectSwitcher";
import { VersionHistoryModal } from "./VersionHistoryModal";
import { RoadmapDialog } from "./RoadmapDialog";
import { SaveStatusIndicator } from "./SaveStatusIndicator";
import { BreadcrumbNavigation } from "./BreadcrumbNavigation";
import { DetailTab, DetailToolbar } from "./DetailToolbar";
import { 
  History,
  Map,
} from "lucide-react";
import { ContentEditorView, SaveStatus } from "@lib/content-editor/types";

interface ContentNavigationProps {
  activeView: ContentEditorView;
  onViewChange: (view: ContentEditorView) => void;
  projectId: string;
  saveStatus?: SaveStatus;
  lastSaved?: Date | null;
  // Breadcrumb props (only for Writer view)
  selectedAct?: string | null;
  selectedChapter?: string | null;
  selectedPage?: string | null;
  onActSelect?: (actId: string | null) => void;
  onChapterSelect?: (chapterId: string | null) => void;
  onPageSelect?: (pageId: string | null) => void;
  onCreateAct?: () => void;
  onCreateChapter?: (actId?: string) => void;
  onCreatePage?: (chapterId: string) => void;
  activeDetailTab?: DetailTab;
  onDetailTabChange?: (tab: DetailTab) => void;
  currentPageTitle?: string | null;
}

export function ContentNavigation({
  activeView,
  onViewChange,
  projectId,
  saveStatus = SaveStatus.Saved,
  lastSaved,
  selectedAct,
  selectedChapter,
  selectedPage,
  onActSelect,
  onChapterSelect,
  onPageSelect,
  onCreateAct,
  onCreateChapter,
  onCreatePage,
  activeDetailTab,
  onDetailTabChange,
  currentPageTitle,
}: ContentNavigationProps) {
  const [showVersions, setShowVersions] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);

  return (
    <div className="border-b border-border bg-shadow flex-shrink-0 flex flex-col">
      {/* Top Row - Everything on one line */}
      {activeView === ContentEditorView.Writer && 
       onActSelect && 
       onChapterSelect && 
       onPageSelect ? (
        <div className="flex items-center justify-between px-4 py-1.5 gap-4">
          {/* Left: ProjectSwitcher + SaveStatusIndicator */}
          <div className="flex items-center gap-1">
            <ProjectSwitcher 
              projectId={projectId} 
              activeView={activeView}
              onViewChange={onViewChange}
            />
            <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} />
          </div>
          
          {/* Center: Breadcrumbs */}
          <div className="flex-1">
            <BreadcrumbNavigation
              projectId={projectId}
              selectedAct={selectedAct || undefined}
              selectedChapter={selectedChapter || undefined}
              selectedPage={selectedPage || undefined}
              onActSelect={onActSelect}
              onChapterSelect={onChapterSelect}
              onPageSelect={onPageSelect}
              onCreateAct={onCreateAct}
              onCreateChapter={onCreateChapter}
              onCreatePage={onCreatePage}
              activeTab={activeDetailTab}
              onTabChange={onDetailTabChange}
              showButtons={false}
              currentPageTitle={currentPageTitle}
            />
          </div>
          
          {/* Right: Tab Group + Divider + Roadmap/Versions */}
          <div className="flex items-center gap-2">
            {(selectedAct || selectedChapter || selectedPage) && activeDetailTab !== undefined && onDetailTabChange && (
              <>
                <div className="flex items-center gap-0 bg-deep/30 rounded-lg p-0.5 border border-border">
                  <DetailToolbar activeTab={activeDetailTab} onTabChange={onDetailTabChange} />
                </div>
                <div className="w-px h-6 bg-border" />
              </>
            )}
            <button
              onClick={() => setShowRoadmap(true)}
              className="p-1.5 text-text-secondary hover:text-ember-glow transition-colors rounded hover:bg-deep/50"
              title="Roadmap"
            >
              <Map className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowVersions(true)}
              className="p-1.5 text-text-secondary hover:text-ember-glow transition-colors rounded hover:bg-deep/50"
              title="Versions"
            >
              <History className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <ProjectSwitcher 
              projectId={projectId} 
              activeView={activeView}
              onViewChange={onViewChange}
            />
            <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRoadmap(true)}
              className="p-2 text-text-secondary hover:text-ember-glow transition-colors rounded hover:bg-deep/50"
              title="Roadmap"
            >
              <Map className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowVersions(true)}
              className="p-2 text-text-secondary hover:text-ember-glow transition-colors rounded hover:bg-deep/50"
              title="Versions"
            >
              <History className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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

