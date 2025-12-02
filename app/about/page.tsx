"use client";

import Image from "next/image";
import { listNamedBlueprints } from "@data/namedSpells";
import { EFFECT_DEFS } from "@data/effects";
import { RUNES, listRunes } from "@pkg/runes";
import type { RuneCode } from "@core/types";

// Get all rune codes A-Z
const ALL_RUNES: RuneCode[] = Array.from({ length: 26 }, (_, i) => 
  String.fromCharCode(65 + i) as RuneCode
);

export default function AboutPage() {
  const namedSpells = listNamedBlueprints();
  const effects = Object.values(EFFECT_DEFS);
  const runeDefs = listRunes();

  return (
    <main className="ml-64 mt-16 min-h-screen bg-black text-white">
      <div className="container mx-auto px-12 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white">About Magicborn</h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed font-serif">
            A deterministic spell crafting game where power comes from mastery, not levels. 
            Craft spells from runes, build affinity, master familiarity, and evolve your magic.
          </p>
        </div>

        {/* Runes Section - Enhanced */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-4 text-ember-glow">The Rune Alphabet</h2>
          <p className="text-text-secondary mb-8 max-w-2xl font-serif leading-relaxed">
            All magic flows from the 26 runes (A-Z). Each rune contributes damage, effects, and traits. 
            Master them to unlock evolution paths and forge powerful spells. Combine runes to create unique 
            spell combinations—there are no character levels, only your understanding of the runes.
          </p>
          
          {/* Rune Grid */}
          <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-13 gap-4 mb-8">
            {ALL_RUNES.map((rune) => {
              const runeDef = RUNES[rune];
              const hasIcon = runeDef !== undefined;
              return (
                <div
                  key={rune}
                  className="card hover:border-ember/50 transition-colors text-center group cursor-pointer"
                  title={runeDef?.concept || `Rune ${rune}`}
                >
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    {hasIcon ? (
                      <Image
                        src={`/game-icons/runes/${rune}.png`}
                        alt={`Rune ${rune} - ${runeDef.concept}`}
                        fill
                        className="object-contain"
                        onError={(e) => {
                          // Fallback if image doesn't exist
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-ember-glow">
                        {rune}
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-bold text-ember-glow">{rune}</div>
                  {runeDef && (
                    <div className="text-xs text-text-muted mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {runeDef.concept}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Rune Details - Expandable */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {runeDefs.slice(0, 9).map((rune) => (
              <div key={rune.code} className="card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative w-12 h-12">
                    <Image
                      src={`/game-icons/runes/${rune.code}.png`}
                      alt={`Rune ${rune.code}`}
                      fill
                      className="object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-ember-glow">{rune.code}</h3>
                    <p className="text-sm text-text-secondary">{rune.concept}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Power:</span>
                    <span className="text-text-secondary">{rune.powerFactor.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Control:</span>
                    <span className="text-text-secondary">{rune.controlFactor.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Mana Cost:</span>
                    <span className="text-text-secondary">{rune.manaCost}</span>
                  </div>
                  {rune.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {rune.tags.map((tag) => (
                        <span key={tag} className="badge text-xs">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Named Spells Section - Enhanced */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-4 text-ember-glow">Named Spells</h2>
          <p className="text-text-secondary mb-8 max-w-2xl font-serif leading-relaxed">
            Evolve your crafted spells into legendary named blueprints. Each requires mastery of specific runes, 
            damage focus, and familiarity. These are not learned—they are <em className="text-ember-glow/80">discovered</em> through 
            your journey as a spellcrafter.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {namedSpells.map((spell) => (
              <div key={spell.id} className="card-glow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-2xl font-bold text-ember-glow">{spell.name}</h3>
                  {spell.hidden && (
                    <span className="badge-glow text-xs">Hidden</span>
                  )}
                </div>
                <p className="text-text-secondary mb-4 leading-relaxed font-serif">{spell.description}</p>
                
                <div className="space-y-3 mb-4">
                  <div>
                    <div className="text-sm font-semibold text-text-secondary mb-1">Required Runes:</div>
                    <div className="flex flex-wrap gap-2">
                      {spell.requiredRunes.map((rune) => (
                        <div key={rune} className="flex items-center gap-1">
                          <div className="relative w-6 h-6">
                            <Image
                              src={`/game-icons/runes/${rune}.png`}
                              alt={`Rune ${rune}`}
                              fill
                              className="object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                          <span className="text-sm font-bold text-ember-glow">{rune}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {spell.tags.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold text-text-secondary mb-1">Tags:</div>
                      <div className="flex flex-wrap gap-2">
                        {spell.tags.map((tag) => (
                          <span key={tag} className="badge-glow">{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {spell.minDamageFocus && (
                    <div className="text-sm text-text-muted">
                      <span className="font-semibold">Damage Focus:</span> {spell.minDamageFocus.ratio * 100}% {spell.minDamageFocus.type}
                    </div>
                  )}
                  
                  {spell.minTotalPower && (
                    <div className="text-sm text-text-muted">
                      <span className="font-semibold">Min Power:</span> {spell.minTotalPower}
                    </div>
                  )}
                </div>
                
                {spell.hint && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-sm text-text-muted italic font-serif">{spell.hint}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Effects Section - Enhanced */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-4 text-ember-glow">Spell Effects</h2>
          <p className="text-text-secondary mb-8 max-w-2xl font-serif leading-relaxed">
            Spells can apply various effects—damage over time, crowd control, buffs, and more. 
            Master the combinations to survive. Effects stack, persist, and can turn the tide of battle.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {effects.map((effect) => (
              <div key={effect.id} className={`card ${effect.isBuff ? 'border-ember/30' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-ember-glow">{effect.name}</h3>
                  {effect.isBuff ? (
                    <span className="badge-glow text-xs">Buff</span>
                  ) : (
                    <span className="badge text-xs">Debuff</span>
                  )}
                </div>
                <p className="text-sm text-text-secondary mb-3 leading-relaxed font-serif">
                  {effect.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className={`badge ${effect.isBuff ? "badge-glow" : ""}`}>
                    {effect.category}
                  </span>
                  {effect.maxStacks && (
                    <span className="badge">Max: {effect.maxStacks}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Creatures Section - Placeholder */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-4 text-ember-glow">Creatures</h2>
          <p className="text-text-secondary mb-8 max-w-2xl font-serif leading-relaxed">
            Face the horrors of this godforsaken land. Each creature requires different strategies and spell combinations. 
            Some are corrupted by void magic, others are twisted experiments. All are dangerous.
          </p>
          <div className="card">
            <p className="text-text-muted italic font-serif text-center py-8">
              Creature data coming soon. The bestiary grows as we expand the world of Magicborn.
            </p>
          </div>
        </section>

        {/* Items & Weapons Section - Placeholder */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-4 text-ember-glow">Items & Weapons</h2>
          <p className="text-text-secondary mb-8 max-w-2xl font-serif leading-relaxed">
            Tools of survival in a world where magicborn are oppressed. Every item tells a story. 
            Weapons enhance your spells, items provide utility, and artifacts unlock new possibilities.
          </p>
          <div className="card">
            <p className="text-text-muted italic font-serif text-center py-8">
              Items and weapons data coming soon. More content as development progresses.
            </p>
          </div>
        </section>

        {/* Join Community CTA */}
        <section className="mb-20 text-center">
          <div className="card-glow max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-ember-glow">Join the Community</h2>
            <p className="text-text-secondary mb-6 font-serif leading-relaxed">
              Connect with other spellcrafters, share strategies, discuss the lore, and stay updated on development. 
              Help shape the world of Magicborn.
            </p>
            <a
              href="https://discord.gg/JxXHZktcR7"
              target="_blank"
              rel="noopener noreferrer"
              className="btn inline-block"
            >
              Join Discord →
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
