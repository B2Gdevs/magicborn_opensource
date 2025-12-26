// CodexContextMenu.tsx
// Custom context menu for programmatic positioning (right-click menus)

"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export interface CodexContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
}

interface CodexContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  items: CodexContextMenuItem[];
}

export function CodexContextMenu({ x, y, onClose, items }: CodexContextMenuProps) {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Close on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Use setTimeout to avoid immediate close on right-click
    const timeout = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Adjust position to keep menu in viewport
  React.useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = x;
      let adjustedY = y;

      if (rect.right > viewportWidth) {
        adjustedX = x - rect.width;
      }
      if (rect.bottom > viewportHeight) {
        adjustedY = y - rect.height;
      }
      if (adjustedX < 0) adjustedX = 8;
      if (adjustedY < 0) adjustedY = 8;

      menuRef.current.style.left = `${adjustedX}px`;
      menuRef.current.style.top = `${adjustedY}px`;
    }
  }, [x, y]);

  if (!mounted) return null;

  const menuContent = (
    <div
      ref={menuRef}
      className={cn(
        "fixed z-[100] min-w-[160px] overflow-hidden rounded-lg border border-border bg-shadow shadow-xl",
        "animate-in fade-in-0 zoom-in-95"
      )}
      style={{ left: x, top: y }}
    >
      {items.map((item, index) => {
        if (item.divider) {
          return (
            <div key={index} className="my-1 border-t border-border" />
          );
        }

        return (
          <button
            key={index}
            disabled={item.disabled}
            onClick={() => {
              if (!item.disabled) {
                item.onClick();
                onClose();
              }
            }}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 text-sm outline-none transition-colors",
              "focus:bg-deep focus:text-text-primary",
              item.disabled
                ? "text-text-muted cursor-not-allowed opacity-50"
                : item.danger
                ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                : "text-text-primary hover:bg-deep"
            )}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );

  return createPortal(menuContent, document.body);
}

