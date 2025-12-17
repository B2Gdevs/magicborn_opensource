// components/content-editor/ContentEditor.tsx
// Main Content Editor component (NovelCrafter-style layout)
// This component renders INSIDE the main app layout (with SidebarNav + TopNav)

"use client";

import { useState } from "react";
import { CodexSidebar } from "./CodexSidebar";
import { ContentNavigation } from "./ContentNavigation";
import { ContentGridView } from "./ContentGridView";

interface ContentEditorProps {
  projectId: string;
}

export function ContentEditor({ projectId }: ContentEditorProps) {
  const [activeView, setActiveView] = useState<"grid" | "matrix" | "outline">("grid");
  const [activeTab, setActiveTab] = useState<"plan" | "write" | "chat" | "review">("plan");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
        {/* Content Editor Navigation (tabs for Plan/Write/Chat/Review) */}
        <ContentNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeView={activeView}
          onViewChange={setActiveView}
          projectId={projectId}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-deep/30">
          {activeView === "grid" && (
            <ContentGridView
              projectId={projectId}
              category={selectedCategory}
            />
          )}
          {activeView === "matrix" && (
            <div className="flex items-center justify-center h-full text-text-muted">
              Matrix view coming soon...
            </div>
          )}
          {activeView === "outline" && (
            <div className="flex items-center justify-center h-full text-text-muted">
              Outline view coming soon...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

