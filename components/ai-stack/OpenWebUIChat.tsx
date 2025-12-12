// components/ai-stack/OpenWebUIChat.tsx
// Chat-only interface for OpenWebUI with management link
// Uses embedded layout to show only chat, management opens in new window

"use client";

import { ExternalLink, Info, Settings, BookOpen } from "lucide-react";

interface OpenWebUIChatProps {
  className?: string;
  showManagementLink?: boolean;
  compact?: boolean;
}

export default function OpenWebUIChat({ 
  className = "",
  showManagementLink = true,
  compact = false
}: OpenWebUIChatProps) {
  const openManagement = () => {
    window.open("http://localhost:8080/", "_blank", "noopener,noreferrer");
  };

  const openDocs = () => {
    window.open("/developer/openwebui-limitations.md", "_blank", "noopener,noreferrer");
  };

  return (
    <div className={`h-full w-full flex flex-col ${className}`}>
      {/* Management Link Banner */}
      {showManagementLink && (
        <div className={`bg-shadow border-b border-border px-4 ${compact ? 'py-1.5' : 'py-3'} flex items-center justify-between flex-shrink-0 gap-3`}>
          <div className="flex items-center gap-2 text-sm text-text-secondary flex-1 min-w-0">
            <Info className="w-4 h-4 text-ember-glow flex-shrink-0" />
            <span className={compact ? "text-xs" : ""}>
              {compact 
                ? "For directory uploads and settings, open in a new tab"
                : "Some features (directory uploads, settings) require opening OpenWebUI in a new tab due to iframe limitations."
              }
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={openDocs}
              className={`flex items-center gap-1.5 px-2 ${compact ? 'py-1' : 'py-1.5'} rounded-lg bg-deep hover:bg-deep/80 border border-border text-text-secondary hover:text-text-primary ${compact ? 'text-xs' : 'text-sm'} font-medium transition-colors`}
              title="Read about OpenWebUI limitations"
            >
              <BookOpen className="w-3.5 h-3.5" />
              {!compact && "Docs"}
            </button>
            <button
              onClick={openManagement}
              className={`flex items-center gap-2 px-3 ${compact ? 'py-1' : 'py-1.5'} rounded-lg bg-ember/20 hover:bg-ember/30 border border-ember/30 text-ember-glow ${compact ? 'text-xs' : 'text-sm'} font-medium transition-colors`}
            >
              <Settings className="w-4 h-4" />
              {compact ? "Open" : "Open in New Tab"}
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Chat iframe with embedded layout (hides sidebar) */}
      <div className="flex-1 min-h-0">
        <iframe
          src="http://localhost:8080/?layout=embedded&model=magicborn-content-assistant"
          className="w-full h-full border-0"
          title="Magicborn Assistant Chat"
          allow="clipboard-read; clipboard-write; fullscreen"
          loading="lazy"
        />
      </div>
    </div>
  );
}


