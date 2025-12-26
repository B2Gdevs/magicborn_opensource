// CodexFormFooter.tsx
// Standard footer for codex entry modals
// Save, Cancel, and optional Delete buttons

"use client";

import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";

interface CodexFormFooterProps {
  /** Whether this is edit mode (shows delete button) */
  isEdit: boolean;
  /** Whether a save operation is in progress */
  saving: boolean;
  /** Cancel button handler */
  onCancel: () => void;
  /** Submit button handler (triggers form submit) */
  onSubmit: () => void;
  /** Optional delete handler */
  onDelete?: () => void;
  /** Whether a delete operation is in progress */
  isDeleting?: boolean;
  /** Custom submit button label */
  submitLabel?: string;
  /** Custom cancel button label */
  cancelLabel?: string;
  /** Custom delete button label */
  deleteLabel?: string;
}

export function CodexFormFooter({
  isEdit,
  saving,
  onCancel,
  onSubmit,
  onDelete,
  isDeleting = false,
  submitLabel,
  cancelLabel = "Cancel",
  deleteLabel = "Delete",
}: CodexFormFooterProps) {
  const defaultSubmitLabel = isEdit ? "Save Changes" : "Create";
  
  return (
    <div className="flex items-center justify-between gap-3">
      {/* Left side: Delete button (edit mode only) */}
      <div>
        {isEdit && onDelete && (
          <Button
            type="button"
            variant="danger"
            onClick={onDelete}
            disabled={saving || isDeleting}
            size="sm"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            {isDeleting ? "Deleting..." : deleteLabel}
          </Button>
        )}
      </div>

      {/* Right side: Cancel and Submit */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={saving || isDeleting}
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={onSubmit}
          disabled={saving || isDeleting}
        >
          {saving ? "Saving..." : submitLabel || defaultSubmitLabel}
        </Button>
      </div>
    </div>
  );
}

