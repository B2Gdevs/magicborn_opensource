// lib/content-editor/useEntryDisplayName.ts
// React hook for getting entry type display names with DB override support

import { useState, useEffect } from "react";
import { EntryType } from "./constants";
import { getDisplayName } from "./entry-config";
import type { EntryTypeConfigs } from "./entry-type-config-types";

/**
 * React hook to get display name for an entry type, with automatic fetching of project configs
 * @param entryType - The entry type to get display name for
 * @param projectId - Optional project ID to fetch configs from
 * @returns The display name (from DB override if available, otherwise from code)
 */
export function useEntryDisplayName(
  entryType: EntryType,
  projectId?: string
): string {
  const [projectConfigs, setProjectConfigs] = useState<EntryTypeConfigs | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId) {
      setProjectConfigs(null);
      return;
    }

    setLoading(true);
    fetch(`/api/payload/projects/${projectId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch project: ${res.status}`);
        }
        return res.json();
      })
      .then((project) => {
        // Validate and set entryTypeConfigs
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
      })
      .finally(() => {
        setLoading(false);
      });
  }, [projectId]);

  // Return display name, checking DB override first, then code default
  return getDisplayName(entryType, projectConfigs);
}


