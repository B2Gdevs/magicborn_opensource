// lib/payload/hooks/useMagicbornMode.ts
// Hook to check if Magicborn Mode is enabled for a project

"use client";

import { useState, useEffect } from "react";

export function useMagicbornMode(projectId: string): { isMagicbornMode: boolean; loading: boolean } {
  const [isMagicbornMode, setIsMagicbornMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjectSettings() {
      if (!projectId || projectId === 'default') {
        setLoading(false);
        return;
      }

      try {
        // Fetch project from Payload API
        const response = await fetch(`/api/payload/projects/${projectId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch project: ${response.statusText}`);
        }
        
        const result = await response.json();
        const project = result.doc || result;
        setIsMagicbornMode(project?.magicbornMode || false);
      } catch (error) {
        console.error("Failed to fetch project settings:", error);
        setIsMagicbornMode(false);
      } finally {
        setLoading(false);
      }
    }

    fetchProjectSettings();
  }, [projectId]);

  return { isMagicbornMode, loading };
}

