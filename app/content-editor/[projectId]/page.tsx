// app/content-editor/[projectId]/page.tsx
// Content Editor page with project context
// Uses the main app layout (SidebarNav + TopNav are in layout.tsx)

"use client";

import { useParams } from "next/navigation";
import { ContentEditor } from "@components/content-editor/ContentEditor";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

function ContentEditorContent() {
  const params = useParams();
  const projectId = params.projectId as string;

  // Handle "default" projectId by showing loading state
  if (projectId === "default") {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-2 text-text-muted">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading project...</span>
        </div>
      </div>
    );
  }

  return <ContentEditor projectId={projectId} />;
}

export default function ContentEditorPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-2 text-text-muted">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    }>
      <ContentEditorContent />
    </Suspense>
  );
}

