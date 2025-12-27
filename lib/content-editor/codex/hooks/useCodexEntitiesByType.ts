// lib/content-editor/codex/hooks/useCodexEntitiesByType.ts

"use client";

import { useQuery } from "@tanstack/react-query";
import { listEntitiesByType } from "../api/entityTypeApi";

export function useCodexEntitiesByType(projectId: string, typeId: string, enabled = true) {
  return useQuery({
    queryKey: ["codexEntities", projectId, typeId],
    enabled: enabled && !!typeId,
    queryFn: async () => {
      const docs = await listEntitiesByType(projectId, typeId);
      return docs.filter((d: any) => d?._status !== "trashed");
    },
  });
}


