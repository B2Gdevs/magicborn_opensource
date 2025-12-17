// app/content-editor/page.tsx
// Shows create project dialog if no projects, otherwise redirects to first project

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreateProjectDialog } from "@/components/content-editor/CreateProjectDialog";
import { Loader2, Book } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ContentEditorIndexPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasProjects, setHasProjects] = useState<boolean | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    async function checkProjects() {
      try {
        const response = await fetch("/api/payload/projects?limit=1");
        
        if (response.ok) {
          const result = await response.json();
          if (result.docs && result.docs.length > 0) {
            // Has projects, redirect to first one
            router.push(`/content-editor/${result.docs[0].id}`);
            return;
          }
        }
        
        // No projects found
        setHasProjects(false);
        setShowCreateDialog(true);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        setHasProjects(false);
        setShowCreateDialog(true);
      } finally {
        setLoading(false);
      }
    }

    checkProjects();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-void">
        <div className="flex items-center gap-2 text-text-muted">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // No projects - show welcome screen with create dialog
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-void">
      {/* Header with back link */}
      <div className="absolute top-4 left-4">
        <Link href="/" className="flex items-center gap-2 text-text-muted hover:text-ember-glow transition-colors">
          <div className="relative w-8 h-8">
            <Image
              src="/design/logos/magicborn_logo.png"
              alt="Magicborn"
              fill
              className="object-contain"
              sizes="32px"
            />
          </div>
          <span className="font-medium">Back to App</span>
        </Link>
      </div>

      {/* Welcome content */}
      <div className="text-center max-w-md px-4">
        <div className="w-16 h-16 mx-auto mb-6 bg-ember/20 rounded-2xl flex items-center justify-center">
          <Book className="w-8 h-8 text-ember-glow" />
        </div>
        <h1 className="text-2xl font-bold text-glow mb-3">Welcome to the Content Editor</h1>
        <p className="text-text-secondary mb-6">
          Create your first project to start writing your story, building your world, and crafting your narrative.
        </p>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="px-6 py-3 bg-ember hover:bg-ember-glow text-white rounded-lg font-medium transition-colors"
        >
          Create Your First Project
        </button>
      </div>

      <CreateProjectDialog 
        isOpen={showCreateDialog} 
        onClose={() => setShowCreateDialog(false)} 
      />
    </div>
  );
}
