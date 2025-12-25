// app/content-editor/layout.tsx
// Custom layout for Content Editor - no main app sidebar/topnav

import type { ReactNode } from "react";

export default function ContentEditorLayout({ children }: { children: ReactNode }) {
  // This layout replaces the default ClientLayout for content-editor routes
  // The content editor has its own navigation (Codex sidebar, project switcher, etc.)
  return (
    <div className="h-screen w-screen overflow-hidden bg-void">
      {children}
    </div>
  );
}




