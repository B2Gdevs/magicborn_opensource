// components/content-editor/DetailView.tsx
// Detail view wrapper that shows Act/Chapter forms or Page editor based on selection

"use client";

import { ActDetailView } from "./ActDetailView";
import { ChapterDetailView } from "./ChapterDetailView";
import { PageEditor } from "./PageEditor";
import { SaveStatus } from "@lib/content-editor/types";

interface DetailViewProps {
  projectId: string;
  selectedAct?: string | null;
  selectedChapter?: string | null;
  selectedPage?: string | null;
  onSaveStatusChange?: (status: SaveStatus) => void;
  onLastSavedChange?: (date: Date) => void;
  onPageTitleChange?: (title: string) => void;
  onCreateChapter?: (actId: string) => void;
  onCreatePage?: (chapterId: string) => void;
  onPageSelect?: (pageId: string) => void;
  onChapterSelect?: (chapterId: string) => void;
}

export function DetailView({
  projectId,
  selectedAct,
  selectedChapter,
  selectedPage,
  onSaveStatusChange,
  onLastSavedChange,
  onPageTitleChange,
  onCreateChapter,
  onCreatePage,
  onPageSelect,
  onChapterSelect,
}: DetailViewProps) {
  if (selectedPage) {
    return (
      <PageEditor
        projectId={projectId}
        pageId={selectedPage}
        onSaveStatusChange={onSaveStatusChange}
        onLastSavedChange={onLastSavedChange}
        onTitleChange={onPageTitleChange}
      />
    );
  } else if (selectedChapter) {
    return (
      <ChapterDetailView
        projectId={projectId}
        chapterId={selectedChapter}
        onSaveStatusChange={onSaveStatusChange}
        onLastSavedChange={onLastSavedChange}
        onCreatePage={onCreatePage}
        onPageSelect={onPageSelect}
      />
    );
  } else if (selectedAct) {
    return (
      <ActDetailView
        projectId={projectId}
        actId={selectedAct}
        onSaveStatusChange={onSaveStatusChange}
        onLastSavedChange={onLastSavedChange}
        onCreateChapter={onCreateChapter}
        onChapterSelect={onChapterSelect}
      />
    );
  } else {
    return (
      <div className="flex items-center justify-center h-full bg-deep/30">
        <div className="text-center">
          <h2 className="text-xl font-medium text-text-primary mb-2">
            Select an Act, Chapter, or Page to start
          </h2>
          <p className="text-text-muted">
            Use the breadcrumb navigation above to navigate your story
          </p>
        </div>
      </div>
    );
  }
}

