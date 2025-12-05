// components/MagicbornContentEditor.tsx
// Higher Order Component for content editors in the development page

"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import FileManager from "@components/FileManager";
import SpellEditor from "@components/SpellEditor";
import EffectEditor from "@components/EffectEditor";
import RuneEditor from "@components/RuneEditor";
import ResourcePlaceholder from "@components/ResourcePlaceholder";
import { TabButton } from "@components/ui/TabButton";
import DocumentationDrawer, { type WorkbenchTab } from "@components/DocumentationDrawer";

export type EditorType =
  | "files"
  | "spells"
  | "effects"
  | "runes"
  | "characters"
  | "creatures"
  | "environments"
  | "status";

export interface EditorTab {
  id: EditorType;
  label: string;
  icon: string;
  component: ReactNode;
}

export interface MagicbornContentEditorProps {
  activeTab: EditorType;
  onTabChange: (tab: EditorType) => void;
  tabs?: EditorTab[];
}

const defaultTabs: EditorTab[] = [
  {
    id: "files",
    label: "Files",
    icon: "📁",
    component: <FileManager />,
  },
  {
    id: "spells",
    label: "Spells",
    icon: "✨",
    component: <SpellEditor />,
  },
  {
    id: "effects",
    label: "Effects",
    icon: "⚡",
    component: <EffectEditor />,
  },
  {
    id: "runes",
    label: "Runes",
    icon: "🔮",
    component: <RuneEditor />,
  },
  {
    id: "characters",
    label: "Characters",
    icon: "👤",
    component: (
      <ResourcePlaceholder
        title="Character Manager"
        description="Create and manage character data, stats, and abilities"
        icon="👤"
      />
    ),
  },
  {
    id: "creatures",
    label: "Creatures",
    icon: "🐉",
    component: (
      <ResourcePlaceholder
        title="Creature Manager"
        description="Design creatures, enemies, and their combat behaviors"
        icon="🐉"
      />
    ),
  },
  {
    id: "environments",
    label: "Environments",
    icon: "🌍",
    component: (
      <ResourcePlaceholder
        title="Environment Manager"
        description="Define locations, scenes, and environmental data"
        icon="🌍"
      />
    ),
  },
  {
    id: "status",
    label: "Status",
    icon: "📊",
    component: null, // Handled separately in render
  },
];

export function MagicbornContentEditor({
  activeTab,
  onTabChange,
  tabs = defaultTabs,
}: MagicbornContentEditorProps) {
  const [isDocDrawerOpen, setIsDocDrawerOpen] = useState(false);
  const [activeWorkbenchTab, setActiveWorkbenchTab] = useState<WorkbenchTab>("documentation");
  const activeEditor = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-shadow px-8 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-glow">Content Editor</h1>
          <button
            onClick={() => setIsDocDrawerOpen(true)}
            className="px-4 py-2 rounded-lg font-semibold text-sm bg-deep text-text-secondary hover:text-ember-glow border-2 border-border hover:border-ember/50 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Workbench
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              icon={tab.icon}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </TabButton>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden min-h-0">
        {activeTab === "status" ? (
          <StatusContent />
        ) : (
          activeEditor
        )}
      </div>

      {/* Documentation Drawer */}
      <DocumentationDrawer
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

