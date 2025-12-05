"use client";

import { useState } from "react";
import Link from "next/link";
import FileManager from "@components/FileManager";
import SpellEditor from "@components/SpellEditor";
import EffectEditor from "@components/EffectEditor";
import RuneEditor from "@components/RuneEditor";
import ResourcePlaceholder from "@components/ResourcePlaceholder";

type ResourceTab = "files" | "spells" | "effects" | "runes" | "characters" | "creatures" | "environments" | "status";

export default function DevelopmentPage() {
  const [activeTab, setActiveTab] = useState<ResourceTab>("files");

  return (
    <main className="ml-64 mt-16 h-[calc(100vh-4rem)] bg-void text-text-primary overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-shadow px-8 py-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-glow">Development</h1>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab("files")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                activeTab === "files"
                  ? "bg-ember text-white border-2 border-ember-glow"
                  : "bg-deep text-text-secondary hover:text-ember-glow border-2 border-border"
              }`}
            >
              📁 Files
            </button>
            <button
              onClick={() => setActiveTab("spells")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                activeTab === "spells"
                  ? "bg-ember text-white border-2 border-ember-glow"
                  : "bg-deep text-text-secondary hover:text-ember-glow border-2 border-border"
              }`}
            >
              ✨ Spells
            </button>
            <button
              onClick={() => setActiveTab("effects")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                activeTab === "effects"
                  ? "bg-ember text-white border-2 border-ember-glow"
                  : "bg-deep text-text-secondary hover:text-ember-glow border-2 border-border"
              }`}
            >
              ⚡ Effects
            </button>
            <button
              onClick={() => setActiveTab("runes")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                activeTab === "runes"
                  ? "bg-ember text-white border-2 border-ember-glow"
                  : "bg-deep text-text-secondary hover:text-ember-glow border-2 border-border"
              }`}
            >
              🔮 Runes
            </button>
            <button
              onClick={() => setActiveTab("characters")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                activeTab === "characters"
                  ? "bg-ember text-white border-2 border-ember-glow"
                  : "bg-deep text-text-secondary hover:text-ember-glow border-2 border-border"
              }`}
            >
              👤 Characters
            </button>
            <button
              onClick={() => setActiveTab("creatures")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                activeTab === "creatures"
                  ? "bg-ember text-white border-2 border-ember-glow"
                  : "bg-deep text-text-secondary hover:text-ember-glow border-2 border-border"
              }`}
            >
              🐉 Creatures
            </button>
            <button
              onClick={() => setActiveTab("environments")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                activeTab === "environments"
                  ? "bg-ember text-white border-2 border-ember-glow"
                  : "bg-deep text-text-secondary hover:text-ember-glow border-2 border-border"
              }`}
            >
              🌍 Environments
            </button>
            <button
              onClick={() => setActiveTab("status")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                activeTab === "status"
                  ? "bg-ember text-white border-2 border-ember-glow"
                  : "bg-deep text-text-secondary hover:text-ember-glow border-2 border-border"
              }`}
            >
              📊 Status
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden min-h-0">
          {activeTab === "files" ? (
            <FileManager />
          ) : activeTab === "spells" ? (
            <SpellEditor />
          ) : activeTab === "effects" ? (
            <EffectEditor />
          ) : activeTab === "runes" ? (
            <RuneEditor />
          ) : activeTab === "characters" ? (
            <ResourcePlaceholder
              title="Character Manager"
              description="Create and manage character data, stats, and abilities"
              icon="👤"
            />
          ) : activeTab === "creatures" ? (
            <ResourcePlaceholder
              title="Creature Manager"
              description="Design creatures, enemies, and their combat behaviors"
              icon="🐉"
            />
          ) : activeTab === "environments" ? (
            <ResourcePlaceholder
              title="Environment Manager"
              description="Define locations, scenes, and environmental data"
              icon="🌍"
            />
          ) : (
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
                      <Link href="/CHANGELOG.md" className="text-ember-glow hover:text-ember transition-colors">
                        Changelog
                      </Link>
                      <Link href="/DESIGN.md" className="text-moss-glow hover:text-moss transition-colors">
                        Design Document
                      </Link>
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
          )}
        </div>
      </div>
    </main>
  );
}
