"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getMordredsTaleBook, getPageByNumber, getNextPage, getPreviousPage, type BookPage } from "@lib/data/books";

export default function TaleOfModredPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState<BookPage | null>(null);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const book = useMemo(() => getMordredsTaleBook(), []);
  const pageParam = searchParams.get("page");
  const initialPage = useMemo(() => (pageParam ? parseInt(pageParam, 10) : 1), [pageParam]);

  useEffect(() => {
    const page = getPageByNumber(book, initialPage);
    if (!page) {
      router.replace("/books/tale-of-modred?page=1");
      return;
    }

    setCurrentPage(page);
    setImageError(false);
    setImageLoaded(false);
    setLoading(true);
    setContent(""); // Clear previous content

    // Load markdown content
    fetch(page.contentPath)
      .then((res) => {
        if (!res.ok) throw new Error("Page not found");
        return res.text();
      })
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load page:", err);
        setContent("Page content coming soon...");
        setLoading(false);
      });
  }, [initialPage, book, router]);

  const handleNext = () => {
    if (!currentPage) return;
    const next = getNextPage(book, currentPage.pageNumber);
    if (next) {
      router.push(`/books/tale-of-modred?page=${next.pageNumber}`);
    }
  };

  const handlePrevious = () => {
    if (!currentPage) return;
    const prev = getPreviousPage(book, currentPage.pageNumber);
    if (prev) {
      router.push(`/books/tale-of-modred?page=${prev.pageNumber}`);
    }
  };

  if (!currentPage) return null;

  const chapter = book.chapters.find((ch) => ch.chapterNumber === currentPage.chapterNumber);
  const nextPage = getNextPage(book, currentPage.pageNumber);
  const prevPage = getPreviousPage(book, currentPage.pageNumber);

  return (
    <main className="ml-64 mt-16 min-h-screen bg-black text-white">
      <div className="container mx-auto px-12 py-12 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-ember-glow transition-colors mb-4"
          >
            ← Back to Stories
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white">{book.title}</h1>
          {chapter && (
            <p className="text-xl text-ember-glow mb-2">{chapter.displayName}</p>
          )}
          <p className="text-sm text-text-muted">
            Page {currentPage.pageNumber} of {book.totalPages}
          </p>
        </div>

        {/* Page Content */}
        <div className="mb-8 min-h-[600px]">
          {/* Image - Fixed height container to prevent layout shift */}
          {currentPage.imagePath && !imageError && (
            <div className="relative w-full mb-8 rounded-lg overflow-hidden bg-deep" style={{ minHeight: '600px' }}>
              <Image
                src={currentPage.imagePath}
                alt={`Page ${currentPage.pageNumber}`}
                width={1200}
                height={1600}
                className="w-full h-auto object-contain"
                onError={() => setImageError(true)}
                onLoad={() => setImageLoaded(true)}
                priority={currentPage.pageNumber <= 3}
                style={{ 
                  opacity: imageLoaded ? 1 : 0,
                  transition: 'opacity 0.3s ease-in-out'
                }}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-text-muted">Loading image...</p>
                </div>
              )}
            </div>
          )}

          {/* Text Content - Fixed container to prevent shift */}
          <div className="min-h-[200px]">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-text-muted">Loading page...</p>
              </div>
            ) : (
              <article className="prose prose-invert prose-lg max-w-none">
                <div
                  className="story-content font-serif leading-relaxed text-text-secondary"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
                />
              </article>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-8 border-t border-border">
          <div>
            {prevPage ? (
              <button
                onClick={handlePrevious}
                className="btn-secondary"
              >
                ← Previous Page
              </button>
            ) : (
              <span className="text-text-muted">← Beginning</span>
            )}
          </div>

          <div className="text-center">
            <p className="text-sm text-text-muted">
              Page {currentPage.pageNumber} of {book.totalPages}
            </p>
            {chapter && (
              <p className="text-xs text-text-muted mt-1">{chapter.displayName}</p>
            )}
          </div>

          <div>
            {nextPage ? (
              <button
                onClick={handleNext}
                className="btn"
              >
                Next Page →
              </button>
            ) : (
              <span className="text-text-muted">End →</span>
            )}
          </div>
        </div>

        {/* Chapter Navigation */}
        <div className="mt-8 card">
          <h3 className="text-lg font-bold mb-4 text-ember-glow">Chapters</h3>
          <div className="grid md:grid-cols-2 gap-2">
            {book.chapters.map((ch) => (
              <Link
                key={ch.chapterNumber}
                href={`/books/tale-of-modred?page=${ch.pages[0].pageNumber}`}
                className={`text-sm p-2 rounded transition-colors ${
                  ch.chapterNumber === currentPage.chapterNumber
                    ? "bg-ember/20 text-ember-glow border border-ember/50"
                    : "text-text-secondary hover:text-white hover:bg-deep"
                }`}
              >
                {ch.displayName} ({ch.pages.length} pages)
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

// Simple markdown parser
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

  // Remove markdown image syntax (we handle images separately)
  html = html.replace(/!\[.*?\]\(.*?\)/g, '');

  // Paragraphs
  const paragraphs = html.split('\n\n').filter(p => p.trim());
  html = paragraphs.map(para => {
    const trimmed = para.trim();
    if (trimmed && !trimmed.match(/^<[h|div]/) && !trimmed.match(/^#/)) {
      return `<p class="mb-6 leading-relaxed">${trimmed}</p>`;
    }
    return trimmed;
  }).join('');

  return html;
}

