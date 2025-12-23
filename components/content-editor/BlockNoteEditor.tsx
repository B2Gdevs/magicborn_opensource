// components/content-editor/BlockNoteEditor.tsx
// BlockNote editor component (client-side only, following Next.js docs pattern)

"use client";

import { useEffect, useRef, useState } from "react";
import "@blocknote/core/fonts/inter.css";
import { filterSuggestionItems } from "@blocknote/core/extensions";
import { en } from "@blocknote/core/locales";
import { useCreateBlockNote } from "@blocknote/react";
import {
  FormattingToolbar,
  FormattingToolbarController,
  getDefaultReactSlashMenuItems,
  getFormattingToolbarItems,
  SuggestionMenuController,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {
  AIExtension,
  AIMenuController,
  AIToolbarButton,
  getAISlashMenuItems,
} from "@blocknote/xl-ai";
import { en as aiEn } from "@blocknote/xl-ai/locales";
import "@blocknote/xl-ai/style.css";
import { DefaultChatTransport } from "ai";

interface BlockNoteEditorProps {
  initialContent?: any;
  onEditorReady?: (editor: any) => void;
  onChange?: () => void;
  // Optional context IDs for hierarchical AI prompts
  projectId?: string | number;
  pageId?: string | number;
  chapterId?: string | number;
  actId?: string | number;
  entityId?: string | number;
  entityType?: "characters" | "lore" | "locations" | "creatures" | "objects";
}

export default function BlockNoteEditor({
  initialContent,
  onEditorReady,
  onChange,
  projectId,
  pageId,
  chapterId,
  actId,
  entityId,
  entityType,
}: BlockNoteEditorProps) {
  const [mounted, setMounted] = useState(false);
  
  // Creates a new editor instance
  const editor = useCreateBlockNote({
    dictionary: {
      ...en,
      ai: aiEn,
    },
    extensions: [
      AIExtension({
        transport: new DefaultChatTransport({
          api: "/api/chat",
          // Use custom fetch to add context to request body
          fetch: async (url, options) => {
            const body = options?.body ? JSON.parse(options.body as string) : {};
            // Add context IDs for hierarchical prompts
            const bodyWithContext = {
              ...body,
              projectId,
              pageId,
              chapterId,
              actId,
              entityId,
              entityType,
            };
            return fetch(url, {
              ...options,
              body: JSON.stringify(bodyWithContext),
            });
          },
        }),
      }),
    ],
    initialContent,
  });
  const hasInitialized = useRef(false);

  // Ensure component is mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Expose editor instance to parent and set up change tracking
  useEffect(() => {
    if (!mounted || !editor) return;
    
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      if (onEditorReady) {
        onEditorReady(editor);
      }
      
      // Track changes
      if (onChange) {
        editor.onChange(() => {
          onChange();
        });
      }
    }
  }, [mounted, editor, onEditorReady, onChange]);

  // Don't render until mounted on client
  if (!mounted || !editor) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-text-muted">Loading editor...</div>
      </div>
    );
  }

  return (
    <BlockNoteView editor={editor} theme="dark" formattingToolbar={false} slashMenu={false}>
      <AIMenuController />
      <FormattingToolbarWithAI />
      <SuggestionMenuWithAI editor={editor} />
    </BlockNoteView>
  );
}

function FormattingToolbarWithAI() {
  return (
    <FormattingToolbarController
      formattingToolbar={() => (
        <FormattingToolbar>
          {...getFormattingToolbarItems()}
          <AIToolbarButton />
        </FormattingToolbar>
      )}
    />
  );
}

function SuggestionMenuWithAI(props: { editor: any }) {
  return (
    <SuggestionMenuController
      triggerCharacter="/"
      getItems={async (query) =>
        filterSuggestionItems(
          [
            ...getDefaultReactSlashMenuItems(props.editor),
            ...getAISlashMenuItems(props.editor),
          ],
          query
        )
      }
    />
  );
}

