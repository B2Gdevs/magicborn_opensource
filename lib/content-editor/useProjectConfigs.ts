// lib/content-editor/useProjectConfigs.ts
// React hook for fetching project-level entry type configs

import { useState, useEffect } from "react";
import type { EntryTypeConfigs } from "./entry-type-config-types";

/**
 * React hook to fetch project-level entry type configuration overrides
 * @param projectId - Project ID to fetch configs from
 * @returns Project configs (or null if not available/loading)
 */
export function useProjectConfigs(projectId?: string): EntryTypeConfigs | null {
  const [projectConfigs, setProjectConfigs] = useState<EntryTypeConfigs | null>(null);

  useEffect(() => {
    if (!projectId) {
      setProjectConfigs(null);
      return;
    }

    fetch(`/api/payload/projects/${projectId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch project: ${res.status}`);
        }
        return res.json();
      })
      .then((project) => {
        const configs = project?.entryTypeConfigs;
        if (configs && typeof configs === "object") {
          setProjectConfigs(configs as EntryTypeConfigs);
        } else {
          setProjectConfigs(null);
        }
      })
      .catch((error) => {
        console.error("Error fetching project configs:", error);
        setProjectConfigs(null);
      });
  }, [projectId]);

  return projectConfigs;
}


