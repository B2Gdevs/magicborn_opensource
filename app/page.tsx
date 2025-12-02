"use client";

import Link from "next/link";
import HeroVideo from "@components/HeroVideo";
import { getHeroVideo } from "@lib/config/videos";

export default function LandingPage() {
  // Get the default hero video
  const heroVideo = getHeroVideo("new_tarro_teaser") || {
    id: "new_tarro_teaser",
    src: "/videos/new_tarro_teaser.mp4",
    title: "Magicborn: Modred's Legacy",
    description: "A deterministic spell crafting game",
    thumbnail: "/images/new_tarro.webp",
  };

  return (
    <main className="min-h-screen bg-void text-text-primary relative">
      {/* Hero Section with Video Background */}
      <HeroVideo video={heroVideo}>
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-5xl mx-auto">
            {/* Main Title with Glow Effect */}
            <h1 className="text-8xl md:text-9xl font-bold mb-6 text-glow drop-shadow-2xl animate-fade-in">
              Magicborn
            </h1>
            <h2 className="text-3xl md:text-5xl font-bold mb-8 text-ember-glow drop-shadow-lg animate-fade-in-delay">
              Modred's Legacy
            </h2>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-text-secondary mb-6 font-light max-w-3xl mx-auto drop-shadow-lg animate-fade-in-delay-2">
              A deterministic, progression-heavy spell crafting game
            </p>
            <p className="text-lg md:text-xl text-text-muted mb-12 max-w-2xl mx-auto drop-shadow animate-fade-in-delay-3">
              In the shadowy depths where magic flows like blood, there are <strong className="text-ember-glow">no character levels</strong>. 
              Power comes from crafting spells, building affinity, mastering runes, and evolving your magic.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-4">
              <Link
                href="/players"
                className="btn text-lg px-10 py-4 shadow-ember-glow"
              >
                Begin Your Journey
              </Link>
              <Link
                href="/crafting"
                className="btn-secondary text-lg px-10 py-4"
              >
                Craft Spells
              </Link>
            </div>
          </div>
        </div>
      </HeroVideo>

      {/* Content Section */}
      <div className="relative z-10 bg-void">
        {/* Features Grid */}
        <section className="container mx-auto px-6 py-20" itemScope itemType="https://schema.org/VideoGame">
          <meta itemProp="name" content="Magicborn: Modred's Legacy" />
          <meta itemProp="description" content="A deterministic, progression-heavy spell crafting game with no character levels. All power comes from crafting spells, building affinity, and evolving magic." />
          <meta itemProp="genre" content="Spell Crafting, RPG, Strategy" />
          
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            <article className="card-glow group hover:scale-105 transition-transform duration-300" itemScope itemType="https://schema.org/GameFeature">
              <div className="text-5xl mb-4">🧙</div>
              <h3 className="text-xl font-semibold mb-3 text-ember-glow" itemProp="name">Spell Crafting</h3>
              <p className="text-text-secondary leading-relaxed" itemProp="description">
                Build spells from 26 runes (A-Z). Infuse runes with mana for enhanced effects. 
                Real-time preview of stats and costs in the shadowy forge.
              </p>
            </article>

            <article className="card-glow group hover:scale-105 transition-transform duration-300" itemScope itemType="https://schema.org/GameFeature">
              <div className="text-5xl mb-4">⚔️</div>
              <h3 className="text-xl font-semibold mb-3 text-ember-glow" itemProp="name">Deterministic Combat</h3>
              <p className="text-text-secondary leading-relaxed" itemProp="description">
                Pure systems-driven gameplay. Damage calculated from runes, affinity, and growth. 
                No RNG—your choices and mastery determine your power.
              </p>
            </article>

            <article className="card-glow group hover:scale-105 transition-transform duration-300" itemScope itemType="https://schema.org/GameFeature">
              <div className="text-5xl mb-4">📈</div>
              <h3 className="text-xl font-semibold mb-3 text-moss-glow" itemProp="name">Dual Progression</h3>
              <p className="text-text-secondary leading-relaxed" itemProp="description">
                <strong className="text-ember-glow">Element Affinity:</strong> Master elements through casting.<br/>
                <strong className="text-moss-glow">Rune Familiarity:</strong> Unlock evolution paths by mastering runes.
              </p>
            </article>

            <article className="card-glow group hover:scale-105 transition-transform duration-300" itemScope itemType="https://schema.org/GameFeature">
              <div className="text-5xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold mb-3 text-shadow-purple-glow" itemProp="name">Spell Evolution</h3>
              <p className="text-text-secondary leading-relaxed" itemProp="description">
                Evolve nameless spells into named blueprints. Unlock higher-tier spells 
                through familiarity and achievements in Modred's legacy.
              </p>
            </article>

            <article className="card-glow group hover:scale-105 transition-transform duration-300" itemScope itemType="https://schema.org/GameFeature">
              <div className="text-5xl mb-4">🏰</div>
              <h3 className="text-xl font-semibold mb-3 text-shadow-purple-glow" itemProp="name">Raids & Encounters</h3>
              <p className="text-text-secondary leading-relaxed" itemProp="description">
                Scripted encounters that test your crafted spells. Earn achievements and flags 
                that unlock new evolution paths in the shadowy depths.
              </p>
            </article>

            <article className="card-glow group hover:scale-105 transition-transform duration-300" itemScope itemType="https://schema.org/GameFeature">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-3 text-ember-glow" itemProp="name">Systems-Driven</h3>
              <p className="text-text-secondary leading-relaxed" itemProp="description">
                Every mechanic is deterministic and transparent. Your skill and strategic choices 
                determine your power in this organic, shadowy world.
              </p>
            </article>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="card bg-shadow/60 backdrop-blur-md">
              <div className="grid grid-cols-3 gap-8">
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
          </div>
        </section>

        {/* Stories Section */}
        <section className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="card-glow">
              <h2 className="text-3xl font-bold mb-4 text-glow">Tales from the Shadow</h2>
              <p className="text-text-secondary mb-6 leading-relaxed">
                Explore the rich lore of Magicborn through short stories set in Modred's Legacy. 
                Each tale reveals more about the shadowy world where magic flows like blood and 
                spellcrafters forge their destiny.
              </p>
              <Link
                href="/stories"
                className="btn-secondary inline-block"
              >
                Read the Stories →
              </Link>
            </div>
          </div>
        </section>

        {/* Core Systems */}
        <section className="container mx-auto px-6 py-12">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12 text-glow">Core Systems</h2>
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
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <div className="card-glow bg-gradient-to-br from-shadow/90 to-deep/90">
              <h2 className="text-3xl font-bold mb-4 text-glow">Ready to Forge Your Legacy?</h2>
              <p className="text-text-secondary mb-8 text-lg leading-relaxed">
                In the shadowy depths where Modred's legacy lives on, spellcrafters forge their destiny. 
                Start by creating a player, then craft your first spell from runes. Master elements, 
                build familiarity, and evolve your magic through the ages.
              </p>
              <Link
                href="/players/new"
                className="btn text-lg px-12 py-4 inline-block"
              >
                Begin Your Journey
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-12 border-t border-border">
          <div className="max-w-5xl mx-auto text-center">
            <div className="text-text-muted space-y-2 mb-6">
              <p className="text-lg">Magicborn: Modred's Legacy v0.1.0</p>
              <p className="text-sm">Core systems stable • Evolution working • Ready for content expansion</p>
            </div>
            <div className="flex gap-6 justify-center text-sm flex-wrap">
              <a href="https://github.com/B2Gdevs/magicborn_opensource" className="text-ember-glow hover:text-ember transition-colors">
                View on GitHub
              </a>
              <Link href="/style-guide" className="text-moss-glow hover:text-moss transition-colors">
                Style Guide
              </Link>
              <Link href="/stories" className="text-shadow-purple-glow hover:text-shadow-purple transition-colors">
                Stories
              </Link>
              <Link href="/players" className="text-ember-glow hover:text-ember transition-colors">
                Start Playing
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
