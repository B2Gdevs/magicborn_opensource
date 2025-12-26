// components/content-editor/ContentNavigation.tsx
// Top navigation bar with transparent style and hover popups

"use client";

import { useState, useRef } from "react";
import { ProjectSwitcher } from "./ProjectSwitcher";
import { ProjectHeader } from "./ProjectHeader";
import { VersionHistoryModal } from "./VersionHistoryModal";
import { RoadmapDialog } from "./RoadmapDialog";
import { SaveStatusIndicator } from "./SaveStatusIndicator";
import { ActChapterPageSelector } from "./ActChapterPageSelector";
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
  const centerNavRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative flex-shrink-0">
      {/* Transparent navbar background */}
      <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" />
      
      {/* Navbar content */}
      <div className="relative flex items-center justify-between px-6 py-3 gap-6">
        {/* Left Column: Project Header + ProjectSwitcher + SaveStatus */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <ProjectHeader projectId={projectId} />
          <div className="w-px h-6 bg-border/30" />
          <ProjectSwitcher 
            projectId={projectId} 
            activeView={activeView}
            onViewChange={onViewChange}
          />
          <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} />
        </div>
        
        {/* Center Column: Act, Chapter, Page (only for Writer view) */}
        {activeView === ContentEditorView.Writer && 
         onActSelect && 
         onChapterSelect && 
         onPageSelect && (
          <div ref={centerNavRef} className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-1 bg-deep/30 rounded-lg p-1 border border-border/30">
              <ActChapterPageSelector
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
                currentPageTitle={currentPageTitle}
                centerNavRef={centerNavRef}
              />
            </div>
          </div>
        )}
        
        {/* Right Column: Detail Tabs + Roadmap + Versions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {activeView === ContentEditorView.Writer &&
           (selectedAct || selectedChapter || selectedPage) && 
           activeDetailTab !== undefined && 
           onDetailTabChange && (
            <>
              <div className="flex items-center gap-0 bg-deep/30 rounded-lg p-0.5 border border-border/30">
                <DetailToolbar activeTab={activeDetailTab} onTabChange={onDetailTabChange} />
              </div>
              <div className="w-px h-6 bg-border/30" />
            </>
          )}
          <button
            onClick={() => setShowRoadmap(true)}
            className="flex items-center justify-center w-10 h-10 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-all"
            title="Roadmap"
          >
            <Map className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowVersions(true)}
            className="flex items-center justify-center w-10 h-10 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-all"
            title="Versions"
          >
            <History className="w-5 h-5" />
          </button>
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

