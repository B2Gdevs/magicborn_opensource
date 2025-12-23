// components/content-editor/ContentEditor.tsx
// Main Content Editor component (NovelCrafter-style layout)
// This component renders INSIDE the main app layout (with SidebarNav + TopNav)

"use client";

import { useState } from "react";
import { CodexSidebar } from "./CodexSidebar";
import { ContentNavigation } from "./ContentNavigation";
import { WriterView } from "./WriterView";
import { GameThreadView } from "./GameThreadView";
import { NarrativeThreadView } from "./NarrativeThreadView";
import { DetailTab } from "./DetailToolbar";
import { ContentEditorView, SaveStatus } from "@lib/content-editor/types";
import { CodexCategory } from "@lib/content-editor/constants";
import { toTitleCase } from "@lib/utils/titleCase";

interface ContentEditorProps {
  projectId: string;
}

export function ContentEditor({ projectId }: ContentEditorProps) {
  const [activeView, setActiveView] = useState<ContentEditorView>(ContentEditorView.Writer);
  const [selectedCategory, setSelectedCategory] = useState<CodexCategory | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(SaveStatus.Saved);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Breadcrumb state (for Writer view)
  const [selectedAct, setSelectedAct] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [currentPageTitle, setCurrentPageTitle] = useState<string | null>(null);
  
  // Detail tab state (for Writer view)
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>(DetailTab.Detail);

  const handleCreateAct = async () => {
    setSaveStatus(SaveStatus.Saving);
    try {
      const res = await fetch("/api/payload/acts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: parseInt(projectId, 10),
          title: toTitleCase(`Act ${Date.now()}`),
          order: 0,
        }),
      });
      const data = await res.json();
      const doc = data.doc || data;
      if (doc?.id) {
        setSelectedAct(doc.id);
        setSelectedChapter(null);
        setSelectedPage(null);
        setSaveStatus(SaveStatus.Saved);
        setLastSaved(new Date());
      } else {
        setSaveStatus(SaveStatus.Error);
      }
    } catch (error) {
      console.error("Failed to create act:", error);
      setSaveStatus(SaveStatus.Error);
    }
  };

  const handleCreateChapter = async (actId?: string) => {
    setSaveStatus(SaveStatus.Saving);
    try {
      const res = await fetch("/api/payload/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: parseInt(projectId, 10),
          act: actId || null,
          type: "chapter",
          title: toTitleCase(`Chapter ${Date.now()}`),
          order: 0,
        }),
      });
      const data = await res.json();
      const doc = data.doc || data;
      if (doc?.id) {
        setSelectedChapter(doc.id);
        setSelectedPage(null);
        setSaveStatus(SaveStatus.Saved);
        setLastSaved(new Date());
      } else {
        setSaveStatus(SaveStatus.Error);
      }
    } catch (error) {
      console.error("Failed to create chapter:", error);
      setSaveStatus(SaveStatus.Error);
    }
  };

  const handleCreatePage = async (chapterId: string) => {
    setSaveStatus(SaveStatus.Saving);
    try {
      // Get existing pages in chapter to calculate order and page number
      const pagesRes = await fetch(
        `/api/payload/pages?where[project][equals]=${projectId}&where[chapter][equals]=${chapterId}&sort=order`
      );
      const pagesData = await pagesRes.json();
      const existingPages = pagesData.docs || [];
      const nextOrder = existingPages.length > 0 
        ? Math.max(...existingPages.map((p: any) => p.order || 0)) + 1 
        : 0;
      const nextPageNumber = existingPages.length + 1;
      
      const res = await fetch("/api/payload/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: parseInt(projectId, 10),
          chapter: chapterId,
          title: toTitleCase(`Page ${nextPageNumber}`),
          order: nextOrder,
        }),
      });
      const data = await res.json();
      const doc = data.doc || data;
      if (doc?.id) {
        setSelectedPage(doc.id.toString());
        setSaveStatus(SaveStatus.Saved);
        setLastSaved(new Date());
      } else {
        setSaveStatus(SaveStatus.Error);
      }
    } catch (error) {
      console.error("Failed to create page:", error);
      setSaveStatus(SaveStatus.Error);
    }
  };

  return (
    <div className="flex h-full bg-void">
      {/* Left Sidebar - Codex (Content Editor's own sidebar, not the main app sidebar) */}
      <CodexSidebar
        projectId={projectId}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content Editor Navigation */}
        <ContentNavigation
          activeView={activeView}
          onViewChange={setActiveView}
          projectId={projectId}
          saveStatus={saveStatus}
          lastSaved={lastSaved}
          selectedAct={selectedAct}
          selectedChapter={selectedChapter}
          selectedPage={selectedPage}
          onActSelect={setSelectedAct}
          onChapterSelect={setSelectedChapter}
          onPageSelect={setSelectedPage}
          onCreateAct={handleCreateAct}
          onCreateChapter={handleCreateChapter}
          onCreatePage={handleCreatePage}
          activeDetailTab={activeDetailTab}
          onDetailTabChange={setActiveDetailTab}
          currentPageTitle={currentPageTitle}
        />

        {/* Main Content - Views */}
        <div className="flex-1 overflow-hidden">
          {activeView === ContentEditorView.Writer && (
            <WriterView
              projectId={projectId}
              selectedAct={selectedAct}
              selectedChapter={selectedChapter}
              selectedPage={selectedPage}
              onActSelect={setSelectedAct}
              onChapterSelect={setSelectedChapter}
              onPageSelect={setSelectedPage}
              onSaveStatusChange={setSaveStatus}
              onLastSavedChange={setLastSaved}
              activeTab={activeDetailTab}
              onTabChange={setActiveDetailTab}
              onPageTitleChange={setCurrentPageTitle}
              onCreateChapter={handleCreateChapter}
              onCreatePage={handleCreatePage}
            />
          )}
          {activeView === ContentEditorView.GameThread && (
            <GameThreadView
              projectId={projectId}
              onSaveStatusChange={setSaveStatus}
              onLastSavedChange={setLastSaved}
            />
          )}
          {activeView === ContentEditorView.NarrativeThread && (
            <NarrativeThreadView
              projectId={projectId}
              onSaveStatusChange={setSaveStatus}
              onLastSavedChange={setLastSaved}
            />
          )}
        </div>
      </div>
    </div>
  );
}

