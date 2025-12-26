// CodexSidebarHeader.tsx
// Header section of codex sidebar with title and search
// Dumb component - receives all data and callbacks via props

"use client";

import { FolderOpen, FolderClosed, Undo2, Redo2, HelpCircle } from "lucide-react";
import { CodexSearch } from "./CodexSearch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { getModifierKey, getModifierKeyName } from "@/lib/utils/keyboard";

interface CodexSidebarHeaderProps {
  isCollapsed: boolean;
  searchQuery: string;
  onToggleCollapsed: () => void;
  onSearchChange: (value: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onShowShortcuts?: () => void;
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
  onShowShortcuts,
}: CodexSidebarHeaderProps) {
  const modKey = getModifierKey();
  const modKeyName = getModifierKeyName();

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
                    <div className="flex items-center gap-2">
                      Undo <KbdGroup><Kbd>{modKey}</Kbd><Kbd>Z</Kbd></KbdGroup>
                    </div>
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
                    <div className="flex items-center gap-2">
                      Redo <KbdGroup><Kbd>Shift</Kbd><Kbd>{modKey}</Kbd><Kbd>Z</Kbd></KbdGroup>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
              {onShowShortcuts && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={onShowShortcuts}
                      className="p-1.5 rounded hover:bg-deep text-text-muted hover:text-text-primary transition-colors"
                      aria-label="Keyboard shortcuts"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-shadow border border-border text-text-primary">
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        Undo: <KbdGroup><Kbd>{modKey}</Kbd><Kbd>Z</Kbd></KbdGroup>
                      </div>
                      <div className="flex items-center gap-2">
                        Redo: <KbdGroup><Kbd>Shift</Kbd><Kbd>{modKey}</Kbd><Kbd>Z</Kbd></KbdGroup>
                      </div>
                      <div className="flex items-center gap-2">
                        Delete: <Kbd>Delete</Kbd> or <Kbd>Backspace</Kbd>
                      </div>
                      <div className="flex items-center gap-2">
                        Edit: <Kbd>Enter</Kbd>
                      </div>
                    </div>
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
                <div className="flex items-center gap-2">
                  Undo <KbdGroup><Kbd>{modKey}</Kbd><Kbd>Z</Kbd></KbdGroup>
                </div>
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
                <div className="flex items-center gap-2">
                  Redo <KbdGroup><Kbd>Shift</Kbd><Kbd>{modKey}</Kbd><Kbd>Z</Kbd></KbdGroup>
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );
}

