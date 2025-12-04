"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { loadBooksFromFileSystem } from "@/lib/utils/book-scanner";

export default function StoryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [storyPath, setStoryPath] = useState<string | null>(null);
  const [bookTitle, setBookTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStory() {
      const storyId = Array.isArray(params.id) ? params.id[0] : params.id;
      
      // Find story in file system
      const books = await loadBooksFromFileSystem();
      let foundStory: { path: string; bookId: string; title: string } | null = null;
      
      for (const book of books) {
        const story = book.stories.find(s => s.id === storyId);
        if (story) {
          foundStory = {
            path: story.path,
            bookId: book.id,
            title: story.title,
          };
          setBookTitle(book.title);
          break;
        }
      }
      
      if (!foundStory) {
        router.replace("/stories");
        return;
      }

      setStoryPath(foundStory.path);

      // Load markdown content
      const contentPath = `/${foundStory.path}.md`;
      fetch(contentPath)
        .then((res) => {
          if (!res.ok) throw new Error("Story not found");
          return res.text();
        })
        .then((text) => {
          setContent(text);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load story:", err);
          setContent("Story content coming soon...");
          setLoading(false);
        });
    }
    loadStory();
  }, [params.id, router]);

  if (!storyPath) return null;

  return (
    <main className="ml-64 mt-16 min-h-screen bg-black text-white">
      <div className="container mx-auto px-12 py-12 max-w-4xl">
        {/* Back Button */}
        <Link
          href="/stories"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-ember-glow transition-colors mb-8"
        >
          ← Back to Stories
        </Link>

        {/* Story Header */}
        <div className="mb-12">
          {bookTitle && (
            <div className="mb-4">
              <Link
                href="/stories"
                className="text-sm text-ember-glow hover:text-ember-glow/80 transition-colors"
              >
                {bookTitle}
              </Link>
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            {storyPath.split('/').pop()?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Story'}
          </h1>
          <div className="flex items-center gap-4 text-sm text-text-muted">
            {bookTitle && (
              <span className="badge">
                {bookTitle.includes("Legacy") ? "Main Timeline" : "Prequel"}
              </span>
            )}
          </div>
        </div>

        {/* Story Content */}
        <article className="prose prose-invert prose-lg max-w-none">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-text-muted">Loading story...</p>
            </div>
          ) : (
            <div
              className="story-content font-serif leading-relaxed text-text-secondary"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
            />
          )}
        </article>

        {/* Navigation */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex items-center justify-between">
            <Link
              href="/stories"
              className="btn-secondary"
            >
              ← All Stories
            </Link>
            {bookTitle && (
              <Link
                href="/stories"
                className="text-text-secondary hover:text-ember-glow transition-colors"
              >
                More from {bookTitle} →
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// Simple markdown parser for basic formatting
function parseMarkdown(markdown: string): string {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-2xl font-bold text-ember-glow mt-8 mb-4">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold text-ember-glow mt-10 mb-6">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold text-white mt-12 mb-8">$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-ember-glow font-bold">$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em class="text-text-glow italic">$1</em>');

  // Paragraphs
  html = html.split('\n\n').map(para => {
    if (para.trim() && !para.match(/^<[h|div]/)) {
      return `<p class="mb-6 leading-relaxed">${para.trim()}</p>`;
    }
    return para;
  }).join('\n');

  // Line breaks
  html = html.replace(/\n/g, '<br />');

  return html;
}

