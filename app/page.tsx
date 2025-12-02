"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import HeroVideo from "@components/HeroVideo";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"story" | "features">("story");

  return (
    <main className="min-h-screen bg-void text-text-primary relative">
      {/* Hero Section with Video Background */}
      <HeroVideo loopVideos={true}>
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-7xl md:text-8xl font-bold mb-4 text-glow drop-shadow-2xl animate-fade-in">
              Magicborn
            </h1>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-ember-glow drop-shadow-lg animate-fade-in-delay">
              <em>Modred's Legacy</em>
            </h2>
            <p className="text-lg md:text-xl text-text-secondary mb-4 font-light max-w-2xl mx-auto drop-shadow-lg animate-fade-in-delay-2">
              In the shadowy depths where magic flows like blood, spellcrafters forge their destiny
            </p>
          </div>
        </div>
      </HeroVideo>

      {/* Main Content with Tabs */}
      <section className="relative z-10 bg-void py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab("story")}
                className={activeTab === "story" ? "tab-active" : "tab"}
              >
                Modred's Legacy
              </button>
              <button
                onClick={() => setActiveTab("features")}
                className={activeTab === "features" ? "tab-active" : "tab"}
              >
                Game Features
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === "story" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-4 text-glow">Modred's Legacy</h2>
                    <p className="text-base text-text-secondary mb-4 leading-relaxed">
                      Long ago, <strong>Modred the Shadow-Weaver</strong> discovered that true power lies not in levels or titles, 
                      but in the mastery of runes themselves. In the dark corners where magic bleeds into reality, 
                      his legacy lives on through those who dare to craft spells from the raw alphabet of power.
                    </p>
                    <p className="text-base text-text-muted leading-relaxed mb-6">
                      This is <em>not</em> a game of grinding levels. This is a game of understanding the shadowy depths 
                      where runes become reality, where affinity shapes destiny, and where evolution unlocks 
                      forms of magic that would make Modred himself tremble.
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6 items-center">
                    <div className="relative h-64 rounded-lg overflow-hidden">
                      <Image
                        src="/images/branching_stories.webp"
                        alt="Stories from Modred's Legacy"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-3 text-ember-glow">Tales from the Shadow</h3>
                      <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                        Explore the rich lore of Magicborn through stories set in <strong>Modred's Legacy</strong>. 
                        Each tale reveals more about the shadowy world where magic flows like blood.
                      </p>
                      <Link
                        href="/stories"
                        className="btn-secondary inline-block text-sm"
                      >
                        Read Stories →
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "features" && (
                <div className="space-y-8">
                  {/* Feature 1: Spell Crafting */}
                  <div className="grid md:grid-cols-2 gap-6 items-center">
                    <div className="relative h-48 rounded-lg overflow-hidden order-2 md:order-1">
                      <Image
                        src="/images/game_spells.webp"
                        alt="Spell crafting"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="order-1 md:order-2">
                      <div className="text-3xl mb-2">🧙</div>
                      <h3 className="text-xl font-bold mb-2 text-ember-glow">Spell Crafting</h3>
                      <p className="text-sm text-text-secondary mb-3 leading-relaxed">
                        Build spells from <strong>26 runes (A-Z)</strong>. Each rune contributes damage, effects, and traits. 
                        Infuse runes with extra mana for enhanced effects.
                      </p>
                      <ul className="space-y-1 text-xs text-text-secondary">
                        <li>• <strong>26 unique runes</strong> with distinct properties</li>
                        <li>• <em>Mana infusion</em> system for power scaling</li>
                        <li>• Real-time spell evaluation</li>
                      </ul>
                    </div>
                  </div>

                  {/* Feature 2: Deterministic Combat */}
                  <div className="grid md:grid-cols-2 gap-6 items-center">
                    <div>
                      <div className="text-3xl mb-2">⚔️</div>
                      <h3 className="text-xl font-bold mb-2 text-ember-glow">Deterministic Combat</h3>
                      <p className="text-sm text-text-secondary mb-3 leading-relaxed">
                        Pure systems-driven gameplay. <strong>No RNG</strong>—your choices and mastery determine your power. 
                        Elemental affinity provides both offensive scaling and defensive resistance.
                      </p>
                      <ul className="space-y-1 text-xs text-text-secondary">
                        <li>• <em>Transparent</em> damage calculations</li>
                        <li>• Affinity-based scaling</li>
                        <li>• Status effects with stacking</li>
                      </ul>
                    </div>
                    <div className="relative h-48 rounded-lg overflow-hidden">
                      <Image
                        src="/images/game_scenes.webp"
                        alt="Combat scenes"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Feature 3: Progression */}
                  <div className="grid md:grid-cols-2 gap-6 items-center">
                    <div className="relative h-48 rounded-lg overflow-hidden order-2 md:order-1">
                      <Image
                        src="/images/game_quests.webp"
                        alt="Progression system"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="order-1 md:order-2">
                      <div className="text-3xl mb-2">📈</div>
                      <h3 className="text-xl font-bold mb-2 text-earth-glow">Dual Progression</h3>
                      <p className="text-sm text-text-secondary mb-3 leading-relaxed">
                        <strong>Element Affinity:</strong> Master elements through casting.<br/>
                        <strong>Rune Familiarity:</strong> Unlock evolution paths by mastering runes.
                      </p>
                      <ul className="space-y-1 text-xs text-text-secondary">
                        <li>• <em>No character levels</em>—all power from progression</li>
                        <li>• Visible affinity growth</li>
                        <li>• Familiarity gates evolution</li>
                      </ul>
                    </div>
                  </div>

                  {/* Feature 4: Evolution */}
                  <div className="grid md:grid-cols-2 gap-6 items-center">
                    <div>
                      <div className="text-3xl mb-2">🌱</div>
                      <h3 className="text-xl font-bold mb-2 text-shadow-purple-glow">Spell Evolution</h3>
                      <p className="text-sm text-text-secondary mb-3 leading-relaxed">
                        Evolve nameless spells into named blueprints. Unlock higher-tier spells through 
                        familiarity and achievements in <strong>Modred's legacy</strong>.
                      </p>
                      <ul className="space-y-1 text-xs text-text-secondary">
                        <li>• Nameless → Named evolution</li>
                        <li>• <em>Named → Higher-tier</em> chains</li>
                        <li>• Familiarity and achievement gating</li>
                      </ul>
                    </div>
                    <div className="relative h-48 rounded-lg overflow-hidden">
                      <Image
                        src="/images/game_items.webp"
                        alt="Spell evolution"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Feature 5: Raids */}
                  <div className="grid md:grid-cols-2 gap-6 items-center">
                    <div className="relative h-48 rounded-lg overflow-hidden order-2 md:order-1">
                      <Image
                        src="/images/game_shops.webp"
                        alt="Raids and encounters"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="order-1 md:order-2">
                      <div className="text-3xl mb-2">🏰</div>
                      <h3 className="text-xl font-bold mb-2 text-shadow-purple-glow">Raids & Encounters</h3>
                      <p className="text-sm text-text-secondary mb-3 leading-relaxed">
                        Scripted encounters that test your crafted spells. Earn achievements and flags 
                        that unlock new evolution paths in the <em>shadowy depths</em>.
                      </p>
                      <ul className="space-y-1 text-xs text-text-secondary">
                        <li>• Scripted encounter sequences</li>
                        <li>• <strong>Achievement</strong> and flag rewards</li>
                        <li>• Story-driven content</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 bg-shadow/30 py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="card">
              <h2 className="text-2xl font-bold mb-4 text-glow">Enter the Shadowy Depths</h2>
              <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                In the world where <strong>Modred's legacy</strong> lives on, spellcrafters forge their destiny. 
                Master the runes, build your affinity, and evolve your magic through the ages.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/stories"
                  className="btn text-sm px-6 py-2"
                >
                  Explore Stories
                </Link>
                <Link
                  href="/style-guide"
                  className="btn-secondary text-sm px-6 py-2"
                >
                  Style Guide
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-abyss border-t-2 border-border py-8">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto text-center">
            <div className="text-text-muted space-y-1 mb-4">
              <p className="text-sm font-bold">Magicborn: <em>Modred's Legacy</em></p>
              <p className="text-xs">A deterministic spell crafting game</p>
            </div>
            <div className="flex gap-4 justify-center text-xs flex-wrap">
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
