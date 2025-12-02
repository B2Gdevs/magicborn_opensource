"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import HeroVideo from "@components/HeroVideo";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"story" | "features">("story");

  return (
    <main className="min-h-screen bg-void text-text-primary">
      {/* Hero Section with Video Background - Full Screen Behind Nav */}
      <div className="fixed inset-0 z-0">
        <HeroVideo loopVideos={true}>
          <div className="container mx-auto px-12 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-7xl md:text-8xl font-bold mb-4 text-white drop-shadow-2xl animate-fade-in">
                Magicborn
              </h1>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white drop-shadow-lg animate-fade-in-delay">
                <em>Modred's Legacy</em>
              </h2>
              <p className="text-lg md:text-xl text-white/80 mb-4 font-light max-w-2xl mx-auto drop-shadow-lg animate-fade-in-delay-2">
                In the shadowy depths where magic flows like blood, spellcrafters forge their destiny
              </p>
            </div>
          </div>
        </HeroVideo>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 ml-64 mt-16">
        <div className="container mx-auto px-12 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Tab Navigation */}
            <div className="flex gap-2 mb-8">
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
                <div className="space-y-8">
                  {/* Large Story Image */}
                  <div className="relative h-[600px] rounded-lg overflow-hidden mb-8">
                    <Image
                      src="/images/branching_stories.webp"
                      alt="Stories from Modred's Legacy"
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-void/90 via-void/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <h2 className="text-4xl font-bold mb-4 text-glow">Modred's Legacy</h2>
                      <p className="text-lg text-text-secondary max-w-2xl leading-relaxed">
                        Long ago, <strong>Modred the Shadow-Weaver</strong> discovered that true power lies not in levels or titles, 
                        but in the mastery of runes themselves. In the dark corners where magic bleeds into reality, 
                        his legacy lives on through those who dare to craft spells from the raw alphabet of power.
                      </p>
                    </div>
                  </div>

                  {/* Story Content */}
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="card">
                      <h3 className="text-2xl font-bold mb-4 text-ember-glow">The Shadow-Weaver</h3>
                      <p className="text-base text-text-secondary mb-4 leading-relaxed">
                        <strong>Modred</strong> was the first to understand that runes were not mere symbols, but the very 
                        alphabet of reality itself. He discovered that by combining runes in specific patterns, 
                        one could forge spells that transcended the limitations of traditional magic.
                      </p>
                      <p className="text-sm text-text-muted leading-relaxed">
                        This is <em>not</em> a game of grinding levels. This is a game of understanding the shadowy depths 
                        where runes become reality, where affinity shapes destiny, and where evolution unlocks 
                        forms of magic that would make Modred himself tremble.
                      </p>
                    </div>
                    <div className="card">
                      <h3 className="text-2xl font-bold mb-4 text-ember-glow">Tales from the Shadow</h3>
                      <p className="text-base text-text-secondary mb-6 leading-relaxed">
                        Explore the rich lore of Magicborn through stories set in <strong>Modred's Legacy</strong>. 
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
                  </div>
                </div>
              )}

              {activeTab === "features" && (
                <div className="space-y-12">
                  {/* Feature 1: Large Image */}
                  <div className="relative h-[500px] rounded-lg overflow-hidden">
                    <Image
                      src="/images/game_spells.webp"
                      alt="Spell crafting in Magicborn"
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-void/90 via-void/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="text-4xl mb-3">🧙</div>
                      <h3 className="text-3xl font-bold mb-3 text-ember-glow">Spell Crafting</h3>
                      <p className="text-lg text-text-secondary max-w-2xl leading-relaxed">
                        Build spells from <strong>26 runes (A-Z)</strong>. Each rune contributes damage, effects, and traits. 
                        Infuse runes with extra mana for enhanced effects. Real-time preview of spell stats 
                        and costs in the shadowy forge.
                      </p>
                    </div>
                  </div>

                  {/* Feature 2: Large Image */}
                  <div className="relative h-[500px] rounded-lg overflow-hidden">
                    <Image
                      src="/images/game_scenes.webp"
                      alt="Combat scenes in Magicborn"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-void/90 via-void/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="text-4xl mb-3">⚔️</div>
                      <h3 className="text-3xl font-bold mb-3 text-ember-glow">Deterministic Combat</h3>
                      <p className="text-lg text-text-secondary max-w-2xl leading-relaxed">
                        Pure systems-driven gameplay. <strong>No RNG</strong>—your choices and mastery determine your power. 
                        Elemental affinity provides both offensive scaling and defensive resistance.
                      </p>
                    </div>
                  </div>

                  {/* Feature 3: Large Image */}
                  <div className="relative h-[500px] rounded-lg overflow-hidden">
                    <Image
                      src="/images/game_quests.webp"
                      alt="Progression in Magicborn"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-void/90 via-void/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="text-4xl mb-3">📈</div>
                      <h3 className="text-3xl font-bold mb-3 text-earth-glow">Dual Progression</h3>
                      <p className="text-lg text-text-secondary max-w-2xl leading-relaxed">
                        <strong>Element Affinity:</strong> Master elements through casting.<br/>
                        <strong>Rune Familiarity:</strong> Unlock evolution paths by mastering runes.
                        <em>No character levels</em>—all power from progression.
                      </p>
                    </div>
                  </div>

                  {/* Feature 4: Large Image */}
                  <div className="relative h-[500px] rounded-lg overflow-hidden">
                    <Image
                      src="/images/game_items.webp"
                      alt="Spell evolution in Magicborn"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-void/90 via-void/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="text-4xl mb-3">🌱</div>
                      <h3 className="text-3xl font-bold mb-3 text-shadow-purple-glow">Spell Evolution</h3>
                      <p className="text-lg text-text-secondary max-w-2xl leading-relaxed">
                        Evolve nameless spells into named blueprints. Unlock higher-tier spells through 
                        familiarity and achievements in <strong>Modred's legacy</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Feature 5: Large Image */}
                  <div className="relative h-[500px] rounded-lg overflow-hidden">
                    <Image
                      src="/images/game_shops.webp"
                      alt="Raids and encounters in Magicborn"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-void/90 via-void/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="text-4xl mb-3">🏰</div>
                      <h3 className="text-3xl font-bold mb-3 text-shadow-purple-glow">Raids & Encounters</h3>
                      <p className="text-lg text-text-secondary max-w-2xl leading-relaxed">
                        Scripted encounters that test your crafted spells. Earn achievements and flags 
                        that unlock new evolution paths in the <em>shadowy depths</em>.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 ml-64 mt-16 bg-black/80 py-8">
        <div className="container mx-auto px-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-bold mb-4 text-ember-glow">Contact</h4>
                <div className="space-y-2 text-sm text-text-secondary">
                  <p>📧 contact@magicborn.game</p>
                  <p>💬 Discord Community</p>
                  <p>📍 Development Updates</p>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-bold mb-4 text-ember-glow">Stay Updated</h4>
                <p className="text-sm text-text-secondary mb-4">
                  Get the latest news about <strong>Modred's Legacy</strong> and development updates.
                </p>
                <button className="btn text-sm px-6 py-2">
                  Subscribe →
                </button>
                <p className="text-xs text-text-muted mt-4">#modredslegacy</p>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t-2 border-border text-center text-xs text-text-muted">
              <p className="font-bold">Magicborn: <em>Modred's Legacy</em></p>
              <p>A deterministic spell crafting game</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
