// components/content-editor/ProjectSwitcher.tsx
// Project switcher component

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Folder, Plus, Loader2, Check, Search } from "lucide-react";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { HoverActions } from "@/components/ui/HoverActions";

interface Project {
  id: string;
  name: string;
  description?: string;
  magicbornMode?: boolean;
}

interface ProjectSwitcherProps {
  projectId: string;
}

export function ProjectSwitcher({ projectId }: ProjectSwitcherProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      
      try {
        const response = await fetch("/api/payload/projects?limit=50");
        
        if (response.ok) {
          const result = await response.json();
          const projectList = result.docs || [];
          setProjects(projectList);
          
          // Find current project
          const current = projectList.find((p: Project) => String(p.id) === String(projectId));
          setCurrentProject(current || { id: projectId, name: `Project ${projectId}` });
        } else {
          setCurrentProject({ id: projectId, name: `Project ${projectId}` });
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        setCurrentProject({ id: projectId, name: `Project ${projectId}` });
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [projectId]);

  const handleProjectChange = (newProjectId: string) => {
    router.push(`/content-editor/${newProjectId}`);
    setIsOpen(false);
  };

  // Filter projects based on search query (name or ID)
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) {
      return projects;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return projects.filter((project) => {
      const nameMatch = project.name.toLowerCase().includes(query);
      const idMatch = String(project.id).includes(query);
      return nameMatch || idMatch;
    });
  }, [projects, searchQuery]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-primary hover:text-ember-glow transition-colors"
      >
        <Folder className="w-4 h-4 text-ember-glow" />
        <span className="font-medium text-text-primary">
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </span>
          ) : (
            currentProject?.name || `Project ${projectId}`
          )}
        </span>
        <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 w-72 bg-shadow border border-border rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
            <div className="p-2">
              {/* Projects Header with Hover Icon */}
              <HoverActions
                actions={[
                  {
                    icon: <Plus className="w-3.5 h-3.5" />,
                    onClick: () => {
                      setIsOpen(false);
                      setShowCreateDialog(true);
                    },
                    title: "Create New Project",
                  },
                ]}
                className="px-2 py-1 mb-2"
                actionsPosition="right"
                gap={4}
              >
                <div className="text-xs text-text-muted uppercase tracking-wider">
                  Projects
                </div>
              </HoverActions>

              {/* Search Input */}
              <div className="relative mb-2">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 text-sm bg-deep border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-ember/50"
                />
              </div>
              
              {/* Projects List */}
              {loading ? (
                <div className="flex items-center gap-2 px-2 py-3 text-text-muted">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading projects...
                </div>
              ) : filteredProjects.length > 0 ? (
                <div className="space-y-0.5">
                  {filteredProjects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleProjectChange(String(project.id))}
                      className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-colors ${
                        String(project.id) === String(projectId)
                          ? "bg-ember/20 text-ember-glow"
                          : "hover:bg-deep text-text-primary"
                      }`}
                    >
                      <Folder className="w-4 h-4 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{project.name}</div>
                        {project.description && (
                          <div className="text-xs text-text-muted truncate">
                            {project.description}
                          </div>
                        )}
                      </div>
                      {String(project.id) === String(projectId) && (
                        <Check className="w-4 h-4 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-2 py-3 text-text-muted text-sm">
                  {searchQuery ? "No projects match your search" : "No projects found"}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <CreateProjectDialog 
        isOpen={showCreateDialog} 
        onClose={() => setShowCreateDialog(false)} 
      />
    </div>
  );
}

