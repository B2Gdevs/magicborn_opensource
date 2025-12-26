// CodexBulkActions.tsx
// Bulk actions toolbar for selected entries

"use client";

import { Copy, Trash2, X } from "lucide-react";

interface CodexBulkActionsProps {
  selectedCount: number;
  onClear: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  isCollapsed: boolean;
}

export function CodexBulkActions({
  selectedCount,
  onClear,
  onDuplicate,
  onDelete,
  isCollapsed,
}: CodexBulkActionsProps) {
  if (isCollapsed || selectedCount === 0) return null;

  return (
    <div className="p-2 border-t border-border bg-deep/30">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-text-secondary">
          {selectedCount} {selectedCount === 1 ? 'entry' : 'entries'} selected
        </span>
        <button
          onClick={onClear}
          className="p-1 hover:bg-deep rounded transition-colors"
          title="Clear selection"
        >
          <X className="w-3.5 h-3.5 text-text-muted" />
        </button>
      </div>
      <div className="flex gap-1">
        <button
          onClick={onDuplicate}
          className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs text-text-primary hover:bg-deep rounded transition-colors"
          title="Duplicate selected"
        >
          <Copy className="w-3.5 h-3.5" />
          Duplicate
        </button>
        <button
          onClick={onDelete}
          className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded transition-colors"
          title="Delete selected"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
}

