"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getAllBooks, getBookById, type BookId } from "@lib/data/stories";
import { getMordredsTaleBook } from "@lib/data/books";

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
            Stories from the Magicborn universe. <strong className="text-ember-glow">Modred's Legacy</strong> is the main timeline 
            where the game takes place. Explore short stories of oppressed magicborn, military slaves, and those who craft spells to survive.
          </p>
        </div>

        {/* Books Section */}
        <section className="mb-20">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2 text-ember-glow">The Books</h2>
            <p className="text-text-muted text-sm font-serif">
              <strong className="text-ember-glow">Modred's Legacy</strong> is the focus of the game. Short stories will appear here as we expand the narrative.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {books.map((book) => {
              const isPrequel = book.id === "tale_of_modred";
              const modredsTaleBook = isPrequel ? getMordredsTaleBook() : null;
              const pageCount = modredsTaleBook ? modredsTaleBook.totalPages : 0;
              
              return (
                <Link
                  key={book.id}
                  href={isPrequel ? "/books/tale-of-modred?page=1" : "#"}
                  onClick={(e) => {
                    if (!isPrequel) {
                      e.preventDefault();
                      setSelectedBook(selectedBook === book.id ? null : book.id);
                    }
                  }}
                  className={`card-glow transition-all hover:border-ember block ${
                    isPrequel ? "opacity-60 hover:opacity-80" : ""
                  } ${selectedBook === book.id && !isPrequel ? "border-ember border-2" : ""}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className={`text-2xl font-bold mb-2 ${isPrequel ? "text-text-secondary" : "text-ember-glow"}`}>
                        {book.title}
                      </h3>
                      {book.isPrequel && (
                        <span className="badge text-xs opacity-60">Prequel</span>
                      )}
                      {!book.isPrequel && (
                        <span className="badge-glow text-xs">Main Game Timeline</span>
                      )}
                    </div>
                  </div>
                  <p className={`mb-4 leading-relaxed font-serif ${isPrequel ? "text-text-muted" : "text-text-secondary"}`}>
                    {book.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      {isPrequel ? (
                        <span className="text-sm text-text-muted">
                          {pageCount} {pageCount === 1 ? "page" : "pages"}
                        </span>
                      ) : (
                        <>
                          <span className="text-sm text-ember-glow">
                            {book.stories.length} {book.stories.length === 1 ? "story" : "stories"}
                          </span>
                          {pageCount > 0 && (
                            <span className="text-xs text-text-muted">
                              {pageCount} {pageCount === 1 ? "page" : "pages"} total
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    <span className={`text-sm ${isPrequel ? "text-text-muted" : "text-ember-glow"}`}>
                      {isPrequel ? "→" : selectedBook === book.id ? "▼" : "▶"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Modred's Legacy - Short Stories */}
          {selectedBookData && selectedBookData.id === "modreds_legacy" && (
            <div className="mt-8">
              {selectedBookData.stories.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold mb-4 text-ember-glow">
                    Short Stories from {selectedBookData.title}
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
              ) : (
                <div className="mt-8 card">
                  <p className="text-text-muted italic font-serif text-center py-8">
                    Short stories for {selectedBookData.title} are coming soon. Check back as we expand the narrative.
                  </p>
                </div>
              )}
            </div>
          )}
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
