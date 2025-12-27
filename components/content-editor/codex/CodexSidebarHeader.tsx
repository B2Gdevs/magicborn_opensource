// CodexSidebarHeader.tsx
// Header section of codex sidebar with title and search
// Dumb component - receives all data and callbacks via props

"use client";

import { FolderOpen, FolderClosed, Undo2, Redo2, Plus, Upload } from "lucide-react";
import { CodexSearch } from "./CodexSearch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface CodexSidebarHeaderProps {
  isCollapsed: boolean;
  searchQuery: string;
  onToggleCollapsed: () => void;
  onSearchChange: (value: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onCreateCustomType?: () => void;
  onImportCustomType?: () => void;
}

export function CodexSidebarHeader({
  isCollapsed,
  searchQuery,
  onToggleCollapsed,
  onSearchChange,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onCreateCustomType,
  onImportCustomType,
}: CodexSidebarHeaderProps) {
  return (
    <div className="p-2">
      {!isCollapsed ? (
        <>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FolderOpen
                className="w-4 h-4 text-text-muted flex-shrink-0 cursor-pointer"
                onClick={onToggleCollapsed}
              />
              <h2 className="text-sm font-semibold text-glow">Codex</h2>
            </div>
            <div className="flex items-center gap-1">
              {onImportCustomType && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={onImportCustomType}
                      className="p-1.5 rounded hover:bg-deep text-text-muted hover:text-text-primary transition-colors"
                      aria-label="Import Entity Type"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-shadow border border-border text-text-primary">
                    Import Entity Type
                  </TooltipContent>
                </Tooltip>
              )}
              {onCreateCustomType && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={onCreateCustomType}
                      className="p-1.5 rounded hover:bg-deep text-text-muted hover:text-text-primary transition-colors"
                      aria-label="Create Entity Type"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-shadow border border-border text-text-primary">
                    Create Entity Type
                  </TooltipContent>
                </Tooltip>
              )}
              {onUndo && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={onUndo}
                      disabled={!canUndo}
                      className="p-1.5 rounded hover:bg-deep text-text-muted hover:text-text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Undo"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-shadow border border-border text-text-primary">
                    Undo
                  </TooltipContent>
                </Tooltip>
              )}
              {onRedo && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={onRedo}
                      disabled={!canRedo}
                      className="p-1.5 rounded hover:bg-deep text-text-muted hover:text-text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Redo"
                    >
                      <Redo2 className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-shadow border border-border text-text-primary">
                    Redo
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
          <CodexSearch
            value={searchQuery}
            onChange={onSearchChange}
            isCollapsed={isCollapsed}
          />
        </>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="p-1.5">
            <FolderClosed
              className="w-6 h-6 text-text-muted cursor-pointer"
              onClick={onToggleCollapsed}
            />
          </div>
          {onImportCustomType && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onImportCustomType}
                  className="p-1.5 rounded hover:bg-deep text-text-muted hover:text-text-primary transition-colors"
                  aria-label="Import Entity Type"
                >
                  <Upload className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-shadow border border-border text-text-primary">
                Import Entity Type
              </TooltipContent>
            </Tooltip>
          )}
          {onCreateCustomType && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onCreateCustomType}
                  className="p-1.5 rounded hover:bg-deep text-text-muted hover:text-text-primary transition-colors"
                  aria-label="Create Entity Type"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-shadow border border-border text-text-primary">
                Create Entity Type
              </TooltipContent>
            </Tooltip>
          )}
          {onUndo && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onUndo}
                  disabled={!canUndo}
                  className="p-1.5 rounded hover:bg-deep text-text-muted hover:text-text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Undo"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-shadow border border-border text-text-primary">
                Undo
              </TooltipContent>
            </Tooltip>
          )}
          {onRedo && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onRedo}
                  disabled={!canRedo}
                  className="p-1.5 rounded hover:bg-deep text-text-muted hover:text-text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Redo"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-shadow border border-border text-text-primary">
                Redo
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );
}

