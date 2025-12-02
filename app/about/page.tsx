"use client";

import Image from "next/image";
import { listNamedBlueprints } from "@data/namedSpells";
import { EFFECT_DEFS } from "@data/effects";
import { EffectType } from "@core/enums";
import type { RuneCode } from "@core/types";

// Get all rune codes A-Z
const ALL_RUNES: RuneCode[] = Array.from({ length: 26 }, (_, i) => 
  String.fromCharCode(65 + i) as RuneCode
);

export default function AboutPage() {
  const namedSpells = listNamedBlueprints();
  const effects = Object.values(EFFECT_DEFS);

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

        {/* Runes Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-ember-glow">The Rune Alphabet</h2>
          <p className="text-text-secondary mb-8 max-w-2xl font-serif">
            All magic flows from the 26 runes (A-Z). Each rune contributes damage, effects, and traits. 
            Master them to unlock evolution paths and forge powerful spells.
          </p>
          <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-13 gap-4">
            {ALL_RUNES.map((rune) => (
              <div
                key={rune}
                className="card hover:border-ember/50 transition-colors text-center"
              >
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <Image
                    src={`/game-icons/runes/${rune}.png`}
                    alt={`Rune ${rune}`}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="text-sm font-bold text-ember-glow">{rune}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Named Spells Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-ember-glow">Named Spells</h2>
          <p className="text-text-secondary mb-8 max-w-2xl font-serif">
            Evolve your crafted spells into legendary named blueprints. Each requires mastery of specific runes and conditions.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {namedSpells.map((spell) => (
              <div key={spell.id} className="card-glow">
                <h3 className="text-2xl font-bold mb-3 text-ember-glow">{spell.name}</h3>
                <p className="text-text-secondary mb-4 leading-relaxed font-serif">{spell.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="badge">Required: {spell.requiredRunes.join(", ")}</span>
                  {spell.tags.map((tag) => (
                    <span key={tag} className="badge-glow">{tag}</span>
                  ))}
                </div>
                {spell.hint && (
                  <p className="text-sm text-text-muted italic font-serif">{spell.hint}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Effects Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-ember-glow">Spell Effects</h2>
          <p className="text-text-secondary mb-8 max-w-2xl font-serif">
            Spells can apply various effects—damage over time, crowd control, buffs, and more. 
            Master the combinations to survive.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {effects.map((effect) => (
              <div key={effect.id} className="card">
                <h3 className="text-xl font-bold mb-2 text-ember-glow">{effect.name}</h3>
                <p className="text-sm text-text-secondary mb-3 leading-relaxed font-serif">
                  {effect.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className={`badge ${effect.isBuff ? "badge-glow" : ""}`}>
                    {effect.category}
                  </span>
                  {effect.maxStacks && (
                    <span className="badge">Max Stacks: {effect.maxStacks}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Creatures Section - Placeholder */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-ember-glow">Creatures</h2>
          <p className="text-text-secondary mb-8 max-w-2xl font-serif">
            Face the horrors of this godforsaken land. Each creature requires different strategies and spell combinations.
          </p>
          <div className="card">
            <p className="text-text-muted italic font-serif">
              Creature data coming soon. Check back as we expand the bestiary.
            </p>
          </div>
        </section>

        {/* Items & Weapons Section - Placeholder */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-ember-glow">Items & Weapons</h2>
          <p className="text-text-secondary mb-8 max-w-2xl font-serif">
            Tools of survival in a world where magicborn are oppressed. Every item tells a story.
          </p>
          <div className="card">
            <p className="text-text-muted italic font-serif">
              Items and weapons data coming soon. More content as development progresses.
            </p>
          </div>
        </section>

        {/* Join Community CTA */}
        <section className="mb-20 text-center">
          <div className="card-glow max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-ember-glow">Join the Community</h2>
            <p className="text-text-secondary mb-6 font-serif">
              Connect with other spellcrafters, share strategies, and stay updated on development.
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

