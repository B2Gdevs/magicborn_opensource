// components/content-editor/PageEditor.tsx
// Simple textarea-based editor for Pages (BlockNote replacement - to be upgraded to TipTap with PDF export)

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Download, MoreVertical, HelpCircle } from "lucide-react";
import { SaveStatus } from "@lib/content-editor/types";
import { Modal } from "@components/ui/Modal";
import { Button } from "@components/ui/Button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/Skeleton";

interface PageEditorProps {
  projectId: string;
  pageId: string;
  onSaveStatusChange?: (status: SaveStatus) => void;
  onLastSavedChange?: (date: Date) => void;
  onTitleChange?: (title: string) => void;
}

export function PageEditor({
  projectId,
  pageId,
  onSaveStatusChange,
  onLastSavedChange,
  onTitleChange,
}: PageEditorProps) {
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [calculatedPageNumber, setCalculatedPageNumber] = useState<number>(1);
  const [editorContent, setEditorContent] = useState<string>('');
  const [hasUserTyped, setHasUserTyped] = useState(false);
  const [isTitleHovered, setIsTitleHovered] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const titleRef = useRef(title);
  const calculatedPageNumberRef = useRef(calculatedPageNumber);
  const pageIdRef = useRef(pageId);
  const onTitleChangeRef = useRef(onTitleChange);
  const hasUnsavedTitleRef = useRef(false);
  
  // Keep refs in sync
  useEffect(() => {
    titleRef.current = title;
  }, [title]);
  useEffect(() => {
    calculatedPageNumberRef.current = calculatedPageNumber;
  }, [calculatedPageNumber]);
  useEffect(() => {
    pageIdRef.current = pageId;
  }, [pageId]);
  useEffect(() => {
    onTitleChangeRef.current = onTitleChange;
  }, [onTitleChange]);

  useEffect(() => {
    hasUnsavedTitleRef.current = false; // Reset when page changes
    fetchPage();
  }, [pageId]);

  // Cleanup autosave timeout on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, []);

  // Calculate page number based on order within chapter
  const calculatePageNumber = useCallback(async (chapterId: string, pageOrder: number) => {
    try {
      const res = await fetch(
        `/api/payload/pages?where[project][equals]=${projectId}&where[chapter][equals]=${chapterId}&sort=order`
      );
      const data = await res.json();
      const pages = data.docs || [];
      
      // Find this page's position in sorted order
      const sortedPages = pages.sort((a: any, b: any) => a.order - b.order);
      const pageIndex = sortedPages.findIndex((p: any) => p.id === pageId);
      
      // Page number is 1-indexed position in order
      return pageIndex >= 0 ? pageIndex + 1 : pageOrder + 1;
    } catch (error) {
      console.error("Failed to calculate page number:", error);
      return pageOrder + 1;
    }
  }, [projectId, pageId]);

  const fetchPage = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/payload/pages/${pageId}`);
      const data = await res.json();
      if (data.doc || data.id) {
        const pageData = data.doc || data;
        setPage(pageData);
        
        // Calculate page number based on order
        if (pageData.chapter) {
          const chapterId = typeof pageData.chapter === 'object' ? pageData.chapter.id : pageData.chapter;
          const pageNum = await calculatePageNumber(chapterId, pageData.order || 0);
          setCalculatedPageNumber(pageNum);
          
          // Only update title if user hasn't made unsaved changes
          if (!hasUnsavedTitleRef.current) {
            // Auto-generate title if not set or if it's a default one
            const currentTitle = pageData.title || "";
            if (!currentTitle || currentTitle.startsWith("Page ")) {
              const newTitle = `Page ${pageNum}`;
              setTitle(newTitle);
              titleRef.current = newTitle;
              onTitleChange?.(newTitle);
            } else {
              setTitle(currentTitle);
              titleRef.current = currentTitle;
              onTitleChange?.(currentTitle);
            }
          }
        } else {
          // Only update title if user hasn't made unsaved changes
          if (!hasUnsavedTitleRef.current) {
            const fallbackTitle = pageData.title || "Page 1";
            setTitle(fallbackTitle);
            titleRef.current = fallbackTitle;
            onTitleChange?.(fallbackTitle);
          }
          setCalculatedPageNumber(1);
        }
        
        // Load content (stored as text or JSON)
        if (pageData.content) {
          // Handle both text and legacy BlockNote JSON format
          if (typeof pageData.content === 'string') {
            setEditorContent(pageData.content);
            setHasUserTyped(true);
          } else if (Array.isArray(pageData.content)) {
            // Legacy BlockNote format - extract text
            const text = pageData.content
              .map((block: any) => {
                if (block.content && Array.isArray(block.content)) {
                  return block.content
                    .filter((c: any) => c.type === 'text')
                    .map((c: any) => c.text)
                    .join('');
                }
                return '';
              })
              .join('\n\n');
            setEditorContent(text || '');
            setHasUserTyped(!!text);
          } else {
            setEditorContent('');
            setHasUserTyped(false);
          }
        } else {
          setEditorContent('');
          setHasUserTyped(false);
        }
      }
    } catch (error) {
      console.error("Failed to fetch page:", error);
    } finally {
      setLoading(false);
    }
  };

  const performSave = useCallback(async () => {
    if (isSavingRef.current) {
      return;
    }
    
    isSavingRef.current = true;
    setSaving(true);
    onSaveStatusChange?.(SaveStatus.Saving);
    try {
      // Title bar is the source of truth
      const extractedTitle = titleRef.current || `Page ${calculatedPageNumberRef.current}`;
      
      // Get content from textarea (stored as plain text)
      const contentToSave = editorContent || '';
      
      const payload = {
        title: extractedTitle,
        content: contentToSave, // Store as plain text
      };
      
      const res = await fetch(`/api/payload/pages/${pageIdRef.current}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        // Update local page state with saved title
        setPage((prev: any) => prev ? { ...prev, title: extractedTitle } : prev);
        hasUnsavedTitleRef.current = false; // Title is now saved
        onSaveStatusChange?.(SaveStatus.Saved);
        onLastSavedChange?.(new Date());
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Failed to save page:", res.status, errorData);
        onSaveStatusChange?.(SaveStatus.Error);
      }
    } catch (error) {
      console.error("Failed to save page:", error);
      onSaveStatusChange?.(SaveStatus.Error);
    } finally {
      setSaving(false);
      isSavingRef.current = false;
    }
  }, [editorContent, onSaveStatusChange, onLastSavedChange]);

  const triggerAutosave = useCallback(() => {
    // Clear existing timeout
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }
    
    // Mark as unsaved
    onSaveStatusChange?.(SaveStatus.Unsaved);
    
    // Set new timeout for autosave (2 seconds after user stops typing)
    autosaveTimeoutRef.current = setTimeout(() => {
      performSave();
    }, 2000);
  }, [onSaveStatusChange, performSave]);

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        {/* Toolbar skeleton */}
        <div className="border-b border-border bg-shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton variant="rectangular" className="w-32 h-8 rounded" />
              <Skeleton variant="rectangular" className="w-24 h-8 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton variant="circular" className="w-8 h-8" />
              <Skeleton variant="circular" className="w-8 h-8" />
            </div>
          </div>
        </div>
        {/* Editor skeleton */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto space-y-4">
            <Skeleton variant="text" className="w-3/4 h-10" />
            <Skeleton variant="text" className="w-full h-6" />
            <Skeleton variant="text" className="w-full h-6" />
            <Skeleton variant="text" className="w-5/6 h-6" />
            <div className="mt-8 space-y-3">
              <Skeleton variant="text" className="w-full h-6" />
              <Skeleton variant="text" className="w-full h-6" />
              <Skeleton variant="text" className="w-4/5 h-6" />
            </div>
          </div>
        </div>
      </div>
    );
  }


  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setEditorContent(newContent);
    if (!hasUserTyped && newContent.trim().length > 0) {
      setHasUserTyped(true);
    }
    triggerAutosave();
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export page");
  };

  return (
    <div className="h-full flex flex-col bg-void">
      {/* Sleek Title Bar with Tools on Hover */}
      <div 
        className="relative flex-shrink-0"
        onMouseEnter={() => setIsTitleHovered(true)}
        onMouseLeave={() => setIsTitleHovered(false)}
      >
        <div className="max-w-3xl mx-auto px-8 pt-2 flex items-center justify-between">
          {/* Page Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => {
              const newTitle = e.target.value;
              setTitle(newTitle);
              titleRef.current = newTitle;
              hasUnsavedTitleRef.current = true; // Mark as unsaved
              onTitleChange?.(newTitle);
              triggerAutosave();
            }}
            className="flex-1 py-1 bg-transparent text-lg font-semibold text-text-primary placeholder-text-muted focus:outline-none transition-colors"
            placeholder="Page title..."
          />
          
          {/* Tools - only show on hover */}
          <div className={`flex items-center gap-1 transition-opacity duration-200 ${isTitleHovered ? 'opacity-100' : 'opacity-0'}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsGuideOpen(true)}
                  className="p-1.5 rounded hover:bg-deep/50 text-text-secondary hover:text-text-primary transition-colors"
                  title="Guide"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-shadow border border-border text-text-primary">
                Guide
              </TooltipContent>
            </Tooltip>
            <button
              onClick={handleExport}
              className="p-1.5 rounded hover:bg-deep/50 text-text-secondary hover:text-text-primary transition-colors"
              title="Export"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 rounded hover:bg-deep/50 text-text-secondary hover:text-text-primary transition-colors"
              title="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Document Area - Notion/Word style, integrated page */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto pt-1 pb-12 px-8">
          <textarea
            value={editorContent || (!hasUserTyped ? "The morning sun cast long shadows across the cobblestone streets, painting the ancient city in hues of gold and amber. A gentle breeze carried the scent of fresh bread from the bakery on the corner, mingling with the distant sound of church bells.\n\nIn the quiet of dawn, before the city fully awakened, there was a sense of possibility—a moment suspended between night and day where anything could happen." : "")}
            onChange={handleContentChange}
            className="w-full min-h-[600px] bg-transparent text-text-primary placeholder:text-text-muted/60 text-base leading-relaxed resize-none focus:outline-none"
            placeholder="Start writing..."
          />
        </div>
      </div>

      <Modal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        title="Page Editor Guide"
        maxWidth="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsGuideOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-sm text-text-secondary">
          <div className="space-y-2">
            <div className="text-text-primary font-semibold">Basics</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>Edits autosave a moment after you stop typing.</li>
              <li>Use the title bar to set your page title.</li>
              <li>Export functionality coming soon (PDF, DOCX, etc.).</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
}
