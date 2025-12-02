"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getAllBooks, getBookById, type BookId } from "@lib/data/stories";

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

export default function StoriesPage() {
  const [selectedBook, setSelectedBook] = useState<BookId | null>(null);
  const books = getAllBooks();
  const selectedBookData = selectedBook ? getBookById(selectedBook) : null;

  return (
    <main className="ml-64 mt-16 min-h-screen bg-black text-white">
      <div className="container mx-auto px-12 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white">Tales from the Shadow</h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed font-serif">
            Stories from the Magicborn universe. Explore the prequel, <em className="text-ember-glow/80">The Tale of Modred</em>, 
            and the ongoing stories of <strong className="text-ember-glow">Modred's Legacy</strong>—the timeline where the game takes place.
          </p>
        </div>

        {/* Books Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-ember-glow">The Books</h2>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {books.map((book) => (
              <div
                key={book.id}
                className={`card-glow cursor-pointer transition-all hover:border-ember ${
                  selectedBook === book.id ? "border-ember border-2" : ""
                }`}
                onClick={() => setSelectedBook(selectedBook === book.id ? null : book.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-2 text-ember-glow">{book.title}</h3>
                    {book.isPrequel && (
                      <span className="badge-glow text-xs">Prequel</span>
                    )}
                  </div>
                </div>
                <p className="text-text-secondary mb-4 leading-relaxed font-serif">
                  {book.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-muted">
                    {book.stories.length} {book.stories.length === 1 ? "story" : "stories"}
                  </span>
                  <span className="text-sm text-ember-glow">
                    {selectedBook === book.id ? "▼" : "▶"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Special handling for Tale of Modred - it's a multi-page book */}
          {selectedBookData && selectedBookData.id === "tale_of_modred" && (
            <div className="mt-8">
              <div className="card-glow mb-6">
                <h3 className="text-2xl font-bold mb-4 text-ember-glow">
                  {selectedBookData.title}
                </h3>
                <p className="text-text-secondary mb-6 leading-relaxed font-serif">
                  {selectedBookData.description}
                </p>
                <Link
                  href="/books/tale-of-modred?page=1"
                  className="btn inline-block"
                >
                  Start Reading →
                </Link>
              </div>
              
              {/* Individual stories from this book (if any) */}
              {selectedBookData.stories.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xl font-bold mb-4 text-ember-glow">Related Stories</h4>
                  {selectedBookData.stories.map((story) => (
                    <Link
                      key={story.id}
                      href={`/stories/${story.id}`}
                      className="card hover:border-ember/50 transition-all block"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-xl font-bold mb-2 text-ember-glow">{story.title}</h4>
                          <p className="text-text-secondary mb-3 leading-relaxed font-serif">
                            {story.excerpt}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-text-muted">
                            {story.readingTime && (
                              <span>⏱ {story.readingTime} min read</span>
                            )}
                            {story.date && <span>{story.date}</span>}
                          </div>
                        </div>
                        <span className="text-ember-glow ml-4">→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Selected Book Stories (for other books) */}
          {selectedBookData && selectedBookData.id !== "tale_of_modred" && selectedBookData.stories.length > 0 && (
            <div className="mt-8 space-y-4">
              <h3 className="text-2xl font-bold mb-4 text-ember-glow">
                Stories from {selectedBookData.title}
              </h3>
              {selectedBookData.stories.map((story) => (
                <Link
                  key={story.id}
                  href={`/stories/${story.id}`}
                  className="card hover:border-ember/50 transition-all block"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-xl font-bold mb-2 text-ember-glow">{story.title}</h4>
                      <p className="text-text-secondary mb-3 leading-relaxed font-serif">
                        {story.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-text-muted">
                        {story.readingTime && (
                          <span>⏱ {story.readingTime} min read</span>
                        )}
                        {story.date && <span>{story.date}</span>}
                      </div>
                    </div>
                    <span className="text-ember-glow ml-4">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Empty State */}
          {selectedBookData && selectedBookData.id !== "tale_of_modred" && selectedBookData.stories.length === 0 && (
            <div className="mt-8 card">
              <p className="text-text-muted italic font-serif text-center py-8">
                Stories for {selectedBookData.title} are coming soon. Check back as we expand the narrative.
              </p>
            </div>
          )}
        </section>

        {/* Timeline/Relationship Info */}
        <section className="mb-20">
          <div className="card-glow">
            <h2 className="text-2xl font-bold mb-4 text-ember-glow">The Timeline</h2>
            <div className="space-y-4 font-serif text-text-secondary leading-relaxed">
              <div>
                <h3 className="text-lg font-bold text-ember-glow mb-2">The Tale of Modred (Prequel)</h3>
                <p>
                  The origin story of <strong className="text-ember-glow">Modred the Shadow-Weaver</strong>, 
                  who discovered that runes were not mere symbols, but the very alphabet of reality itself. 
                  This prequel sets the foundation for the world of Magicborn.
                </p>
              </div>
              <div className="border-l-2 border-ember/30 pl-4 ml-4">
                <h3 className="text-lg font-bold text-ember-glow mb-2">Modred's Legacy (Main Timeline)</h3>
                <p>
                  The current era where the game takes place. Stories of oppressed magicborn, military slaves, 
                  and those who must craft spells to survive. All short stories and game content exist in this timeline, 
                  building upon Modred's discoveries.
                </p>
              </div>
            </div>
          </div>
        </section>

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
