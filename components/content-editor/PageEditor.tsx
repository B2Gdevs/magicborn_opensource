// components/content-editor/PageEditor.tsx
// BlockNote-based word processor for Pages - Google Docs/Word-style layout

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, Download, MoreVertical, HelpCircle } from "lucide-react";
import { SaveStatus } from "@lib/content-editor/types";
import { BlockNoteEditor } from "./DynamicBlockNoteEditor";
import { Modal } from "@components/ui/Modal";
import { Button } from "@components/ui/Button";
import { Tooltip } from "@components/ui/Tooltip";

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
  const [editorContent, setEditorContent] = useState<any>(undefined);
  const [editorInstance, setEditorInstance] = useState<any>(null);
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
        
        // Load content into BlockNote (stored as JSON field)
        if (pageData.content) {
          // Content is already JSON from Payload (json field type)
          // It should be an array of BlockNote blocks
          if (Array.isArray(pageData.content) && pageData.content.length > 0) {
            setEditorContent(pageData.content);
            setHasUserTyped(true); // User has content, so they've typed
          } else {
            // If it's not an array, start fresh
            console.warn("Page content is not in expected BlockNote format:", typeof pageData.content);
            setEditorContent(undefined);
            setHasUserTyped(false);
          }
        } else {
          setEditorContent(undefined);
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
    const currentEditor = editorInstance;
    if (!currentEditor || isSavingRef.current) {
      return;
    }
    
    isSavingRef.current = true;
    setSaving(true);
    onSaveStatusChange?.(SaveStatus.Saving);
    try {
      // Get BlockNote content as JSON array of blocks
      const blocks = currentEditor.document;
      
      // Title bar is the source of truth. Do NOT overwrite it from editor content during autosave.
      const extractedTitle = titleRef.current || `Page ${calculatedPageNumberRef.current}`;
      
      // Filter out placeholder blocks before saving
      const contentToSave = blocks.filter((block: any) => 
        !block.id?.startsWith("placeholder")
      );
      
      const payload = {
        title: extractedTitle,
        content: contentToSave.length > 0 ? contentToSave : blocks, // Store as BlockNote JSON (json field type)
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
  }, [editorInstance, onSaveStatusChange, onLastSavedChange]);

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
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-ember-glow" />
      </div>
    );
  }

  // Get placeholder content for new pages (BlockNote format)
  const getPlaceholderContent = () => {
    const pageTitle = title || `Page ${calculatedPageNumber}`;
    return [
      {
        id: "placeholder-title",
        type: "heading",
        props: {
          level: 1,
          textColor: "default",
          backgroundColor: "default",
        },
        content: [
          {
            type: "text",
            text: pageTitle,
            styles: {},
          },
        ],
      },
      {
        id: "placeholder-1",
        type: "paragraph",
        props: {
          textColor: "default",
          backgroundColor: "default",
        },
        content: [
          {
            type: "text",
            text: "The morning sun cast long shadows across the cobblestone streets, painting the ancient city in hues of gold and amber. A gentle breeze carried the scent of fresh bread from the bakery on the corner, mingling with the distant sound of church bells.",
            styles: {},
          },
        ],
      },
      {
        id: "placeholder-2",
        type: "paragraph",
        props: {
          textColor: "default",
          backgroundColor: "default",
        },
        content: [
          {
            type: "text",
            text: "In the quiet of dawn, before the city fully awakened, there was a sense of possibility—a moment suspended between night and day where anything could happen.",
            styles: {},
          },
        ],
      },
    ];
  };

  // Determine initial content - use placeholder if no content exists
  const getInitialContent = () => {
    if (editorContent && editorContent.length > 0) {
      return editorContent;
    }
    if (!hasUserTyped) {
      return getPlaceholderContent();
    }
    return undefined;
  };

  const handleEditorReady = (editor: any) => {
    setEditorInstance(editor);
    
    // Track when user starts typing to remove placeholder
    if (!hasUserTyped) {
      const unsubscribe = editor.onChange(() => {
        const blocks = editor.document;
        // Check if user has modified any content (excluding title)
        const hasUserContent = blocks.some((block: any) => {
          if (block.id === "placeholder-title") return false; // Title block doesn't count
          if (block.type === "paragraph" || block.type === "heading") {
            const text = block.content
              ?.filter((c: any) => c.type === "text")
              .map((c: any) => c.text)
              .join("") || "";
            // Check if text is different from placeholder text
            if (block.id === "placeholder-1") {
              return text !== "The morning sun cast long shadows across the cobblestone streets, painting the ancient city in hues of gold and amber. A gentle breeze carried the scent of fresh bread from the bakery on the corner, mingling with the distant sound of church bells.";
            }
            if (block.id === "placeholder-2") {
              return text !== "In the quiet of dawn, before the city fully awakened, there was a sense of possibility—a moment suspended between night and day where anything could happen.";
            }
            return text.trim().length > 0;
          }
          return true;
        });
        
        if (hasUserContent) {
          setHasUserTyped(true);
          unsubscribe(); // Stop tracking once user has typed
        }
      });
    }
  };

  const handleEditorChange = () => {
    if (editorInstance) {
      triggerAutosave();
    }
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
            <Tooltip content="Guide">
              <button
                onClick={() => setIsGuideOpen(true)}
                className="p-1.5 rounded hover:bg-deep/50 text-text-secondary hover:text-text-primary transition-colors"
                title="Guide"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
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
          <style jsx global>{`
            .bn-container {
              --bn-colors-editor-text: var(--text-primary);
              --bn-colors-editor-background: transparent;
              --bn-colors-menu-text: var(--text-primary);
              --bn-colors-menu-background: var(--shadow);
              --bn-colors-tooltip-text: var(--text-primary);
              --bn-colors-tooltip-background: var(--deep);
              --bn-colors-hovered-text: var(--text-primary);
              --bn-colors-hovered-background: var(--deep);
              --bn-colors-selected-text: var(--ember-glow);
              --bn-colors-selected-background: var(--ember)/20;
              --bn-colors-disabled-text: var(--text-muted);
              --bn-colors-disabled-background: transparent;
              --bn-colors-shadow: rgba(0, 0, 0, 0.3);
              --bn-colors-border: var(--border);
              --bn-border-radius: 0.375rem;
            }
            .bn-editor {
              min-height: 600px;
              font-size: 16px;
              line-height: 1.75;
              color: var(--text-primary);
            }
            .bn-editor p {
              margin-bottom: 1rem;
            }
            .bn-editor h1 {
              font-size: 2.5rem;
              font-weight: 700;
              margin-top: 2rem;
              margin-bottom: 1.5rem;
              line-height: 1.2;
            }
            .bn-editor h2 {
              font-size: 2rem;
              font-weight: 600;
              margin-top: 1.5rem;
              margin-bottom: 1rem;
            }
            .bn-editor h3 {
              font-size: 1.5rem;
              font-weight: 600;
              margin-top: 1.25rem;
              margin-bottom: 0.75rem;
            }
            /* Placeholder text styling */
            .bn-editor [data-placeholder] {
              color: var(--text-muted);
              opacity: 0.6;
            }
          `}</style>
          <BlockNoteEditor 
            initialContent={getInitialContent()}
            onEditorReady={handleEditorReady}
            onChange={handleEditorChange}
            projectId={projectId}
            pageId={pageId}
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
              <li>Type <span className="font-mono text-text-primary">/</span> to open the slash menu (blocks + AI commands).</li>
              <li>Select text to show the formatting toolbar (bold/italic/etc + AI).</li>
              <li>Edits autosave a moment after you stop typing.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-text-primary font-semibold">AI editing</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>Select text → click the AI button in the toolbar to rewrite/expand/condense.</li>
              <li>Or type <span className="font-mono text-text-primary">/ai</span> to open AI actions at the cursor.</li>
            </ul>
            <div className="text-xs text-text-muted">
              Note: AI uses LM Studio by default (running locally). Prompts are pulled from your project, chapter, and page settings for context-aware assistance.
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
