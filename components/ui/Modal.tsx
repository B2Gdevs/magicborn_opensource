// components/ui/Modal.tsx
// Reusable modal component with fixed header and footer

"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";
import { Tooltip } from "@components/ui/Tooltip";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode; // Optional footer content (buttons, etc.)
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl";
  className?: string;
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
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className={`bg-void border border-border rounded-lg ${maxWidthClasses[maxWidth]} w-full max-h-[90vh] flex flex-col ${className}`}
      >
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0 bg-shadow/50">
          <h2 className="text-2xl font-bold text-glow">{title}</h2>
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">{children}</div>

        {/* Fixed Footer */}
        {footer && (
          <div className="flex-shrink-0 px-6 py-4 border-t border-border bg-shadow/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

