"use client";

import Image from "next/image";
import Link from "next/link";

// Concept art images for stories
const conceptArt = [
  {
    id: "branching_stories",
    src: "/images/branching_stories.webp",
    title: "Branching Stories",
    description: "The tales of Magicborn unfold through multiple paths, each choice shaping the narrative of oppression and survival.",
  },
  {
    id: "game_spells",
    src: "/images/game_spells.webp",
    title: "Spell Crafting",
    description: "In the shadowy depths, spellcrafters forge their power from runes. Each combination tells a story of mastery and desperation.",
  },
  {
    id: "game_scenes",
    src: "/images/game_scenes.webp",
    title: "The World of Magicborn",
    description: "A godforsaken land where magicborn serve as military slaves, their power both gift and curse in a world that fears them.",
  },
  {
    id: "game_quests",
    src: "/images/game_quests.webp",
    title: "Survival & Progression",
    description: "No character levels—only your understanding of runes, your affinity with elements, and your will to survive.",
  },
  {
    id: "game_items",
    src: "/images/game_items.webp",
    title: "Tools of Survival",
    description: "Every item, every weapon, every artifact tells a story of the oppressed finding their way in a world that seeks to control them.",
  },
  {
    id: "game_shops",
    src: "/images/game_shops.webp",
    title: "The Forge & Market",
    description: "Even in oppression, commerce flows. The forge where spells are crafted, the markets where survival is traded.",
  },
  {
    id: "accessing_town",
    src: "/images/accessing_town.webp",
    title: "Accessing Town",
    description: "The settlements where magicborn are allowed to exist—barely. Second-class citizens in their own world, yet finding ways to thrive.",
  },
];

// Stories coming soon
const stories = [
  {
    id: "coming-soon",
    title: "Tales from the Shadow",
    excerpt: "Stories from the Magicborn universe are coming soon. Each tale will reveal more about Modred's Legacy and the shadowy world where spellcrafters forge their destiny.",
    date: "Coming Soon",
  },
];

export default function StoriesPage() {
  return (
    <main className="ml-64 mt-16 min-h-screen bg-black text-white">
      <div className="container mx-auto px-12 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white">Tales from the Shadow</h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed font-serif">
            Stories from the Magicborn: Modred's Legacy universe. Each tale reveals more about the shadowy world 
            where magic flows like blood and spellcrafters forge their destiny through runes, affinity, and evolution.
          </p>
        </div>

        {/* Concept Art Gallery */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-ember-glow">The World of Magicborn</h2>
          <p className="text-text-secondary mb-12 max-w-2xl font-serif leading-relaxed">
            Explore the concept art that brings the world of Magicborn to life. Each image tells a story 
            of oppression, survival, and the power that comes from mastering the runes.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {conceptArt.map((art) => (
              <div key={art.id} className="card hover:border-ember/50 transition-all group cursor-pointer">
                <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={art.src}
                    alt={art.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <h3 className="text-lg font-bold text-white mb-1">{art.title}</h3>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-ember-glow">{art.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed font-serif">
                  {art.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Stories Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-ember-glow">Stories</h2>
          <p className="text-text-secondary mb-12 max-w-2xl font-serif leading-relaxed">
            Short stories set in the Magicborn universe. Each tale explores the themes of oppression, 
            survival, and the power that comes from understanding the runes.
          </p>

          <div className="space-y-6">
            {stories.map((story) => (
              <article key={story.id} className="card-glow">
                <h2 className="text-2xl font-semibold mb-3 text-ember-glow">{story.title}</h2>
                <p className="text-text-secondary mb-4 leading-relaxed font-serif">{story.excerpt}</p>
                <div className="text-sm text-text-muted">{story.date}</div>
              </article>
            ))}
          </div>
        </section>

        {/* Join Community CTA */}
        <section className="mb-20 text-center">
          <div className="card-glow max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-ember-glow">Share Your Stories</h2>
            <p className="text-text-secondary mb-6 font-serif leading-relaxed">
              Join our Discord community to discuss the lore, share theories, and connect with other 
              spellcrafters exploring the world of Magicborn.
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
