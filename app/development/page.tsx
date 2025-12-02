"use client";

import Link from "next/link";

export default function DevelopmentPage() {
  return (
    <main className="min-h-screen bg-void text-text-primary">
      <div className="container mx-auto px-6 py-12 max-w-6xl">
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
    </main>
  );
}

