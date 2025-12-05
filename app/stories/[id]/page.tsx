"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { loadBooksFromFileSystem } from "@/lib/utils/book-scanner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { slugify } from "@lib/utils/markdown-parser";
import VideoPlayer from "@components/VideoPlayer";

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
      setStoryTitle(foundStory.title);

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
            {storyTitle || storyPath.split('/').pop()?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Story'}
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
            <div className="story-content font-serif leading-relaxed text-text-secondary">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, ...props }: any) => {
                    const id = slugify(String(props.children || ''));
                    return <h1 id={id} className="text-4xl font-bold text-white mt-12 mb-8" {...props} />;
                  },
                  h2: ({ node, ...props }: any) => {
                    const id = slugify(String(props.children || ''));
                    return <h2 id={id} className="text-3xl font-bold text-glow mt-12 mb-8 border-b border-border pb-4" {...props} />;
                  },
                  h3: ({ node, ...props }: any) => {
                    const id = slugify(String(props.children || ''));
                    return <h3 id={id} className="text-2xl font-bold text-glow mt-10 mb-6" {...props} />;
                  },
                  h4: ({ node, ...props }: any) => {
                    const id = slugify(String(props.children || ''));
                    return <h4 id={id} className="text-xl font-semibold text-glow mt-8 mb-4" {...props} />;
                  },
                  p: ({ node, ...props }) => <p className="mb-6 leading-relaxed text-text-secondary" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc space-y-2 my-4 ml-6" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal space-y-2 my-4 ml-6" {...props} />,
                  li: ({ node, ...props }) => <li className="text-text-secondary" {...props} />,
                  code: ({ node, inline, ...props }: any) => 
                    inline ? (
                      <code className="bg-shadow border border-border rounded px-2 py-1 text-ember-glow text-sm" {...props} />
                    ) : (
                      <code className="text-text-primary" {...props} />
                    ),
                  pre: ({ node, ...props }) => (
                    <pre className="bg-shadow border border-border rounded-lg p-4 overflow-x-auto my-6" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-ember-glow pl-4 my-6 italic text-text-secondary" {...props} />
                  ),
                  img: ({ node, ...props }: any) => {
                    let imageSrc = props.src || '';
                    
                    // Resolve image path relative to book's images folder
                    if (!imageSrc.startsWith('http://') && !imageSrc.startsWith('https://') && !imageSrc.startsWith('/')) {
                      const bookIdMatch = storyPath?.match(/books\/([^\/]+)/);
                      if (bookIdMatch) {
                        imageSrc = `/books/${bookIdMatch[1]}/images/${imageSrc}`;
                      }
                    }
                    
                    return (
                      <figure className="my-6 group max-w-2xl mx-auto">
                        <div className="relative inline-block w-full rounded-lg border border-border shadow-lg overflow-hidden">
                          <img 
                            src={imageSrc}
                            alt={props.alt || ''}
                            className="w-full h-auto max-h-[400px] object-contain block"
                            style={{ 
                              maxWidth: '100%',
                              display: 'block',
                              margin: 0,
                              padding: 0,
                              lineHeight: 0
                            }}
                            loading="lazy"
                            onError={(e) => {
                              console.warn(`Image not found: ${imageSrc}`);
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-void/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </div>
                        {props.alt && (
                          <figcaption className="text-center text-sm text-text-muted mt-2 italic">
                            {props.alt}
                          </figcaption>
                        )}
                      </figure>
                    );
                  },
                  a: ({ node, ...props }: any) => {
                    const href = props.href || '';
                    const children = props.children || '';
                    
                    // Check if link points to a video file
                    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
                    const isVideoLink = videoExtensions.some(ext => href.toLowerCase().endsWith(ext));
                    
                    if (isVideoLink) {
                      let videoSrc = href;
                      
                      // Resolve video path relative to book's videos folder
                      if (!videoSrc.startsWith('http://') && !videoSrc.startsWith('https://') && !videoSrc.startsWith('/')) {
                        const bookIdMatch = storyPath?.match(/books\/([^\/]+)/);
                        if (bookIdMatch) {
                          videoSrc = `/books/${bookIdMatch[1]}/videos/${videoSrc}`;
                        }
                      } else if (videoSrc.startsWith('./')) {
                        const bookIdMatch = storyPath?.match(/books\/([^\/]+)/);
                        if (bookIdMatch) {
                          videoSrc = `/books/${bookIdMatch[1]}/videos/${videoSrc.replace(/^\.\//, '')}`;
                        }
                      }
                      
                      return <VideoPlayer src={videoSrc} alt={typeof children === 'string' ? children : undefined} />;
                    }
                    
                    // Regular link
                    return (
                      <a
                        href={href}
                        className="text-ember-glow hover:text-ember underline"
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        {...props}
                      />
                    );
                  },
                  strong: ({ node, ...props }) => <strong className="text-ember-glow font-bold" {...props} />,
                  em: ({ node, ...props }) => <em className="text-text-glow italic" {...props} />,
                  hr: ({ node, ...props }) => <hr className="my-8 border-border" {...props} />,
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
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


