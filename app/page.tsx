"use client";

import Link from "next/link";
import Image from "next/image";
import HeroVideo from "@components/HeroVideo";
import { getHeroVideo } from "@lib/config/videos";

export default function LandingPage() {
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
            <h1 className="text-8xl md:text-9xl font-bold mb-6 text-glow drop-shadow-2xl animate-fade-in">
              Magicborn
            </h1>
            <h2 className="text-3xl md:text-5xl font-bold mb-8 text-ember-glow drop-shadow-lg animate-fade-in-delay">
              Modred's Legacy
            </h2>
            <p className="text-xl md:text-2xl text-text-secondary mb-6 font-light max-w-3xl mx-auto drop-shadow-lg animate-fade-in-delay-2">
              In the shadowy depths where magic flows like blood, spellcrafters forge their destiny
            </p>
          </div>
        </div>
      </HeroVideo>

      {/* Story Section */}
      <section className="relative z-10 bg-void py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
              <div className="card-glow">
                <h2 className="text-4xl font-bold mb-6 text-glow">Tales from the Shadow</h2>
                <p className="text-lg text-text-secondary mb-6 leading-relaxed">
                  Explore the rich lore of Magicborn through stories set in Modred's Legacy. 
                  Each tale reveals more about the shadowy world where magic flows like blood and 
                  spellcrafters forge their destiny through runes, affinity, and evolution.
                </p>
                <Link
                  href="/stories"
                  className="btn-secondary inline-block"
                >
                  Read the Stories →
                </Link>
              </div>
              <div className="relative h-96 rounded-lg overflow-hidden">
                <Image
                  src="/images/branching_stories.webp"
                  alt="Branching stories from Magicborn universe"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Game Features with Images */}
      <section className="relative z-10 bg-shadow/30 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl font-bold text-center mb-16 text-glow">Game Features</h2>
            
            {/* Feature 1: Spell Crafting */}
            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
              <div className="relative h-96 rounded-lg overflow-hidden order-2 md:order-1">
                <Image
                  src="/images/game_spells.webp"
                  alt="Spell crafting in Magicborn"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="order-1 md:order-2">
                <div className="text-5xl mb-4">🧙</div>
                <h3 className="text-3xl font-semibold mb-4 text-ember-glow">Spell Crafting</h3>
                <p className="text-lg text-text-secondary leading-relaxed mb-6">
                  Build spells from 26 runes (A-Z). Each rune contributes damage, effects, and traits. 
                  Infuse runes with extra mana for enhanced effects. Real-time preview of spell stats 
                  and costs in the shadowy forge.
                </p>
                <ul className="space-y-2 text-text-secondary">
                  <li>• 26 unique runes with distinct properties</li>
                  <li>• Mana infusion system for power scaling</li>
                  <li>• Real-time spell evaluation and preview</li>
                </ul>
              </div>
            </div>

            {/* Feature 2: Deterministic Combat */}
            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
              <div>
                <div className="text-5xl mb-4">⚔️</div>
                <h3 className="text-3xl font-semibold mb-4 text-ember-glow">Deterministic Combat</h3>
                <p className="text-lg text-text-secondary leading-relaxed mb-6">
                  Pure systems-driven gameplay. Damage calculated from runes, affinity, and growth. 
                  No RNG—your choices and mastery determine your power. Elemental affinity provides 
                  both offensive scaling and defensive resistance.
                </p>
                <ul className="space-y-2 text-text-secondary">
                  <li>• Transparent damage calculations</li>
                  <li>• Affinity-based offensive and defensive scaling</li>
                  <li>• Status effects with stacking mechanics</li>
                </ul>
              </div>
              <div className="relative h-96 rounded-lg overflow-hidden">
                <Image
                  src="/images/game_scenes.webp"
                  alt="Combat scenes in Magicborn"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Feature 3: Progression System */}
            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
              <div className="relative h-96 rounded-lg overflow-hidden order-2 md:order-1">
                <Image
                  src="/images/game_quests.webp"
                  alt="Quests and progression in Magicborn"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="order-1 md:order-2">
                <div className="text-5xl mb-4">📈</div>
                <h3 className="text-3xl font-semibold mb-4 text-moss-glow">Dual Progression</h3>
                <p className="text-lg text-text-secondary leading-relaxed mb-6">
                  <strong className="text-ember-glow">Element Affinity:</strong> Master elements through casting. 
                  Your spells grow stronger as you specialize.<br/><br/>
                  <strong className="text-moss-glow">Rune Familiarity:</strong> Unlock evolution paths by mastering runes. 
                  Named spells grow familiarity faster, opening advanced forms.
                </p>
                <ul className="space-y-2 text-text-secondary">
                  <li>• No character levels—all power from progression</li>
                  <li>• Visible affinity growth through casting</li>
                  <li>• Familiarity gates evolution paths</li>
                </ul>
              </div>
            </div>

            {/* Feature 4: Spell Evolution */}
            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
              <div>
                <div className="text-5xl mb-4">🌱</div>
                <h3 className="text-3xl font-semibold mb-4 text-shadow-purple-glow">Spell Evolution</h3>
                <p className="text-lg text-text-secondary leading-relaxed mb-6">
                  Evolve nameless spells into named blueprints. Unlock higher-tier spells through 
                  familiarity and achievements in Modred's legacy. Each evolution preserves your 
                  spell's identity while unlocking new power.
                </p>
                <ul className="space-y-2 text-text-secondary">
                  <li>• Nameless → Named evolution</li>
                  <li>• Named → Higher-tier evolution chains</li>
                  <li>• Familiarity and achievement gating</li>
                </ul>
              </div>
              <div className="relative h-96 rounded-lg overflow-hidden">
                <Image
                  src="/images/game_items.webp"
                  alt="Spell evolution and items in Magicborn"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Feature 5: Raids & Encounters */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative h-96 rounded-lg overflow-hidden order-2 md:order-1">
                <Image
                  src="/images/game_shops.webp"
                  alt="Shops and encounters in Magicborn"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="order-1 md:order-2">
                <div className="text-5xl mb-4">🏰</div>
                <h3 className="text-3xl font-semibold mb-4 text-shadow-purple-glow">Raids & Encounters</h3>
                <p className="text-lg text-text-secondary leading-relaxed mb-6">
                  Scripted encounters that test your crafted spells. Earn achievements and flags 
                  that unlock new evolution paths in the shadowy depths. Each raid tells a story 
                  and rewards mastery.
                </p>
                <ul className="space-y-2 text-text-secondary">
                  <li>• Scripted encounter sequences</li>
                  <li>• Achievement and flag rewards</li>
                  <li>• Story-driven content</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 bg-void py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="card-glow bg-gradient-to-br from-shadow/90 to-deep/90">
              <h2 className="text-4xl font-bold mb-6 text-glow">Enter the Shadowy Depths</h2>
              <p className="text-xl text-text-secondary mb-8 leading-relaxed">
                In the world where Modred's legacy lives on, spellcrafters forge their destiny. 
                Master the runes, build your affinity, and evolve your magic through the ages.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/stories"
                  className="btn text-lg px-10 py-4"
                >
                  Explore the Stories
                </Link>
                <Link
                  href="/style-guide"
                  className="btn-secondary text-lg px-10 py-4"
                >
                  View Style Guide
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-abyss border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto text-center">
            <div className="text-text-muted space-y-2 mb-6">
              <p className="text-lg">Magicborn: Modred's Legacy</p>
              <p className="text-sm">A deterministic spell crafting game</p>
            </div>
            <div className="flex gap-6 justify-center text-sm flex-wrap">
              <Link href="/stories" className="text-ember-glow hover:text-ember transition-colors">
                Stories
              </Link>
              <Link href="/style-guide" className="text-moss-glow hover:text-moss transition-colors">
                Style Guide
              </Link>
              <Link href="/development" className="text-shadow-purple-glow hover:text-shadow-purple transition-colors">
                Development
              </Link>
              <a 
                href="https://github.com/B2Gdevs/magicborn_opensource" 
                className="text-ember-glow hover:text-ember transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
