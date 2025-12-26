// CodexEntryActionsMenu.tsx
// Entry actions menu using shadcn dropdown-menu

"use client";

import * as React from "react";
import { MoreVertical, Edit, Copy, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface CodexEntryActionsMenuProps {
  entry: { id: string; name: string };
  categoryId: string;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function CodexEntryActionsMenu({
  entry,
  categoryId,
  onEdit,
  onDuplicate,
  onDelete,
}: CodexEntryActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.stopPropagation()}
      >
        <button
          className="p-1 hover:bg-deep rounded opacity-0 group-hover:opacity-100 transition-opacity"
          title="More actions"
        >
          <MoreVertical className="w-4 h-4 text-text-muted" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[160px] bg-shadow border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="cursor-pointer"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="cursor-pointer"
        >
          <Copy className="w-4 h-4 mr-2" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={cn(
            "cursor-pointer text-red-400 focus:text-red-300 focus:bg-red-500/10"
          )}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

