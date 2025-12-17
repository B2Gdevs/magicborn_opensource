// app/content-editor/[projectId]/settings/page.tsx
// Project settings page

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  description?: string;
  magicbornMode?: boolean;
  defaultView?: string;
}

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [magicbornMode, setMagicbornMode] = useState(false);
  const [defaultView, setDefaultView] = useState("grid");

  useEffect(() => {
    async function fetchProject() {
      try {
        const response = await fetch(`/api/payload/projects/${projectId}`);
        if (response.ok) {
          const data = await response.json();
          setProject(data);
          setName(data.name || "");
          setDescription(data.description || "");
          setMagicbornMode(data.magicbornMode || false);
          setDefaultView(data.defaultView || "grid");
        } else {
          setError("Failed to load project");
        }
      } catch (err) {
        setError("Failed to load project");
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [projectId]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/payload/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          magicbornMode,
          defaultView,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Failed to save settings");
      }
    } catch (err) {
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void">
      {/* Header */}
      <header className="border-b border-border bg-shadow">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href={`/content-editor/${projectId}`}
            className="flex items-center gap-2 text-text-muted hover:text-ember-glow transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Editor</span>
          </Link>
          <div className="flex-1" />
          <h1 className="text-lg font-bold text-glow">{name || "Project Settings"}</h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
            Settings saved successfully!
          </div>
        )}

        {/* Project Information */}
        <section className="mb-8 p-6 bg-shadow border border-border rounded-xl">
          <h2 className="text-xl font-bold mb-4 text-glow">Project Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-text-secondary">
                Project Name <span className="text-ember">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-deep border border-border rounded-lg text-text-primary focus:outline-none focus:border-ember-glow"
                placeholder="Enter project name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-text-secondary">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 bg-deep border border-border rounded-lg text-text-primary focus:outline-none focus:border-ember-glow resize-none"
                placeholder="Enter project description"
                rows={4}
              />
            </div>
          </div>
        </section>

        {/* Game Systems */}
        <section className="mb-8 p-6 bg-shadow border border-border rounded-xl">
          <h2 className="text-xl font-bold mb-4 text-glow">Game Systems</h2>
          <label className="flex items-start gap-4 p-4 bg-deep/50 border border-border rounded-lg cursor-pointer hover:border-ember/30 transition-colors">
            <input
              type="checkbox"
              checked={magicbornMode}
              onChange={(e) => setMagicbornMode(e.target.checked)}
              className="mt-1 w-5 h-5"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 font-semibold text-text-primary">
                <Sparkles className="w-5 h-5 text-ember-glow" />
                Enable Magicborn Game Systems
              </div>
              <p className="text-sm text-text-muted mt-1">
                When enabled, Spells, Runes, Effects, and Combat Stats become available in the Codex.
                All data is preserved when toggling this setting.
              </p>
            </div>
          </label>
        </section>

        {/* Default View */}
        <section className="mb-8 p-6 bg-shadow border border-border rounded-xl">
          <h2 className="text-xl font-bold mb-4 text-glow">Editor Preferences</h2>
          <div>
            <label className="block text-sm font-semibold mb-2 text-text-secondary">
              Default View
            </label>
            <select
              value={defaultView}
              onChange={(e) => setDefaultView(e.target.value)}
              className="w-full max-w-xs px-4 py-2 bg-deep border border-border rounded-lg text-text-primary focus:outline-none focus:border-ember-glow"
            >
              <option value="grid">Grid</option>
              <option value="matrix">Matrix</option>
              <option value="outline">Outline</option>
            </select>
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
            Delete Project
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-ember hover:bg-ember-glow text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : (
              <><Save className="w-4 h-4" /> Save Settings</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

