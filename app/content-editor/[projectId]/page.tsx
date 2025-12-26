// app/content-editor/[projectId]/page.tsx
// Content Editor page with project context
// Uses the main app layout (SidebarNav + TopNav are in layout.tsx)

"use client";

import { useParams } from "next/navigation";
import { ContentEditor } from "@components/content-editor/ContentEditor";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

function ContentEditorContent() {
  const params = useParams();
  const projectId = params.projectId as string;

  // Handle "default" projectId by showing loading state
  if (projectId === "default") {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b border-border bg-shadow p-4">
          <Skeleton variant="text" className="w-48 h-6" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton variant="text" className="w-32 h-8 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-4 bg-shadow border border-border rounded-lg">
                <div className="flex items-start gap-3">
                  <Skeleton variant="rectangular" className="w-9 h-9 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="text" className="w-3/4" />
                    <Skeleton variant="text" className="w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <ContentEditor projectId={projectId} />;
}

export default function ContentEditorPage() {
  return (
    <Suspense fallback={
      <div className="h-full flex flex-col">
        <div className="border-b border-border bg-shadow p-4">
          <Skeleton variant="text" className="w-48 h-6" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton variant="text" className="w-32 h-8 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-4 bg-shadow border border-border rounded-lg">
                <div className="flex items-start gap-3">
                  <Skeleton variant="rectangular" className="w-9 h-9 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="text" className="w-3/4" />
                    <Skeleton variant="text" className="w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <ContentEditorContent />
    </Suspense>
  );
}

