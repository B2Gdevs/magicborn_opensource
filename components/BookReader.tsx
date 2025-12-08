"use client";

import { useState, useEffect, useRef } from "react";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { generateTableOfContents, processMarkdownContent, slugify, type TocItem } from "@lib/utils/markdown-parser";
import { extractImagesFromMarkdown, type ExtractedImage } from "@lib/utils/image-extractor";
import { formatDateForDisplay } from "@lib/utils/date-formatter";
import { 
  loadDocumentationList, 
  loadDocumentationFile, 
  organizeByCategory,
  type DocFile,
  type DocCategory 
} from "@lib/utils/docs-loader";
import { filterFilesByMode } from "@lib/utils/content-validator";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import VideoPlayer from "@components/VideoPlayer";
import { ViewerMode } from "@lib/config/content-types";
import { ChevronLeft, ChevronRight, BookOpen, List, Maximize2, Minimize2 } from "lucide-react";

interface BookReaderProps {
  initialPath?: string;
  // Pre-loaded content (for server-side rendering / SEO)
  initialContent?: string; // Raw markdown content
  initialProcessedContent?: string; // Processed markdown content
  initialToc?: TocItem[]; // Pre-generated table of contents
  initialImages?: ExtractedImage[]; // Pre-extracted images
  initialMetadata?: { created: Date; modified: Date } | null; // File metadata
  initialFiles?: DocFile[]; // Pre-loaded file list for sidebar (server-side)
  initialCategories?: DocCategory[]; // Pre-organized categories for sidebar (server-side)
  currentPath?: string; // Current pathname for active state (server-side)
}

export default function BookReader({
  initialPath,
  initialContent,
  initialProcessedContent,
  initialToc,
  initialImages,
  initialMetadata,
  initialFiles,
  initialCategories,
  currentPath: initialCurrentPath,
}: BookReaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [toc, setToc] = useState<TocItem[]>(initialToc || []);
  const [markdownContent, setMarkdownContent] = useState<string>(initialProcessedContent || "");
  const [rawMarkdownContent, setRawMarkdownContent] = useState<string>(initialContent || "");
  const [images, setImages] = useState<ExtractedImage[]>(initialImages || []);
  const [currentDoc, setCurrentDoc] = useState<string>(initialPath || "");
  const [docFiles, setDocFiles] = useState<DocFile[]>(initialFiles || []);
  const [categories, setCategories] = useState<DocCategory[]>(initialCategories || []);
  const [loading, setLoading] = useState(!initialContent);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => {
    if (initialCategories) {
      const allCategoryNames = new Set<string>();
      initialCategories.forEach(cat => {
        allCategoryNames.add(cat.name);
        cat.subcategories.forEach(sub => allCategoryNames.add(`${cat.name}/${sub.name}`));
      });
      return allCategoryNames;
    }
    return new Set();
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const mainContentRef = useRef<HTMLElement>(null);
  const [fileMetadata, setFileMetadata] = useState<{ created: Date; modified: Date } | null>(initialMetadata || null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pageTitle, setPageTitle] = useState<string>("");

  // Load documentation structure
  useEffect(() => {
    if (initialFiles && initialCategories) {
      return;
    }

    async function loadDocs() {
      try {
        const files = await loadDocumentationList();
        setDocFiles(files);
        
        const filteredFiles = filterFilesByMode(files, ViewerMode.BOOKS);
        const organized = organizeByCategory(filteredFiles);
        setCategories(organized);
        
        const allCategoryNames = new Set<string>();
        organized.forEach(cat => {
          allCategoryNames.add(cat.name);
          cat.subcategories.forEach(sub => allCategoryNames.add(`${cat.name}/${sub.name}`));
        });
        setExpandedCategories(allCategoryNames);
        
        if (!initialContent && initialPath) {
          await loadDocument(initialPath);
        }
      } catch (error) {
        console.error("Failed to load documentation:", error);
      }
    }
    loadDocs();
  }, [initialPath, initialContent, initialFiles, initialCategories]);

  // Update content when pathname changes
  useEffect(() => {
    const currentPath = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');
    if (currentPath) {
      const pathMatch = currentPath.match(/\/books\/(.+?)(?:\?|$)/);
      if (pathMatch && pathMatch[1]) {
        let docPath = pathMatch[1];
        if (!docPath.startsWith('books/')) {
          docPath = `books/${docPath}`;
        }
        // Always update currentDoc to match URL, even if we're not loading
        if (docPath !== currentDoc) {
          setCurrentDoc(docPath);
          // Only load if we don't have initial content or it's different
          if (!initialContent || initialPath !== docPath) {
            loadDocument(docPath);
          }
        }
      }
    }
  }, [pathname]); // Remove currentDoc from deps to avoid loops

  // Expand category containing current document
  useEffect(() => {
    if (currentDoc && categories.length > 0) {
      const newExpanded = new Set(expandedCategories);
      
      function findCategoryForFile(cats: DocCategory[], filePath: string, parentPath = ""): string | null {
        for (const cat of cats) {
          const categoryPath = parentPath ? `${parentPath}/${cat.name}` : cat.name;
          
          // Check if file is in this category
          if (cat.files.some(f => f.path === filePath)) {
            return categoryPath;
          }
          
          // Check subcategories
          if (cat.subcategories.length > 0) {
            const found = findCategoryForFile(cat.subcategories, filePath, categoryPath);
            if (found) {
              // Also expand parent category
              newExpanded.add(categoryPath);
              return found;
            }
          }
        }
        return null;
      }
      
      const categoryPath = findCategoryForFile(categories, currentDoc);
      if (categoryPath) {
        newExpanded.add(categoryPath);
        setExpandedCategories(newExpanded);
      }
    }
  }, [currentDoc, categories]);

  // Track reading progress
  useEffect(() => {
    const scrollContainer = mainContentRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      const scrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [markdownContent]);

  const loadDocument = async (path: string) => {
    try {
      setLoading(true);
      const content = await loadDocumentationFile(path);
      setCurrentDoc(path);
      setRawMarkdownContent(content);
      const processed = processMarkdownContent(content);
      setMarkdownContent(processed);
      const generatedToc = generateTableOfContents(content);
      setToc(generatedToc);
      
      // Extract title from markdown (first h1)
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const extractedTitle = titleMatch ? titleMatch[1].trim() : path.split('/').pop()?.replace(/\.md$/, '') || 'Untitled';
      setPageTitle(extractedTitle);
      
      const extractedImages = extractImagesFromMarkdown(content);
      setImages(extractedImages);
      
      // Load file metadata
      try {
        const metadataResponse = await fetch(`/api/docs/metadata?path=${encodeURIComponent(path)}`);
        if (metadataResponse.ok) {
          const metadata = await metadataResponse.json();
          setFileMetadata({
            created: new Date(metadata.created),
            modified: new Date(metadata.modified),
          });
        }
      } catch (error) {
        console.error("Failed to load file metadata:", error);
      }

      // Scroll to top
      if (mainContentRef.current) {
        mainContentRef.current.scrollTop = 0;
      }
    } catch (error) {
      console.error("Failed to load document:", error);
      setMarkdownContent("# Error\n\nFailed to load document. Please try again.");
      setPageTitle("Error");
    } finally {
      setLoading(false);
    }
  };

  // Extract title from initial content if available
  useEffect(() => {
    if (initialContent && !pageTitle) {
      const titleMatch = initialContent.match(/^#\s+(.+)$/m);
      const extractedTitle = titleMatch ? titleMatch[1].trim() : initialPath?.split('/').pop()?.replace(/\.md$/, '') || 'Untitled';
      setPageTitle(extractedTitle);
    }
  }, [initialContent, initialPath]);

  // Find next/previous files in the same category
  const findAdjacentFiles = () => {
    const allFiles: DocFile[] = [];
    
    function collectFiles(fileList: DocFile[]) {
      for (const file of fileList) {
        if (!file.isDirectory) {
          allFiles.push(file);
        } else if (file.children) {
          collectFiles(file.children);
        }
      }
    }
    
    collectFiles(docFiles);
    
    const currentIndex = allFiles.findIndex(f => f.path === currentDoc);
    const nextFile = currentIndex >= 0 && currentIndex < allFiles.length - 1 ? allFiles[currentIndex + 1] : null;
    const prevFile = currentIndex > 0 ? allFiles[currentIndex - 1] : null;
    
    return { nextFile, prevFile };
  };

  const { nextFile, prevFile } = findAdjacentFiles();

  const handleNext = () => {
    if (nextFile) {
      const normalizedPath = nextFile.path.replace(/^books\//, '');
      router.push(`/books/${normalizedPath}`);
    }
  };

  const handlePrevious = () => {
    if (prevFile) {
      const normalizedPath = prevFile.path.replace(/^books\//, '');
      router.push(`/books/${normalizedPath}`);
    }
  };

  const toggleCategory = (categoryPath: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryPath)) {
      newExpanded.delete(categoryPath);
    } else {
      newExpanded.add(categoryPath);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategory = (category: DocCategory, parentPath = "") => {
    const categoryPath = parentPath ? `${parentPath}/${category.name}` : category.name;
    const isExpanded = expandedCategories.has(categoryPath);
    const hasContent = category.files.length > 0 || category.subcategories.length > 0;

    if (!hasContent) return null;

    return (
      <div key={categoryPath} className="mb-4">
        <button
          onClick={() => toggleCategory(categoryPath)}
          className="flex items-center justify-between w-full px-3 py-2 text-left text-sm font-semibold text-glow hover:bg-deep rounded-lg transition-colors"
        >
          <span className="capitalize">{category.name}</span>
          <span className={`text-text-muted transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
            ▶
          </span>
        </button>
        {isExpanded && (
          <div className="ml-4 mt-2 space-y-1">
            {category.files.map((file) => {
              const normalizedPath = file.path.replace(/^books\//, '');
              const fileUrl = `/books/${normalizedPath}`;
              const currentPathValue = initialCurrentPath || pathname || (typeof window !== 'undefined' ? window.location.pathname : '');
              
              // Normalize paths for comparison
              const currentPathNormalized = currentPathValue.replace(/^\/books\//, '').split('?')[0];
              const filePathNormalized = normalizedPath.split('?')[0];
              
              // Check if this file matches the current document
              // Compare both the full path and normalized paths
              const isActive = currentDoc === file.path || 
                               currentDoc.replace(/^books\//, '') === normalizedPath ||
                               currentPathNormalized === filePathNormalized ||
                               (currentPathValue && filePathNormalized && currentPathValue.includes(filePathNormalized));
              
              return (
                <Link
                  key={file.path}
                  href={fileUrl}
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                    isActive
                      ? "text-ember-glow bg-shadow border-l-2 border-ember-glow"
                      : "text-text-secondary hover:text-ember-glow hover:bg-deep"
                  }`}
                  onClick={() => {
                    setCurrentDoc(file.path);
                  }}
                >
                  {file.name}
                </Link>
              );
            })}
            {category.subcategories.map((sub) => renderCategory(sub, categoryPath))}
          </div>
        )}
      </div>
    );
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    const scrollContainer = mainContentRef.current;
    if (!element || !scrollContainer) return;

    const offset = 100;
    const containerRect = scrollContainer.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const scrollTop = scrollContainer.scrollTop;
    const offsetPosition = elementRect.top - containerRect.top + scrollTop - offset;

    scrollContainer.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
    setIsTocOpen(false);
  };

  return (
    <div className={`flex h-full ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Sidebar Navigation */}
      {isSidebarOpen && !isFullscreen && (
        <aside className="w-80 transition-all duration-300 overflow-hidden border-r border-border bg-shadow flex-shrink-0 relative h-full">
          <div className="h-full overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-glow flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Stories & Books
              </h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-text-muted hover:text-ember-glow transition-colors p-1"
                aria-label="Collapse sidebar"
              >
                ←
              </button>
            </div>

            {/* Search Input */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-deep border border-border rounded-lg text-text-secondary placeholder-text-muted focus:outline-none focus:border-ember-glow focus:ring-1 focus:ring-ember-glow transition-colors"
              />
            </div>

            {/* Document Navigation */}
            <div className="space-y-2">
              {categories
                .filter(cat => 
                  !searchQuery || 
                  cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  cat.files.some(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map((category) => renderCategory(category))}
            </div>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main 
        ref={mainContentRef as React.RefObject<HTMLDivElement>}
        className="flex-1 flex flex-col h-full overflow-hidden bg-void"
      >
        {/* Reading Progress Bar */}
        <div className="h-1 bg-deep relative">
          <div 
            className="h-full bg-ember-glow transition-all duration-150"
            style={{ width: `${readingProgress}%` }}
          />
        </div>

        {/* Top Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-shadow flex-shrink-0">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && !isFullscreen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="text-text-muted hover:text-ember-glow transition-colors p-2"
                aria-label="Open sidebar"
              >
                →
              </button>
            )}
            <button
              onClick={() => setIsTocOpen(!isTocOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-deep hover:bg-shadow border border-border text-text-secondary hover:text-ember-glow transition-colors"
            >
              <List className="w-4 h-4" />
              <span className="text-sm">Contents</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                disabled={!prevFile}
                className="p-2 rounded-lg bg-deep hover:bg-shadow border border-border text-text-secondary hover:text-ember-glow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                disabled={!nextFile}
                className="p-2 rounded-lg bg-deep hover:bg-shadow border border-border text-text-secondary hover:text-ember-glow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg bg-deep hover:bg-shadow border border-border text-text-secondary hover:text-ember-glow transition-colors"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Content Area with TOC Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Table of Contents Sidebar */}
          {isTocOpen && (
            <aside className="w-64 border-r border-border bg-shadow flex-shrink-0 overflow-y-auto p-4">
              <h3 className="text-sm font-semibold text-glow mb-4">Table of Contents</h3>
              <div className="space-y-1">
                {toc.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="block w-full text-left px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-ember-glow hover:bg-deep transition-colors"
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </aside>
          )}

          {/* Main Reading Area */}
          <div className="flex-1 overflow-y-auto p-8">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-text-muted">Loading...</div>
              </div>
            ) : (
              <article className="max-w-4xl mx-auto">
                {/* Page Title */}
                {pageTitle && (
                  <h1 className="text-5xl font-bold text-glow mb-6">{pageTitle}</h1>
                )}
                
                {/* Metadata */}
                {fileMetadata && (
                  <div className="mb-6 text-sm text-text-muted flex gap-4">
                    <span>Created: {formatDateForDisplay(fileMetadata.created)}</span>
                    <span>Updated: {formatDateForDisplay(fileMetadata.modified)}</span>
                  </div>
                )}

                {/* Markdown Content */}
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ node, ...props }: any) => {
                        const id = slugify(String(props.children || ''));
                        return <h1 id={id} className="text-4xl font-bold text-glow mt-12 mb-6" {...props} />;
                      },
                      h2: ({ node, ...props }: any) => {
                        const id = slugify(String(props.children || ''));
                        return <h2 id={id} className="text-3xl font-semibold text-glow mt-10 mb-4" {...props} />;
                      },
                      h3: ({ node, ...props }: any) => {
                        const id = slugify(String(props.children || ''));
                        return <h3 id={id} className="text-2xl font-semibold text-glow mt-8 mb-4" {...props} />;
                      },
                      h4: ({ node, ...props }: any) => {
                        const id = slugify(String(props.children || ''));
                        return <h4 id={id} className="text-xl font-semibold text-glow mt-6 mb-3" {...props} />;
                      },
                      p: ({ node, ...props }: any) => {
                        const nodeChildren = node?.children || [];
                        const hasVideoLink = nodeChildren.some((child: any) => {
                          if (child.type === 'link' || child.type === 'linkReference') {
                            const href = child.url || child.href || '';
                            const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.m4v'];
                            return videoExtensions.some(ext => href.toLowerCase().endsWith(ext));
                          }
                          return false;
                        });

                        if (hasVideoLink) {
                          return (
                            <div className="mb-6 leading-relaxed text-text-primary text-lg leading-loose" {...props} />
                          );
                        }

                        return (
                          <p className="mb-6 leading-relaxed text-text-primary text-lg leading-loose" {...props} />
                        );
                      },
                      ul: ({ node, ...props }) => <ul className="list-disc space-y-2 my-4 ml-6 text-text-primary" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal space-y-2 my-4 ml-6 text-text-primary" {...props} />,
                      li: ({ node, ...props }) => <li className="text-text-primary" {...props} />,
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
                        
                        if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
                          imageSrc = imageSrc;
                        } else if (imageSrc.startsWith('/')) {
                          imageSrc = imageSrc;
                        } else if (imageSrc.startsWith('./')) {
                          const bookMatch = currentDoc.match(/^books\/([^\/]+)/);
                          if (bookMatch) {
                            imageSrc = `/books/${bookMatch[1]}/images/${imageSrc.replace(/^\.\//, '')}`;
                          } else {
                            imageSrc = `/design/${imageSrc.replace(/^\.\//, '')}`;
                          }
                        } else {
                          const bookMatch = currentDoc.match(/^books\/([^\/]+)/);
                          if (bookMatch) {
                            imageSrc = `/books/${bookMatch[1]}/images/${imageSrc}`;
                          } else {
                            imageSrc = `/design/${imageSrc}`;
                          }
                        }
                        
                        return (
                          <img
                            {...props}
                            src={imageSrc}
                            alt={props.alt || ''}
                            className="my-6 rounded-lg border border-border max-w-full h-auto"
                          />
                        );
                      },
                      a: ({ node, ...props }: any) => {
                        const href = props.href || '';
                        const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.m4v'];
                        const isVideo = videoExtensions.some(ext => href.toLowerCase().endsWith(ext));
                        
                        if (isVideo) {
                          return <VideoPlayer src={href} />;
                        }
                        
                        return (
                          <a
                            {...props}
                            className="text-ember-glow hover:text-ember-glow/80 underline transition-colors"
                            target={href.startsWith('http') ? '_blank' : undefined}
                            rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                          />
                        );
                      },
                    }}
                  >
                    {markdownContent}
                  </ReactMarkdown>
                </div>

                {/* Page Navigation Footer */}
                <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
                  {prevFile && (
                    <Link
                      href={`/books/${prevFile.path.replace(/^books\//, '')}`}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-deep hover:bg-shadow border border-border text-text-secondary hover:text-ember-glow transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="text-sm">Previous: {prevFile.name}</span>
                    </Link>
                  )}
                  {!prevFile && <div />}
                  
                  {nextFile && (
                    <Link
                      href={`/books/${nextFile.path.replace(/^books\//, '')}`}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-deep hover:bg-shadow border border-border text-text-secondary hover:text-ember-glow transition-colors"
                    >
                      <span className="text-sm">Next: {nextFile.name}</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </article>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

