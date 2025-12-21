// components/content-editor/ContentEditor.tsx
// Main Content Editor component (NovelCrafter-style layout)
// This component renders INSIDE the main app layout (with SidebarNav + TopNav)

"use client";

import { useState } from "react";
import { CodexSidebar } from "./CodexSidebar";
import { ContentNavigation } from "./ContentNavigation";
import { StoryPlanView } from "./StoryPlanView";
import { ContentEditorTab, ContentEditorView, SaveStatus } from "@lib/content-editor/types";
import { CodexCategory } from "@lib/content-editor/constants";

interface ContentEditorProps {
  projectId: string;
}

export function ContentEditor({ projectId }: ContentEditorProps) {
  const [activeView, setActiveView] = useState<ContentEditorView>(ContentEditorView.Grid);
  const [activeTab, setActiveTab] = useState<ContentEditorTab>(ContentEditorTab.Plan);
  const [selectedCategory, setSelectedCategory] = useState<CodexCategory | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(SaveStatus.Saved);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

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
        {/* Content Editor Navigation (tabs for Plan/etc) */}
        <ContentNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeView={activeView}
          onViewChange={setActiveView}
          projectId={projectId}
          saveStatus={saveStatus}
          lastSaved={lastSaved}
        />

        {/* Main Content - Story Structure */}
        <div className="flex-1 overflow-auto bg-deep/30">
          {activeView === ContentEditorView.Grid && (
            <StoryPlanView
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

