// lib/content-editor/codex/hooks/useCodexEntityTypes.ts

"use client";

import { useQuery } from "@tanstack/react-query";
import { listEntityTypes } from "../api/entityTypeApi";

export function useCodexEntityTypes(projectId: string) {
  return useQuery({
    queryKey: ["codexEntityTypes", projectId],
    queryFn: async () => {
      const docs = await listEntityTypes(projectId);
      // Client-side filter to exclude trashed docs (supports older data lacking _status)
      return docs.filter((d: any) => d?._status !== "trashed");
    },
  });
}


