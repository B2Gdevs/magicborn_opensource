// lib/hooks/useActiveProject.ts
// React hook to get the currently active project from SiteConfig

import { useState, useEffect } from "react";

interface ActiveProject {
  id: number | string;
  name?: string;
  displayTitle?: string;
  logo?: { url?: string; filename?: string } | number | null;
}

/**
 * React hook to get the currently active project from SiteConfig
 * @returns Active project info (or null if no active project)
 */
export function useActiveProject(): ActiveProject | null {
  const [activeProject, setActiveProject] = useState<ActiveProject | null>(null);

  useEffect(() => {
    fetch("/api/payload/globals/site-config")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch site config: ${res.status}`);
        }
        return res.json();
      })
      .then((siteConfig) => {
        const activeProjectId = siteConfig?.activeProject;
        if (!activeProjectId) {
          setActiveProject(null);
          return;
        }

        const projectId = typeof activeProjectId === 'object' 
          ? activeProjectId.id 
          : activeProjectId;

        if (!projectId) {
          setActiveProject(null);
          return;
        }

        // Fetch project details
        return fetch(`/api/payload/projects/${projectId}`)
          .then((res) => {
            if (!res.ok) {
              throw new Error(`Failed to fetch project: ${res.status}`);
            }
            return res.json();
          })
          .then((project) => {
            setActiveProject({
              id: project.id,
              name: project.name,
              displayTitle: project.displayTitle,
              logo: project.logo,
            });
          });
      })
      .catch((error) => {
        console.error("Error fetching active project:", error);
        setActiveProject(null);
      });
  }, []);

  return activeProject;
}

