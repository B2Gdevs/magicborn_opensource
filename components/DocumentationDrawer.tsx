// components/DocumentationDrawer.tsx
// Modular drawer component for developer workbench (like Stripe's developer workbench)

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DocumentationViewer, { ViewerMode } from "@components/DocumentationViewer";

export type WorkbenchTab = "documentation" | "mini-games";
export type DrawerSize = "minimized" | "short" | "medium" | "full";

interface DocumentationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab?: WorkbenchTab;
  onTabChange?: (tab: WorkbenchTab) => void;
}

const DRAWER_HEIGHTS: Record<DrawerSize, string> = {
  minimized: "60px",
  short: "40vh",
  medium: "60vh",
  full: "100vh",
};

export default function DocumentationDrawer({
  isOpen,
  onClose,
  activeTab = "documentation",
  onTabChange,
}: DocumentationDrawerProps) {
  const [internalTab, setInternalTab] = useState<WorkbenchTab>(activeTab);
  const [drawerSize, setDrawerSize] = useState<DrawerSize>("medium");

  const handleTabChange = (tab: WorkbenchTab) => {
    setInternalTab(tab);
    onTabChange?.(tab);
  };

  const currentTab = activeTab || internalTab;
  const height = DRAWER_HEIGHTS[drawerSize];
  const isMinimized = drawerSize === "minimized";

  const handleSizeChange = (size: DrawerSize) => {
    setDrawerSize(size);
  };

  const handleMinimize = () => {
    setDrawerSize("minimized");
  };

  const handleMaximize = () => {
    setDrawerSize("full");
  };

  const handleClose = () => {
    setDrawerSize("medium"); // Reset to default on close
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-shadow border-t-2 border-border shadow-2xl"
          style={{ height, maxHeight: drawerSize === "full" ? "100vh" : "80vh" }}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <DrawerHeader
              isMinimized={isMinimized}
              onMinimize={handleMinimize}
              onMaximize={handleMaximize}
              onClose={handleClose}
              drawerSize={drawerSize}
              onSizeChange={handleSizeChange}
            />

            {!isMinimized && (
              <>
                {/* Tabs */}
                <DrawerTabs
                  currentTab={currentTab}
                  onTabChange={handleTabChange}
                />

                {/* Content */}
                <div className="flex-1 min-h-0 overflow-hidden relative">
                  {currentTab === "documentation" ? (
                    <div className="absolute inset-0">
                      <DocumentationViewer mode={ViewerMode.DEVELOPER} />
                    </div>
                  ) : (
                    <MiniGamesContent />
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface DrawerHeaderProps {
  isMinimized: boolean;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
  drawerSize: DrawerSize;
  onSizeChange: (size: DrawerSize) => void;
}

function DrawerHeader({
  isMinimized,
  onMinimize,
  onMaximize,
  onClose,
  drawerSize,
  onSizeChange,
}: DrawerHeaderProps) {
  return (
    <div className="flex items-center justify-between px-8 py-4 border-b border-border flex-shrink-0">
      <h2 className="text-2xl font-bold text-glow">Developer Workbench</h2>
      <div className="flex items-center gap-2">
        {/* Size Controls */}
        {!isMinimized && (
          <div className="flex items-center gap-1 border border-border rounded-lg p-1">
            <button
              onClick={() => onSizeChange("short")}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                drawerSize === "short"
                  ? "bg-ember text-white"
                  : "text-text-secondary hover:text-ember-glow"
              }`}
              title="Short (40vh)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </button>
            <button
              onClick={() => onSizeChange("medium")}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                drawerSize === "medium"
                  ? "bg-ember text-white"
                  : "text-text-secondary hover:text-ember-glow"
              }`}
              title="Medium (60vh)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={onMaximize}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                drawerSize === "full"
                  ? "bg-ember text-white"
                  : "text-text-secondary hover:text-ember-glow"
              }`}
              title="Full Screen"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Minimize/Maximize */}
        <button
          onClick={isMinimized ? onMaximize : onMinimize}
          className="text-text-muted hover:text-text-primary transition-colors p-2 hover:bg-deep rounded"
          aria-label={isMinimized ? "Restore" : "Minimize"}
          title={isMinimized ? "Restore" : "Minimize"}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMinimized ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            )}
          </svg>
        </button>

        {/* Close */}
        <button
          onClick={onClose}
          className="text-text-muted hover:text-red-400 transition-colors p-2 hover:bg-deep rounded"
          aria-label="Close"
          title="Close"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

interface DrawerTabsProps {
  currentTab: WorkbenchTab;
  onTabChange: (tab: WorkbenchTab) => void;
}

function DrawerTabs({ currentTab, onTabChange }: DrawerTabsProps) {
  return (
    <div className="flex gap-2 px-8 py-3 border-b border-border flex-shrink-0">
      <button
        onClick={() => onTabChange("documentation")}
        className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
          currentTab === "documentation"
            ? "bg-ember text-white border-2 border-ember-glow"
            : "bg-deep text-text-secondary hover:text-ember-glow border-2 border-border"
        }`}
      >
        <span className="flex items-center gap-2">
          <span>📚</span>
          <span>Documentation</span>
        </span>
      </button>
      <button
        onClick={() => onTabChange("mini-games")}
        className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
          currentTab === "mini-games"
            ? "bg-ember text-white border-2 border-ember-glow"
            : "bg-deep text-text-secondary hover:text-ember-glow border-2 border-border"
        }`}
      >
        <span className="flex items-center gap-2">
          <span>🎮</span>
          <span>Mini Games</span>
        </span>
      </button>
    </div>
  );
}

function MiniGamesContent() {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h3 className="text-2xl font-bold text-glow mb-4">Mini Games</h3>
        <p className="text-text-secondary">
          Interactive mini-games and tools for testing and exploring game data.
        </p>
        <div className="card space-y-4">
          <p className="text-text-muted">Coming soon...</p>
        </div>
      </div>
    </div>
  );
}
