'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, X, Command } from 'lucide-react';

interface SearchResult {
  slug: string;
  title: string;
  excerpt: string;
  matchType: 'title' | 'content';
}

interface DevDocsSearchProps {
  searchIndex: Array<{
    slug: string;
    title: string;
    content: string;
  }>;
}

export default function DevDocsSearch({ searchIndex }: DevDocsSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Handle Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Search function
  const search = useCallback((q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    const queryLower = q.toLowerCase();
    const matches: SearchResult[] = [];

    for (const doc of searchIndex) {
      // Title match (higher priority)
      if (doc.title.toLowerCase().includes(queryLower)) {
        matches.push({
          slug: doc.slug,
          title: doc.title,
          excerpt: doc.content.substring(0, 150) + '...',
          matchType: 'title',
        });
        continue;
      }

      // Content match
      const contentLower = doc.content.toLowerCase();
      const matchIndex = contentLower.indexOf(queryLower);
      if (matchIndex !== -1) {
        const start = Math.max(0, matchIndex - 40);
        const end = Math.min(doc.content.length, matchIndex + q.length + 80);
        const excerpt = (start > 0 ? '...' : '') + 
          doc.content.substring(start, end) + 
          (end < doc.content.length ? '...' : '');
        
        matches.push({
          slug: doc.slug,
          title: doc.title,
          excerpt,
          matchType: 'content',
        });
      }
    }

    // Sort: title matches first
    matches.sort((a, b) => {
      if (a.matchType === 'title' && b.matchType !== 'title') return -1;
      if (a.matchType !== 'title' && b.matchType === 'title') return 1;
      return 0;
    });

    setResults(matches.slice(0, 10));
    setSelectedIndex(0);
  }, [searchIndex]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    search(e.target.value);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      router.push(`/docs/developer/${results[selectedIndex].slug}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  // Navigate to result
  const navigateTo = (slug: string) => {
    router.push(`/docs/developer/${slug}`);
    setIsOpen(false);
    setQuery('');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-text-primary bg-shadow border border-border rounded-lg transition-colors"
      >
        <Search className="w-4 h-4" />
        <span>Search docs...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-deep border border-border rounded">
          <Command className="w-3 h-3" />K
        </kbd>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 z-50"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Modal */}
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4">
        <div className="bg-shadow border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search className="w-5 h-5 text-text-muted shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Search developer docs..."
              className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-text-muted hover:text-text-primary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {results.length === 0 && query && (
              <div className="px-4 py-8 text-center text-text-muted">
                No results found for &ldquo;{query}&rdquo;
              </div>
            )}
            
            {results.length === 0 && !query && (
              <div className="px-4 py-8 text-center text-text-muted">
                Start typing to search...
              </div>
            )}

            {results.map((result, index) => (
              <button
                key={result.slug}
                onClick={() => navigateTo(result.slug)}
                className={`
                  w-full flex items-start gap-3 px-4 py-3 text-left transition-colors
                  ${index === selectedIndex ? 'bg-ember/10' : 'hover:bg-deep'}
                `}
              >
                <FileText className={`w-5 h-5 shrink-0 mt-0.5 ${index === selectedIndex ? 'text-ember-glow' : 'text-text-muted'}`} />
                <div className="min-w-0">
                  <div className={`font-medium truncate ${index === selectedIndex ? 'text-ember-glow' : 'text-text-primary'}`}>
                    {result.title}
                  </div>
                  <div className="text-sm text-text-muted line-clamp-2 mt-0.5">
                    {result.excerpt}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 px-4 py-2 text-xs text-text-muted border-t border-border bg-deep/50">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-shadow border border-border rounded">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-shadow border border-border rounded">↵</kbd>
              Open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-shadow border border-border rounded">esc</kbd>
              Close
            </span>
          </div>
        </div>
      </div>
    </>
  );
}


