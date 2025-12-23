"use client";

import { useEffect, useRef } from "react";
import { Plus, Edit, Trash2, Copy, Eye } from "lucide-react";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  items: ContextMenuItem[];
}

export interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
}

export function ContextMenu({ x, y, onClose, items }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // Adjust position to keep menu in viewport
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (rect.right > viewportWidth) {
        menuRef.current.style.left = `${x - rect.width}px`;
      }
      if (rect.bottom > viewportHeight) {
        menuRef.current.style.top = `${y - rect.height}px`;
      }
    }
  }, [x, y]);

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] bg-shadow border border-border rounded-lg shadow-xl py-1 min-w-[160px]"
      style={{ left: x, top: y }}
    >
      {items.map((item, index) => {
        if (item.divider) {
          return <div key={index} className="border-t border-border my-1" />;
        }

        return (
          <button
            key={index}
            onClick={() => {
              if (!item.disabled) {
                item.onClick();
                onClose();
              }
            }}
            disabled={item.disabled}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
              item.disabled
                ? "text-text-muted cursor-not-allowed"
                : item.danger
                ? "text-red-400 hover:bg-red-500/10"
                : "text-text-primary hover:bg-deep"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

// Pre-built menu item generators
export const menuItems = {
  create: (label: string, onClick: () => void): ContextMenuItem => ({
    label: `New ${label}`,
    icon: <Plus className="w-4 h-4" />,
    onClick,
  }),
  edit: (onClick: () => void): ContextMenuItem => ({
    label: "Edit",
    icon: <Edit className="w-4 h-4" />,
    onClick,
  }),
  duplicate: (onClick: () => void): ContextMenuItem => ({
    label: "Duplicate",
    icon: <Copy className="w-4 h-4" />,
    onClick,
  }),
  view: (onClick: () => void): ContextMenuItem => ({
    label: "View Details",
    icon: <Eye className="w-4 h-4" />,
    onClick,
  }),
  delete: (onClick: () => void): ContextMenuItem => ({
    label: "Delete",
    icon: <Trash2 className="w-4 h-4" />,
    onClick,
    danger: true,
  }),
  divider: (): ContextMenuItem => ({
    label: "",
    onClick: () => {},
    divider: true,
  }),
};



