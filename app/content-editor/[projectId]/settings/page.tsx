// app/content-editor/[projectId]/settings/page.tsx
// Project settings page

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Sparkles, Trash2, Settings, Gamepad2, Cpu, AlertTriangle, TestTube } from "lucide-react";
import Link from "next/link";
import AIStackStatus from "@/components/ai-stack/AIStackStatus";
import LMStudioAPIDocs from "@/components/ai-stack/LMStudioAPIDocs";
import { ExternalLink } from "lucide-react";
import { TestRunner } from "@/components/developer/TestRunner";

interface Project {
  id: string;
  name: string;
  description?: string;
  magicbornMode?: boolean;
  defaultView?: string;
}

type SettingsSection = "general" | "game-systems" | "ai-stack" | "developer" | "danger";

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState<SettingsSection>("general");

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

  const navigationItems = [
    { id: "general" as SettingsSection, label: "General", icon: Settings },
    { id: "game-systems" as SettingsSection, label: "Game Systems", icon: Gamepad2 },
    { id: "ai-stack" as SettingsSection, label: "AI Stack", icon: Cpu },
    { id: "developer" as SettingsSection, label: "Developer Tests", icon: TestTube },
    { id: "danger" as SettingsSection, label: "Danger Zone", icon: AlertTriangle },
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case "general":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-1 text-text-primary">Project Information</h3>
              <div className="h-px bg-border mb-6" />
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-text-secondary">
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
                  <label className="block text-sm font-medium mb-2 text-text-secondary">
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
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-1 text-text-primary">Editor Preferences</h3>
              <div className="h-px bg-border mb-6" />
              <div>
                <label className="block text-sm font-medium mb-2 text-text-secondary">
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
            </div>
          </div>
        );

      case "game-systems":
        return (
          <div>
            <h3 className="text-lg font-semibold mb-1 text-text-primary">Magicborn Game Systems</h3>
            <div className="h-px bg-border mb-6" />
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
          </div>
        );

      case "ai-stack":
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-1 text-text-primary">AI Stack Services</h3>
              <div className="h-px bg-border mb-6" />
              <div className="overflow-y-auto">
                <AIStackStatus />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1 text-text-primary">LM Studio</h3>
              <div className="h-px bg-border mb-6" />
              <div className="space-y-4">
                <div className="p-4 bg-deep/50 border border-border rounded-lg">
                  <p className="text-sm text-text-secondary mb-4">
                    LM Studio runs locally on your machine, not in Docker. Download and install it to use local language models.
                  </p>
                  <a
                    href="https://lmstudio.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-ember hover:bg-ember-glow text-white rounded-lg font-medium transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Download LM Studio
                  </a>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-text-primary">API Documentation</h4>
                  <p className="text-xs text-text-muted mb-4">
                    Once LM Studio is running locally on port 1234, you can use these API endpoints:
                  </p>
                  <LMStudioAPIDocs />
                </div>
              </div>
            </div>
          </div>
        );

      case "developer":
        return (
          <div>
            <h3 className="text-lg font-semibold mb-1 text-text-primary">Test Runner</h3>
            <div className="h-px bg-border mb-6" />
            <TestRunner />
          </div>
        );

      case "danger":
        return (
          <div>
            <h3 className="text-lg font-semibold mb-1 text-text-primary">Delete Project</h3>
            <div className="h-px bg-border mb-6" />
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-text-secondary mb-4">
                Once you delete a project, there is no going back. Please be certain.
              </p>
              <button className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
                Delete Project
              </button>
            </div>
          </div>
        );

      default:
        return null;
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
        <div className="px-6 py-4 flex items-center gap-4">
          <Link
            href={`/content-editor/${projectId}`}
            className="flex items-center gap-2 text-text-muted hover:text-ember-glow transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Editor</span>
          </Link>
          <div className="flex-1" />
          <h1 className="text-lg font-bold text-glow">Settings</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r border-border bg-shadow">
          <nav className="p-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-deep text-ember-glow"
                      : "text-text-muted hover:text-text-primary hover:bg-deep/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8">
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

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-glow mb-2">
                {navigationItems.find((item) => item.id === activeSection)?.label}
              </h2>
              <div className="h-px bg-border" />
            </div>

            <div className="space-y-8">
              {renderSectionContent()}
            </div>

            {/* Save Button - Only show on sections that need saving */}
            {(activeSection === "general" || activeSection === "game-systems") && (
              <div className="mt-8 pt-6 border-t border-border">
                <button
                  onClick={handleSave}
                  disabled={saving || !name.trim()}
                  className="flex items-center gap-2 px-6 py-2 bg-ember hover:bg-ember-glow text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}


