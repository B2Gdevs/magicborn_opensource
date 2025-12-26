// CodexEntryList.tsx
// List of entries for a category

"use client";

import { CodexCategory } from "@lib/content-editor/constants";
import { CodexEntryActionsMenu } from "./CodexEntryActionsMenu";
import type { CodexEntry } from "./types/codex.types";

interface CodexEntryListProps {
  categoryId: CodexCategory;
  entries: CodexEntry[];
  selectedEntries: Set<string>;
  onEntryClick: (e: React.MouseEvent, categoryId: CodexCategory, entryId: string, index: number) => void;
  onEntryDoubleClick: (e: React.MouseEvent, categoryId: CodexCategory, entryId: string) => void;
  onContextMenu: (e: React.MouseEvent, type: "category" | "entry", categoryId: CodexCategory, entry?: CodexEntry) => void;
  onEdit: (categoryId: CodexCategory, entryId: string) => void;
  onDuplicate: (categoryId: CodexCategory, entryId: string) => void;
  onDelete: (categoryId: CodexCategory, entryId: string) => void;
}

export function CodexEntryList({
  categoryId,
  entries,
  selectedEntries,
  onEntryClick,
  onEntryDoubleClick,
  onContextMenu,
  onEdit,
  onDuplicate,
  onDelete,
}: CodexEntryListProps) {
  if (entries.length === 0) {
    return (
      <div className="text-xs text-text-muted px-2 py-0.5 italic">
        No entries yet
      </div>
    );
  }

  return (
    <>
      {entries.map((entry, index) => {
        const isSelected = selectedEntries.has(entry.id);
        return (
          <div
            key={entry.id}
            className={`group flex items-center justify-between w-full text-xs px-2 py-0.5 rounded cursor-pointer transition-colors ${
              isSelected
                ? "bg-ember/20 border border-ember/30 text-ember-glow"
                : "text-text-secondary hover:text-ember-glow hover:bg-deep/50"
            }`}
            onClick={(e) => onEntryClick(e, categoryId, entry.id, index)}
            onDoubleClick={(e) => onEntryDoubleClick(e, categoryId, entry.id)}
            onContextMenu={(e) => onContextMenu(e, "entry", categoryId, entry)}
          >
            <span className="truncate flex-1">{entry.name}</span>
            <CodexEntryActionsMenu
              entry={entry}
              categoryId={categoryId}
              onEdit={() => onEdit(categoryId, entry.id)}
              onDuplicate={() => onDuplicate(categoryId, entry.id)}
              onDelete={() => onDelete(categoryId, entry.id)}
            />
          </div>
        );
      })}
    </>
  );
}

