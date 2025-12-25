// components/content-editor/DetailView.tsx
// Detail view wrapper that shows Act/Chapter forms or Page editor based on selection

"use client";

import { useState, useEffect } from "react";
import { ActForm, type ActFormData } from "./ActForm";
import { ChapterForm, type ChapterFormData } from "./ChapterForm";
import { ActFormFooter } from "./ActForm";
import { ChapterFormFooter } from "./ChapterForm";
import { PageEditor } from "./PageEditor";
import { SaveStatus } from "@lib/content-editor/types";
import { Modal } from "@components/ui/Modal";
import { toTitleCase } from "@lib/utils/titleCase";

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
  const [actData, setActData] = useState<ActFormData | null>(null);
  const [chapterData, setChapterData] = useState<ChapterFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load act data when selected
  useEffect(() => {
    if (selectedAct && !selectedChapter && !selectedPage) {
      setLoading(true);
      fetch(`/api/payload/acts/${selectedAct}`)
        .then(res => res.json())
        .then(data => {
          const act = data.doc || data;
          setActData({
            id: act.slug || act.id?.toString() || "",
            name: act.title || "",
            description: act.description || "",
            imageMediaId: typeof act.image === 'object' ? act.image?.id : act.image,
          });
          onPageTitleChange?.(act.title || "");
        })
        .catch(err => console.error("Failed to fetch act:", err))
        .finally(() => setLoading(false));
    } else {
      setActData(null);
    }
  }, [selectedAct, selectedChapter, selectedPage, onPageTitleChange]);

  // Load chapter data when selected
  useEffect(() => {
    if (selectedChapter && !selectedPage) {
      setLoading(true);
      fetch(`/api/payload/chapters/${selectedChapter}`)
        .then(res => res.json())
        .then(data => {
          const chapter = data.doc || data;
          setChapterData({
            id: chapter.slug || chapter.id?.toString() || "",
            name: chapter.title || "",
            description: chapter.description || "",
            imageMediaId: typeof chapter.image === 'object' ? chapter.image?.id : chapter.image,
            actId: typeof chapter.act === 'object' ? chapter.act?.id?.toString() : chapter.act?.toString(),
          });
          onPageTitleChange?.(chapter.title || "");
        })
        .catch(err => console.error("Failed to fetch chapter:", err))
        .finally(() => setLoading(false));
    } else {
      setChapterData(null);
    }
  }, [selectedChapter, selectedPage, onPageTitleChange]);

  const handleActSubmit = async (data: ActFormData) => {
    if (!selectedAct) return;
    
    setSaving(true);
    onSaveStatusChange?.(SaveStatus.Saving);
    
    try {
      const res = await fetch(`/api/payload/acts/${selectedAct}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.name,
          description: data.description,
          image: data.imageMediaId || undefined,
        }),
      });
      
      if (res.ok) {
        onSaveStatusChange?.(SaveStatus.Saved);
        onLastSavedChange?.(new Date());
        onPageTitleChange?.(data.name);
      } else {
        onSaveStatusChange?.(SaveStatus.Error);
      }
    } catch (error) {
      console.error("Failed to save act:", error);
      onSaveStatusChange?.(SaveStatus.Error);
    } finally {
      setSaving(false);
    }
  };

  const handleChapterSubmit = async (data: ChapterFormData) => {
    if (!selectedChapter) return;
    
    setSaving(true);
    onSaveStatusChange?.(SaveStatus.Saving);
    
    try {
      const res = await fetch(`/api/payload/chapters/${selectedChapter}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.name,
          description: data.description,
          image: data.imageMediaId || undefined,
        }),
      });
      
      if (res.ok) {
        onSaveStatusChange?.(SaveStatus.Saved);
        onLastSavedChange?.(new Date());
        onPageTitleChange?.(data.name);
      } else {
        onSaveStatusChange?.(SaveStatus.Error);
      }
    } catch (error) {
      console.error("Failed to save chapter:", error);
      onSaveStatusChange?.(SaveStatus.Error);
    } finally {
      setSaving(false);
    }
  };

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
  } else if (selectedChapter && chapterData) {
    return (
      <div className="h-full flex flex-col">
        <ChapterForm
          initialValues={chapterData}
          isEdit={true}
          onSubmit={handleChapterSubmit}
          saving={saving}
          projectId={projectId}
          editEntryId={parseInt(selectedChapter, 10)}
          actId={chapterData.actId}
        />
        <div className="border-t border-border p-4 bg-shadow">
          <ChapterFormFooter
            isEdit={true}
            saving={saving}
            onSubmit={() => {
              const form = document.querySelector('form');
              if (form) form.requestSubmit();
            }}
          />
        </div>
      </div>
    );
  } else if (selectedAct && actData) {
    return (
      <div className="h-full flex flex-col">
        <ActForm
          initialValues={actData}
          isEdit={true}
          onSubmit={handleActSubmit}
          saving={saving}
          projectId={projectId}
          editEntryId={parseInt(selectedAct, 10)}
        />
        <div className="border-t border-border p-4 bg-shadow">
          <ActFormFooter
            isEdit={true}
            saving={saving}
            onSubmit={() => {
              const form = document.querySelector('form');
              if (form) form.requestSubmit();
            }}
          />
        </div>
      </div>
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

