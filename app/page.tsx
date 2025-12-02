"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 text-slate-100">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Magicborn
          </h1>
          <p className="text-2xl text-slate-300 mb-4">
            A deterministic, progression-heavy spell crafting game
          </p>
          <p className="text-xl text-slate-400 mb-12">
            <strong className="text-emerald-300">No character levels.</strong> All power comes from crafting spells, 
            building affinity, mastering runes, and evolving your magic.
          </p>

          <div className="flex gap-4 justify-center mb-16">
            <Link
              href="/players"
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg font-semibold text-lg hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg hover:shadow-emerald-500/50"
            >
              Start Playing
            </Link>
            <Link
              href="/crafting"
              className="px-8 py-4 bg-slate-800 border border-slate-700 rounded-lg font-semibold text-lg hover:bg-slate-700 transition-all"
            >
              Craft Spells
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <div className="card bg-slate-900/50 border-slate-800">
            <div className="text-4xl mb-4">🧙</div>
            <h3 className="text-xl font-semibold mb-2">Spell Crafting</h3>
            <p className="text-slate-400">
              Build spells from 26 runes (A-Z). Infuse runes with mana for enhanced effects. 
              Real-time preview of stats and costs.
            </p>
          </div>

          <div className="card bg-slate-900/50 border-slate-800">
            <div className="text-4xl mb-4">⚔️</div>
            <h3 className="text-xl font-semibold mb-2">Deterministic Combat</h3>
            <p className="text-slate-400">
              Pure systems-driven gameplay. Damage calculated from runes, affinity, and growth. 
              No RNG—your choices matter.
            </p>
          </div>

          <div className="card bg-slate-900/50 border-slate-800">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-semibold mb-2">Dual Progression</h3>
            <p className="text-slate-400">
              <strong>Element Affinity:</strong> Master elements through casting.<br/>
              <strong>Rune Familiarity:</strong> Unlock evolution paths by mastering runes.
            </p>
          </div>

          <div className="card bg-slate-900/50 border-slate-800">
            <div className="text-4xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold mb-2">Spell Evolution</h3>
            <p className="text-slate-400">
              Evolve nameless spells into named blueprints. Unlock higher-tier spells 
              through familiarity and achievements.
            </p>
          </div>

          <div className="card bg-slate-900/50 border-slate-800">
            <div className="text-4xl mb-4">🏰</div>
            <h3 className="text-xl font-semibold mb-2">Raids</h3>
            <p className="text-slate-400">
              Scripted encounters that test your crafted spells. Earn achievements and flags 
              that unlock new evolution paths.
            </p>
          </div>

          <div className="card bg-slate-900/50 border-slate-800">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Systems-Driven</h3>
            <p className="text-slate-400">
              Every mechanic is deterministic and transparent. Your skill and strategic choices 
              determine your power, not luck.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">30</div>
              <div className="text-slate-400">Tests Passing</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">9</div>
              <div className="text-slate-400">Test Files</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-400 mb-2">4</div>
              <div className="text-slate-400">Named Spells</div>
            </div>
          </div>
        </div>

        {/* Core Systems */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Core Systems</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card bg-slate-900/50">
              <h3 className="font-semibold mb-2">CombatStatsService</h3>
              <p className="text-sm text-slate-400">Derives combat stats from runes, affinity, and growth</p>
            </div>
            <div className="card bg-slate-900/50">
              <h3 className="font-semibold mb-2">EncounterService</h3>
              <p className="text-sm text-slate-400">Resolves spell hits with affinity-based resistance</p>
            </div>
            <div className="card bg-slate-900/50">
              <h3 className="font-semibold mb-2">AffinityService</h3>
              <p className="text-sm text-slate-400">Tracks elemental XP and computes affinity (0-1)</p>
            </div>
            <div className="card bg-slate-900/50">
              <h3 className="font-semibold mb-2">RuneFamiliarityService</h3>
              <p className="text-sm text-slate-400">Tracks rune usage and familiarity scores</p>
            </div>
            <div className="card bg-slate-900/50">
              <h3 className="font-semibold mb-2">EvolutionService</h3>
              <p className="text-sm text-slate-400">Matches spells to blueprints and handles evolution</p>
            </div>
            <div className="card bg-slate-900/50">
              <h3 className="font-semibold mb-2">SpellRuntime</h3>
              <p className="text-sm text-slate-400">Clean API facade for game/UI integration</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-2xl mx-auto text-center">
          <div className="card bg-gradient-to-r from-slate-900/80 to-slate-800/80 border-slate-700">
            <h2 className="text-2xl font-bold mb-4">Ready to Craft Magic?</h2>
            <p className="text-slate-300 mb-6">
              Start by creating a player, then craft your first spell from runes. 
              Master elements, build familiarity, and evolve your magic.
            </p>
            <Link
              href="/players/new"
              className="inline-block px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg font-semibold hover:from-emerald-400 hover:to-teal-500 transition-all"
            >
              Create Your First Player
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-4xl mx-auto mt-16 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
          <p>Magicborn v0.1.0 • Core systems stable • Evolution working • Ready for content expansion</p>
          <p className="mt-2">
            <a href="https://github.com/B2Gdevs/magicborn_opensource" className="text-emerald-400 hover:text-emerald-300">
              View on GitHub
            </a>
            {" • "}
            <Link href="/players" className="text-emerald-400 hover:text-emerald-300">
              Start Playing
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
