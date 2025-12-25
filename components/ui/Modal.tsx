// components/ui/Modal.tsx
// Reusable modal component with fixed header and footer

"use client";

import { ReactNode, useState } from "react";
import { X, Trash2 } from "lucide-react";
import { Tooltip } from "@components/ui/Tooltip";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode; // Optional footer content (buttons, etc.)
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl";
  className?: string;
  onDelete?: () => void | Promise<void>; // Delete handler - shows delete button when provided
  deleteLabel?: string; // Custom label for delete confirmation (default: "this item")
  isDeleting?: boolean; // Loading state for delete operation
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = "4xl",
  className = "",
  onDelete,
  deleteLabel = "this item",
  isDeleting = false,
}: ModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen) return null;

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (onDelete) {
      await onDelete();
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className={`bg-black border border-border rounded-lg ${maxWidthClasses[maxWidth]} w-full max-h-[90vh] flex flex-col ${className}`}
      >
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0 bg-shadow/50">
          <h2 className="text-2xl font-bold text-glow">{title}</h2>
          <div className="flex items-center gap-2">
            {/* Delete Button - only shown when onDelete is provided */}
            {onDelete && (
              <>
                {showDeleteConfirm ? (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-1.5">
                    <span className="text-sm text-red-400">Delete {deleteLabel}?</span>
                    <button
                      onClick={handleDeleteConfirm}
                      disabled={isDeleting}
                      className="text-xs px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting ? "Deleting..." : "Yes"}
                    </button>
                    <button
                      onClick={handleDeleteCancel}
                      disabled={isDeleting}
                      className="text-xs px-2 py-1 bg-deep hover:bg-deep/80 text-text-primary rounded transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <Tooltip content="Delete">
                    <button
                      onClick={handleDeleteClick}
                      disabled={isDeleting}
                      className="px-3 py-1.5 border border-red-500/50 text-red-500 hover:border-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm hover:shadow-md"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-xs font-medium">Delete</span>
                    </button>
                  </Tooltip>
                )}
              </>
            )}
            <Tooltip content="Close">
              <button
                onClick={onClose}
                className="text-text-muted hover:text-text-primary transition-colors p-1 rounded"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="bg-shadow flex-1 overflow-y-auto px-6 py-4 min-h-0">{children}</div>

        {/* Fixed Footer */}
        {footer && (
          <div className="flex-shrink-0 px-6 py-3 border-t border-border/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

