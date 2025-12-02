"use client";

import Link from "next/link";

// This will be populated from markdown files or a CMS later
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
    <main className="min-h-screen bg-void text-text-primary">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-5xl font-bold mb-4 text-glow">Tales from the Shadow</h1>
        <p className="text-xl text-text-secondary mb-12">
          Stories from the Magicborn: Modred's Legacy universe
        </p>

        <div className="space-y-6">
          {stories.map((story) => (
            <article key={story.id} className="card-glow">
              <h2 className="text-2xl font-semibold mb-3 text-ember-glow">{story.title}</h2>
              <p className="text-text-secondary mb-4 leading-relaxed">{story.excerpt}</p>
              <div className="text-sm text-text-muted">{story.date}</div>
            </article>
          ))}
        </div>

        <div className="mt-12 card">
          <p className="text-text-secondary">
            Stories will be added regularly, exploring the rich lore of Magicborn, 
            the legacy of Modred, and the shadowy depths where magic flows like blood.
          </p>
        </div>
      </div>
    </main>
  );
}

