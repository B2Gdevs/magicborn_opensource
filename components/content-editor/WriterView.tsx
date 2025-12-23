// components/content-editor/WriterView.tsx
// Document-style writing view with breadcrumb navigation
// Supports Acts, Prologue/Epilogue, Chapters, and Pages

"use client";

import { useState } from "react";
import { DetailTab } from "./DetailToolbar";
import { DetailView } from "./DetailView";
import { NarrativeThreadView } from "./NarrativeThreadView";
import { GameThreadView } from "./GameThreadView";
import { SaveStatus } from "@lib/content-editor/types";

interface WriterViewProps {
  projectId: string;
  selectedAct?: string | null;
  selectedChapter?: string | null;
  selectedPage?: string | null;
  onActSelect?: (actId: string | null) => void;
  onChapterSelect?: (chapterId: string | null) => void;
  onPageSelect?: (pageId: string | null) => void;
  onSaveStatusChange?: (status: SaveStatus) => void;
  onLastSavedChange?: (date: Date) => void;
  activeTab?: DetailTab;
  onTabChange?: (tab: DetailTab) => void;
  onPageTitleChange?: (title: string) => void;
  onCreateChapter?: (actId: string) => void;
  onCreatePage?: (chapterId: string) => void;
}

export function WriterView({
  projectId,
  selectedAct: propSelectedAct,
  selectedChapter: propSelectedChapter,
  selectedPage: propSelectedPage,
  onActSelect: propOnActSelect,
  onChapterSelect: propOnChapterSelect,
  onPageSelect: propOnPageSelect,
  onSaveStatusChange,
  onLastSavedChange,
  activeTab: propActiveTab,
  onTabChange: propOnTabChange,
  onPageTitleChange,
  onCreateChapter,
  onCreatePage,
}: WriterViewProps) {
  // Use props if provided, otherwise use local state
  const [localSelectedAct, setLocalSelectedAct] = useState<string | null>(null);
  const [localSelectedChapter, setLocalSelectedChapter] = useState<string | null>(null);
  const [localSelectedPage, setLocalSelectedPage] = useState<string | null>(null);
  const [localActiveTab, setLocalActiveTab] = useState<DetailTab>(DetailTab.Detail);

  const selectedAct = propSelectedAct !== undefined ? propSelectedAct : localSelectedAct;
  const selectedChapter = propSelectedChapter !== undefined ? propSelectedChapter : localSelectedChapter;
  const selectedPage = propSelectedPage !== undefined ? propSelectedPage : localSelectedPage;

  const setSelectedAct = propOnActSelect || setLocalSelectedAct;
  const setSelectedChapter = propOnChapterSelect || setLocalSelectedChapter;
  const setSelectedPage = propOnPageSelect || setLocalSelectedPage;
  
  const activeTab = propActiveTab !== undefined ? propActiveTab : localActiveTab;
  const setActiveTab = propOnTabChange || setLocalActiveTab;

  const setSaveStatus = (status: SaveStatus) => {
    onSaveStatusChange?.(status);
  };

  const setLastSaved = (date: Date) => {
    onLastSavedChange?.(date);
  };

  // Determine which view to show based on active tab
  const renderContentView = () => {
    switch (activeTab) {
      case DetailTab.Detail:
        return (
          <DetailView
            projectId={projectId}
            selectedAct={selectedAct}
            selectedChapter={selectedChapter}
            selectedPage={selectedPage}
            onSaveStatusChange={setSaveStatus}
            onLastSavedChange={setLastSaved}
            onPageTitleChange={onPageTitleChange}
            onCreateChapter={onCreateChapter}
            onCreatePage={onCreatePage}
            onPageSelect={setSelectedPage}
            onChapterSelect={setSelectedChapter}
          />
        );
      case DetailTab.NarrativeThread:
        return (
          <NarrativeThreadView
            projectId={projectId}
            onSaveStatusChange={setSaveStatus}
            onLastSavedChange={setLastSaved}
          />
        );
      case DetailTab.GameThread:
        return (
          <GameThreadView
            projectId={projectId}
            onSaveStatusChange={setSaveStatus}
            onLastSavedChange={setLastSaved}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {renderContentView()}
      </div>
    </div>
  );
}
