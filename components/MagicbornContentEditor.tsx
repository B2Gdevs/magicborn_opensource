// components/MagicbornContentEditor.tsx
// Higher Order Component for content editors in the development page

"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { 
  Folder, 
  Sparkles, 
  Zap, 
  Gem, 
  User, 
  Ghost, 
  Globe, 
  BarChart3,
  Terminal
} from "lucide-react";
import FileManager from "@components/FileManager";
import SpellEditor from "@components/SpellEditor";
import EffectEditor from "@components/EffectEditor";
import RuneEditor from "@components/RuneEditor";
import CharacterEditor from "@components/CharacterEditor";
import CreatureEditor from "@components/CreatureEditor";
import dynamic from "next/dynamic";
import ResourcePlaceholder from "@components/ResourcePlaceholder";

// Dynamically import EnvironmentEditor to avoid SSR issues
const EnvironmentEditor = dynamic(() => import("@components/environment/EnvironmentEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-deep text-text-muted">
      <p>Loading environment editor...</p>
    </div>
  ),
});
import { TabButton } from "@components/ui/TabButton";
import DeveloperWorkbench, { type WorkbenchTab } from "@components/DeveloperWorkbench";
import { Tooltip } from "@components/ui/Tooltip";

export type EditorType =
  | "files"
  | "spells"
  | "effects"
  | "runes"
  | "characters"
  | "creatures"
  | "environments"
  | "automations"
  | "status";

export interface EditorTab {
  id: EditorType;
  label: string;
  icon: ReactNode;
  component: ReactNode;
}

export interface MagicbornContentEditorProps {
  activeTab: EditorType;
  onTabChange: (tab: EditorType) => void;
  tabs?: EditorTab[];
}

// Create tabs function to avoid SSR issues with client components
function createDefaultTabs(): EditorTab[] {
  return [
    {
      id: "files",
      label: "Files",
      icon: <Folder className="w-4 h-4" />,
      component: <FileManager />,
    },
    {
      id: "spells",
      label: "Spells",
      icon: <Sparkles className="w-4 h-4" />,
      component: <SpellEditor />,
    },
    {
      id: "effects",
      label: "Effects",
      icon: <Zap className="w-4 h-4" />,
      component: <EffectEditor />,
    },
    {
      id: "runes",
      label: "Runes",
      icon: <Gem className="w-4 h-4" />,
      component: <RuneEditor />,
    },
    {
      id: "characters",
      label: "Characters",
      icon: <User className="w-4 h-4" />,
      component: <CharacterEditor />,
    },
    {
      id: "creatures",
      label: "Creatures",
      icon: <Ghost className="w-4 h-4" />,
      component: <CreatureEditor />,
    },
    {
      id: "environments",
      label: "Environments",
      icon: <Globe className="w-4 h-4" />,
      component: null, // Handled separately - dynamically imported
    },
    {
      id: "status",
      label: "Status",
      icon: <BarChart3 className="w-4 h-4" />,
      component: null, // Handled separately in render
    },
  ];
}

export function MagicbornContentEditor({
  activeTab,
  onTabChange,
  tabs,
}: MagicbornContentEditorProps) {
  // Use default tabs if not provided, but create them inside component to avoid SSR issues
  const defaultTabs = tabs || createDefaultTabs();
  const [isDocDrawerOpen, setIsDocDrawerOpen] = useState(false);
  const [activeWorkbenchTab, setActiveWorkbenchTab] = useState<WorkbenchTab>("documentation");
  const activeEditor = defaultTabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-shadow px-8 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-glow">Content Editor</h1>
          <Tooltip content="Developer Workbench">
            <button
              onClick={() => setIsDocDrawerOpen(true)}
              className="p-2 rounded text-text-muted hover:text-ember-glow hover:bg-deep transition-all"
            >
              <Terminal className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
        <div className="flex gap-1 flex-wrap">
          {defaultTabs.map((tab) => (
            <Tooltip key={tab.id} content={tab.label}>
              <TabButton
                active={activeTab === tab.id}
                icon={tab.icon}
                onClick={() => onTabChange(tab.id)}
              />
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden min-h-0">
        {activeTab === "status" ? (
          <StatusContent />
        ) : activeTab === "environments" ? (
          <EnvironmentEditor />
        ) : (
          activeEditor
        )}
      </div>

      {/* Developer Workbench */}
      <DeveloperWorkbench
        isOpen={isDocDrawerOpen}
        onClose={() => setIsDocDrawerOpen(false)}
        activeTab={activeWorkbenchTab}
        onTabChange={setActiveWorkbenchTab}
      />
    </div>
  );
}

function StatusContent() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto px-12 py-12 max-w-6xl">
        <h1 className="text-5xl font-bold mb-4 text-glow">Development Status</h1>
        <p className="text-xl text-text-secondary mb-12">
          Current development progress and technical information for Magicborn: Modred's Legacy
        </p>

        {/* Stats Section */}
        <section className="mb-16">
          <div className="card-glow">
            <h2 className="text-3xl font-bold mb-6 text-glow">Current Status</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-5xl font-bold text-ember-glow mb-2">30</div>
                <div className="text-text-secondary">Tests Passing</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-moss-glow mb-2">9</div>
                <div className="text-text-secondary">Test Files</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-shadow-purple-glow mb-2">4</div>
                <div className="text-text-secondary">Named Spells</div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Systems */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-glow">Core Systems</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="card hover:border-ember/50 transition-colors">
              <h3 className="font-semibold mb-2 text-ember-glow">CombatStatsService</h3>
              <p className="text-sm text-text-secondary">Derives combat stats from runes, affinity, and growth</p>
            </div>
            <div className="card hover:border-ember/50 transition-colors">
              <h3 className="font-semibold mb-2 text-ember-glow">EncounterService</h3>
              <p className="text-sm text-text-secondary">Resolves spell hits with affinity-based resistance</p>
            </div>
            <div className="card hover:border-moss/50 transition-colors">
              <h3 className="font-semibold mb-2 text-moss-glow">AffinityService</h3>
              <p className="text-sm text-text-secondary">Tracks elemental XP and computes affinity (0-1)</p>
            </div>
            <div className="card hover:border-moss/50 transition-colors">
              <h3 className="font-semibold mb-2 text-moss-glow">RuneFamiliarityService</h3>
              <p className="text-sm text-text-secondary">Tracks rune usage and familiarity scores</p>
            </div>
            <div className="card hover:border-shadow-purple/50 transition-colors">
              <h3 className="font-semibold mb-2 text-shadow-purple-glow">EvolutionService</h3>
              <p className="text-sm text-text-secondary">Matches spells to blueprints and handles evolution</p>
            </div>
            <div className="card hover:border-shadow-purple/50 transition-colors">
              <h3 className="font-semibold mb-2 text-shadow-purple-glow">SpellRuntime</h3>
              <p className="text-sm text-text-secondary">Clean API facade for game/UI integration</p>
            </div>
          </div>
        </section>

        {/* Development Info */}
        <section className="mb-16">
          <div className="card-glow">
            <h2 className="text-3xl font-bold mb-6 text-glow">Development Information</h2>
            <div className="space-y-4 text-text-secondary">
              <p>
                <strong className="text-ember-glow">Version:</strong> 0.1.0
              </p>
              <p>
                <strong className="text-ember-glow">Status:</strong> Core systems stable • Evolution working • Ready for content expansion
              </p>
              <p>
                <strong className="text-ember-glow">Tech Stack:</strong> Next.js 14, React 18, TypeScript, Zustand, Vitest
              </p>
              <p>
                <strong className="text-ember-glow">Architecture:</strong> Modular service-based design with clear separation of concerns
              </p>
            </div>
          </div>
        </section>

        {/* Links */}
        <section className="mb-16">
          <div className="card">
            <h2 className="text-2xl font-bold mb-4 text-glow">Resources</h2>
            <div className="flex flex-wrap gap-4">
              <a href="/CHANGELOG.md" className="text-ember-glow hover:text-ember transition-colors">
                Changelog
              </a>
              <a href="/DESIGN.md" className="text-moss-glow hover:text-moss transition-colors">
                Design Document
              </a>
              <a 
                href="https://github.com/B2Gdevs/magicborn_opensource" 
                className="text-shadow-purple-glow hover:text-shadow-purple transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub Repository
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

