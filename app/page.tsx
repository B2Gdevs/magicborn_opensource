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
            <h2 className="text-4xl md:text-6xl font-bold mb-8 text-ember-glow drop-shadow-lg animate-fade-in-delay">
              Modred's Legacy
            </h2>
            <p className="text-xl md:text-2xl text-text-secondary mb-6 font-light max-w-3xl mx-auto drop-shadow-lg animate-fade-in-delay-2">
              In the shadowy depths where magic flows like blood, spellcrafters forge their destiny
            </p>
          </div>
        </div>
      </HeroVideo>

      {/* Modred's Legacy Story Section */}
      <section className="relative z-10 bg-void py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="card-glow mb-12">
              <h2 className="text-5xl font-bold mb-6 text-glow">Modred's Legacy</h2>
              <p className="text-xl text-text-secondary mb-4 leading-relaxed">
                Long ago, Modred the Shadow-Weaver discovered that true power lies not in levels or titles, 
                but in the mastery of runes themselves. In the dark corners where magic bleeds into reality, 
                his legacy lives on through those who dare to craft spells from the raw alphabet of power.
              </p>
              <p className="text-lg text-text-muted leading-relaxed">
                This is not a game of grinding levels. This is a game of understanding the shadowy depths 
                where runes become reality, where affinity shapes destiny, and where evolution unlocks 
                forms of magic that would make Modred himself tremble.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative h-96">
                <Image
                  src="/images/branching_stories.webp"
                  alt="Stories from Modred's Legacy"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="card">
                <h3 className="text-3xl font-bold mb-4 text-ember-glow">Tales from the Shadow</h3>
                <p className="text-lg text-text-secondary mb-6 leading-relaxed">
                  Explore the rich lore of Magicborn through stories set in Modred's Legacy. 
                  Each tale reveals more about the shadowy world where magic flows like blood and 
                  spellcrafters forge their destiny through runes, affinity, and evolution.
                </p>
                <Link
                  href="/stories"
                  className="btn-secondary inline-block hover-lift"
                >
                  Read the Stories →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Game Features with Images - Neobrutal Style */}
      <section className="relative z-10 bg-shadow/50 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-6xl font-bold text-center mb-20 text-glow">The Legacy Lives On</h2>
            
            {/* Feature 1: Spell Crafting */}
            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
              <div className="relative h-[500px] order-2 md:order-1">
                <Image
                  src="/images/game_spells.webp"
                  alt="Spell crafting in Magicborn"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 border-2 border-ember shadow-neobrutal"></div>
              </div>
              <div className="order-1 md:order-2">
                <div className="text-6xl mb-6">🧙</div>
                <h3 className="text-4xl font-bold mb-6 text-ember-glow">Spell Crafting</h3>
                <p className="text-lg text-text-secondary leading-relaxed mb-6">
                  Build spells from 26 runes (A-Z). Each rune contributes damage, effects, and traits. 
                  Infuse runes with extra mana for enhanced effects. Real-time preview of spell stats 
                  and costs in the shadowy forge.
                </p>
                <ul className="space-y-3 text-text-secondary text-lg">
                  <li className="flex items-start gap-3">
                    <span className="text-ember-glow font-bold">•</span>
                    <span>26 unique runes with distinct properties</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-ember-glow font-bold">•</span>
                    <span>Mana infusion system for power scaling</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-ember-glow font-bold">•</span>
                    <span>Real-time spell evaluation and preview</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 2: Deterministic Combat */}
            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
              <div>
                <div className="text-6xl mb-6">⚔️</div>
                <h3 className="text-4xl font-bold mb-6 text-ember-glow">Deterministic Combat</h3>
                <p className="text-lg text-text-secondary leading-relaxed mb-6">
                  Pure systems-driven gameplay. Damage calculated from runes, affinity, and growth. 
                  No RNG—your choices and mastery determine your power. Elemental affinity provides 
                  both offensive scaling and defensive resistance.
                </p>
                <ul className="space-y-3 text-text-secondary text-lg">
                  <li className="flex items-start gap-3">
                    <span className="text-ember-glow font-bold">•</span>
                    <span>Transparent damage calculations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-ember-glow font-bold">•</span>
                    <span>Affinity-based offensive and defensive scaling</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-ember-glow font-bold">•</span>
                    <span>Status effects with stacking mechanics</span>
                  </li>
                </ul>
              </div>
              <div className="relative h-[500px]">
                <Image
                  src="/images/game_scenes.webp"
                  alt="Combat scenes in Magicborn"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 border-2 border-earth shadow-neobrutal"></div>
              </div>
            </div>

            {/* Feature 3: Progression System */}
            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
              <div className="relative h-[500px] order-2 md:order-1">
                <Image
                  src="/images/game_quests.webp"
                  alt="Quests and progression in Magicborn"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 border-2 border-shadow-purple shadow-neobrutal"></div>
              </div>
              <div className="order-1 md:order-2">
                <div className="text-6xl mb-6">📈</div>
                <h3 className="text-4xl font-bold mb-6 text-earth-glow">Dual Progression</h3>
                <p className="text-lg text-text-secondary leading-relaxed mb-6">
                  <strong className="text-ember-glow">Element Affinity:</strong> Master elements through casting. 
                  Your spells grow stronger as you specialize.<br/><br/>
                  <strong className="text-earth-glow">Rune Familiarity:</strong> Unlock evolution paths by mastering runes. 
                  Named spells grow familiarity faster, opening advanced forms.
                </p>
                <ul className="space-y-3 text-text-secondary text-lg">
                  <li className="flex items-start gap-3">
                    <span className="text-earth-glow font-bold">•</span>
                    <span>No character levels—all power from progression</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-earth-glow font-bold">•</span>
                    <span>Visible affinity growth through casting</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-earth-glow font-bold">•</span>
                    <span>Familiarity gates evolution paths</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 4: Spell Evolution */}
            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
              <div>
                <div className="text-6xl mb-6">🌱</div>
                <h3 className="text-4xl font-bold mb-6 text-shadow-purple-glow">Spell Evolution</h3>
                <p className="text-lg text-text-secondary leading-relaxed mb-6">
                  Evolve nameless spells into named blueprints. Unlock higher-tier spells through 
                  familiarity and achievements in Modred's legacy. Each evolution preserves your 
                  spell's identity while unlocking new power.
                </p>
                <ul className="space-y-3 text-text-secondary text-lg">
                  <li className="flex items-start gap-3">
                    <span className="text-shadow-purple-glow font-bold">•</span>
                    <span>Nameless → Named evolution</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-shadow-purple-glow font-bold">•</span>
                    <span>Named → Higher-tier evolution chains</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-shadow-purple-glow font-bold">•</span>
                    <span>Familiarity and achievement gating</span>
                  </li>
                </ul>
              </div>
              <div className="relative h-[500px]">
                <Image
                  src="/images/game_items.webp"
                  alt="Spell evolution and items in Magicborn"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 border-2 border-bone shadow-neobrutal"></div>
              </div>
            </div>

            {/* Feature 5: Raids & Encounters */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative h-[500px] order-2 md:order-1">
                <Image
                  src="/images/game_shops.webp"
                  alt="Shops and encounters in Magicborn"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 border-2 border-ember shadow-neobrutal"></div>
              </div>
              <div className="order-1 md:order-2">
                <div className="text-6xl mb-6">🏰</div>
                <h3 className="text-4xl font-bold mb-6 text-shadow-purple-glow">Raids & Encounters</h3>
                <p className="text-lg text-text-secondary leading-relaxed mb-6">
                  Scripted encounters that test your crafted spells. Earn achievements and flags 
                  that unlock new evolution paths in the shadowy depths. Each raid tells a story 
                  and rewards mastery.
                </p>
                <ul className="space-y-3 text-text-secondary text-lg">
                  <li className="flex items-start gap-3">
                    <span className="text-shadow-purple-glow font-bold">•</span>
                    <span>Scripted encounter sequences</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-shadow-purple-glow font-bold">•</span>
                    <span>Achievement and flag rewards</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-shadow-purple-glow font-bold">•</span>
                    <span>Story-driven content</span>
                  </li>
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
            <div className="card-glow">
              <h2 className="text-5xl font-bold mb-6 text-glow">Enter the Shadowy Depths</h2>
              <p className="text-xl text-text-secondary mb-8 leading-relaxed">
                In the world where Modred's legacy lives on, spellcrafters forge their destiny. 
                Master the runes, build your affinity, and evolve your magic through the ages.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/stories"
                  className="btn text-lg px-10 py-4 hover-lift"
                >
                  Explore the Stories
                </Link>
                <Link
                  href="/style-guide"
                  className="btn-secondary text-lg px-10 py-4 hover-lift"
                >
                  View Style Guide
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-abyss border-t-2 border-border py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto text-center">
            <div className="text-text-muted space-y-2 mb-6">
              <p className="text-lg font-bold">Magicborn: Modred's Legacy</p>
              <p className="text-sm">A deterministic spell crafting game</p>
            </div>
            <div className="flex gap-6 justify-center text-sm flex-wrap">
              <Link href="/stories" className="text-ember-glow hover:text-ember transition-colors font-bold">
                Stories
              </Link>
              <Link href="/style-guide" className="text-earth-glow hover:text-earth transition-colors font-bold">
                Style Guide
              </Link>
              <Link href="/development" className="text-shadow-purple-glow hover:text-shadow-purple transition-colors font-bold">
                Development
              </Link>
              <a 
                href="https://github.com/B2Gdevs/magicborn_opensource" 
                className="text-ember-glow hover:text-ember transition-colors font-bold"
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
