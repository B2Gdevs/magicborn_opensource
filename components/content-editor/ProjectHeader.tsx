// components/content-editor/ProjectHeader.tsx
// Project logo, title, and Live button component

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { useActiveProject } from "@lib/hooks/useActiveProject";
import { toast } from "@/lib/hooks/useToast";

interface ProjectHeaderProps {
  projectId: string;
}

export function ProjectHeader({ projectId }: ProjectHeaderProps) {
  const [currentProject, setCurrentProject] = useState<{ name?: string; displayTitle?: string; logo?: any } | null>(null);
  const [showActiveConfirm, setShowActiveConfirm] = useState(false);
  const [settingActive, setSettingActive] = useState(false);
  const activeProject = useActiveProject();
  
  const isActive = activeProject && String(activeProject.id) === String(projectId);

  // Load current project info
  useEffect(() => {
    fetch(`/api/payload/projects/${projectId}`)
      .then((res) => res.json())
      .then((project) => {
        setCurrentProject({
          name: project.name,
          displayTitle: project.displayTitle,
          logo: project.logo,
        });
      })
      .catch((error) => {
        console.error("Failed to load project:", error);
      });
  }, [projectId]);

  const handleSetActive = async () => {
    setSettingActive(true);
    try {
      // Get current SiteConfig
      const siteConfigRes = await fetch("/api/payload/globals/site-config");
      const siteConfig = await siteConfigRes.json();
      
      // Convert projectId to number for Payload relationship field
      const projectIdNum = typeof projectId === 'string' ? parseInt(projectId, 10) : projectId;
      
      // Update activeProject - Payload expects a number for relationship fields
      const response = await fetch("/api/payload/globals/site-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...siteConfig,
          activeProject: projectIdNum,
        }),
      });

      if (response.ok) {
        toast.success("Project is now live");
        setShowActiveConfirm(false);
        // Reload to show updated active project
        window.location.reload();
      } else {
        const data = await response.json().catch(() => ({}));
        toast.error(data.error || "Failed to set active project");
      }
    } catch (error) {
      console.error("Failed to set active project:", error);
      toast.error("Failed to set active project");
    } finally {
      setSettingActive(false);
    }
  };

  const handleSetInactive = async () => {
    setSettingActive(true);
    try {
      // Get current SiteConfig
      const siteConfigRes = await fetch("/api/payload/globals/site-config");
      const siteConfig = await siteConfigRes.json();
      
      // Remove activeProject
      const response = await fetch("/api/payload/globals/site-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...siteConfig,
          activeProject: null,
        }),
      });

      if (response.ok) {
        toast.success("Project is no longer live");
        // Reload to show updated state
        window.location.reload();
      } else {
        const data = await response.json().catch(() => ({}));
        toast.error(data.error || "Failed to set inactive");
      }
    } catch (error) {
      console.error("Failed to set inactive:", error);
      toast.error("Failed to set inactive");
    } finally {
      setSettingActive(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-6 h-6 flex-shrink-0">
            {isActive && currentProject?.logo ? (
              <Image
                src={
                  typeof currentProject.logo === 'object' 
                    ? (currentProject.logo.url || (currentProject.logo.filename ? `/media/${currentProject.logo.filename}` : '/design/logos/magicborn_logo.png'))
                    : '/design/logos/magicborn_logo.png'
                }
                alt={currentProject.displayTitle || currentProject.name || "Project"}
                fill
                className="object-contain"
                sizes="24px"
              />
            ) : (
              <Image
                src="/design/logos/magicborn_logo.png"
                alt="Magicborn"
                fill
                className="object-contain"
                sizes="24px"
              />
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm text-glow group-hover:text-ember-glow transition-colors">
              {isActive && currentProject?.displayTitle 
                ? currentProject.displayTitle 
                : isActive && currentProject?.name
                ? currentProject.name
                : "Magicborn"}
            </span>
          </div>
        </Link>
        {isActive ? (
          <button
            onClick={handleSetInactive}
            disabled={settingActive}
            className="flex items-center gap-1.5 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50"
            title="This project is live on the homepage. Click to make inactive."
          >
            <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_4px_rgba(34,197,94,0.8)]" />
            <span>Live</span>
          </button>
        ) : (
          <button
            onClick={() => setShowActiveConfirm(true)}
            className="flex items-center gap-1.5 px-2 py-1 border border-border rounded text-xs text-text-muted hover:border-ember/30 hover:text-ember-glow transition-colors"
            title="Make this project live on the homepage"
          >
            <span>Make Live</span>
          </button>
        )}
      </div>

      {/* Confirm Active Project Dialog */}
      {showActiveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-shadow border border-border rounded-lg shadow-2xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-bold text-glow mb-2">Make Project Live?</h3>
              <p className="text-sm text-text-secondary mb-6">
                This will set this project as the live project. The project's logo and title will be displayed in the sidebar, 
                and its homepage content will be shown on the homepage. Any previously live project will become inactive.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowActiveConfirm(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-deep transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSetActive}
                  disabled={settingActive}
                  className="flex-1 px-4 py-2 bg-ember hover:bg-ember-glow text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {settingActive ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Setting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Make Live
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

