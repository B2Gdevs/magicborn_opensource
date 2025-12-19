"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Edit, Copy, Trash2 } from "lucide-react";

interface EntryActionsMenuProps {
  entry: { id: string; name: string };
  categoryId: string;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function EntryActionsMenu({ entry, categoryId, onEdit, onDuplicate, onDelete }: EntryActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1 hover:bg-deep rounded opacity-0 group-hover:opacity-100 transition-opacity"
        title="More actions"
      >
        <MoreVertical className="w-4 h-4 text-text-muted" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-shadow border border-border rounded-lg shadow-xl z-50 min-w-[160px]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onEdit();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-deep transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onDuplicate();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-deep transition-colors"
          >
            <Copy className="w-4 h-4" />
            Duplicate
          </button>
          <div className="border-t border-border my-1" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onDelete();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

