"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { generateTableOfContents, processMarkdownContent, slugify, type TocItem } from "@lib/utils/markdown-parser";
import { extractImagesFromMarkdown, type ExtractedImage } from "@lib/utils/image-extractor";
import { 
  loadDocumentationList, 
  loadDocumentationFile, 
  organizeByCategory,
  getDefaultDocument,
  type DocFile,
  type DocCategory 
} from "@lib/utils/docs-loader";
import { 
  getBookPageFromPath,
  type BookDocument 
} from "@lib/utils/book-integration";
import { getNextPage, getPreviousPage, type BookPage } from "@lib/utils/book-scanner";
import { useRouter } from "next/navigation";
import MoodBoard from "@components/MoodBoard";
import FloatingToolbar from "@components/FloatingToolbar";
import VideoPlayer from "@components/VideoPlayer";

export enum ViewerMode {
  DESIGN = "design",
  BOOKS = "books",
  DEVELOPER = "developer",
  AUTO = "auto",
}

interface DocumentationViewerProps {
  initialPath?: string;
  mode?: ViewerMode; // DESIGN shows only design docs, BOOKS shows only books, AUTO detects from path
}

export default function DocumentationViewer({ initialPath, mode = ViewerMode.AUTO }: DocumentationViewerProps) {
  const router = useRouter();
  const [toc, setToc] = useState<TocItem[]>([]);
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [rawMarkdownContent, setRawMarkdownContent] = useState<string>("");
  const [images, setImages] = useState<ExtractedImage[]>([]);
  const [activeSection, setActiveSection] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMoodBoardOpen, setIsMoodBoardOpen] = useState(false);
  const [currentDoc, setCurrentDoc] = useState<string>("");
  const [docFiles, setDocFiles] = useState<DocFile[]>([]);
  const [categories, setCategories] = useState<DocCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const mainContentRef = useRef<HTMLElement>(null);
  
  // Book mode state
  const [currentBookPage, setCurrentBookPage] = useState<{ book: BookDocument; page: BookPage } | null>(null);

  // Determine actual mode based on prop or path
  const actualMode: ViewerMode.DESIGN | ViewerMode.BOOKS | ViewerMode.DEVELOPER = mode === ViewerMode.AUTO 
    ? (initialPath?.startsWith("books/") ? ViewerMode.BOOKS : initialPath?.startsWith("developer/") ? ViewerMode.DEVELOPER : ViewerMode.DESIGN)
    : mode;

  // Load documentation structure
  useEffect(() => {
    async function loadDocs() {
      try {
        const files = await loadDocumentationList();
        setDocFiles(files);
        
        // Filter files based on mode
        let filteredFiles = files;
        if (actualMode === ViewerMode.DESIGN) {
          // Only show design category - filter out books and developer
          filteredFiles = files.filter(f => {
            // Keep if it's in design category or path starts with design/
            if (f.category === "design" || f.path.startsWith("design/")) {
              return true;
            }
            // Remove books and developer categories
            if (f.category === "books" || f.path.startsWith("books/") ||
                f.category === "developer" || f.path.startsWith("developer/")) {
              return false;
            }
            // Keep other categories (like main)
            return true;
          });
        } else if (actualMode === ViewerMode.BOOKS) {
          // Only show books category - filter out design and developer
          filteredFiles = files.filter(f => {
            // Keep if it's in books category or path starts with books/
            if (f.category === "books" || f.path.startsWith("books/")) {
              return true;
            }
            // Remove design and developer categories
            if (f.category === "design" || f.path.startsWith("design/") ||
                f.category === "developer" || f.path.startsWith("developer/")) {
              return false;
            }
            // Remove other categories
            return false;
          });
        } else if (actualMode === ViewerMode.DEVELOPER) {
          // Only show developer category - filter out design and books
          filteredFiles = files.filter(f => {
            // Keep if it's in developer category or path starts with developer/
            if (f.category === "developer" || f.path.startsWith("developer/")) {
              return true;
            }
            // Remove design and books categories
            if (f.category === "design" || f.path.startsWith("design/") ||
                f.category === "books" || f.path.startsWith("books/")) {
              return false;
            }
            // Remove other categories
            return false;
          });
        }
        
        const organized = organizeByCategory(filteredFiles);
        setCategories(organized);
        
        // Expand all categories by default
        const allCategoryNames = new Set<string>();
        organized.forEach(cat => {
          allCategoryNames.add(cat.name);
          cat.subcategories.forEach(sub => allCategoryNames.add(`${cat.name}/${sub.name}`));
        });
        setExpandedCategories(allCategoryNames);
        
        // Load default or initial document
        let docPath = initialPath;
        if (!docPath || docPath.endsWith('/')) {
          // If no path or path ends with /, use default document
          docPath = getDefaultDocument(filteredFiles, 'README') || undefined;
        }
        if (docPath) {
          await loadDocument(docPath);
        }
      } catch (error) {
        console.error("Failed to load documentation:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDocs();
  }, [initialPath, actualMode]);

  const loadDocument = async (path: string) => {
    try {
      setLoading(true);
      setIsMoodBoardOpen(false); // Close mood board when switching documents
      
      // Check if this is a book page
      const bookPageData = await getBookPageFromPath(path);
      if (bookPageData) {
        setCurrentBookPage(bookPageData);
      } else {
        setCurrentBookPage(null);
      }
      
      const content = await loadDocumentationFile(path);
      setCurrentDoc(path);
      setRawMarkdownContent(content);
      const processed = processMarkdownContent(content);
      setMarkdownContent(processed);
      const generatedToc = generateTableOfContents(content);
      setToc(generatedToc);
      
      // Extract images from markdown
      const extractedImages = extractImagesFromMarkdown(content);
      setImages(extractedImages);
    } catch (error) {
      console.error("Failed to load document:", error);
      setMarkdownContent("# Error\n\nFailed to load document. Please try again.");
      setRawMarkdownContent("");
      setImages([]);
      setCurrentBookPage(null);
    } finally {
      setLoading(false);
    }
  };
  
  const handleNextPage = async () => {
    if (!currentBookPage) return;
    const next = getNextPage(currentBookPage.book.bookData, currentBookPage.page.pageNumber);
    if (next) {
      const nextPath = next.contentPath.replace(/^\/books\//, 'books/').replace(/\.md$/, '');
      await loadDocument(nextPath);
    }
  };
  
  const handlePreviousPage = async () => {
    if (!currentBookPage) return;
    const prev = getPreviousPage(currentBookPage.book.bookData, currentBookPage.page.pageNumber);
    if (prev) {
      const prevPath = prev.contentPath.replace(/^\/books\//, 'books/').replace(/\.md$/, '');
      await loadDocument(prevPath);
    }
  };

  useEffect(() => {
    const scrollContainer = mainContentRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const headings = document.querySelectorAll("h1, h2, h3, h4");
      let current = "";

      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 100) {
          current = heading.id;
        }
      });

      setActiveSection(current);
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [markdownContent]);

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
    setActiveSection(id);
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

  const renderTocItem = (item: TocItem, depth = 0) => {
    const isActive = activeSection === item.id;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id} className={depth > 0 ? "ml-4" : ""}>
        <button
          onClick={() => scrollToSection(item.id)}
          className={`block w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
            isActive
              ? "text-ember-glow bg-shadow border-l-2 border-ember-glow"
              : "text-text-secondary hover:text-ember-glow hover:bg-deep"
          }`}
        >
          {item.title}
        </button>
        {hasChildren && (
          <div className="mt-1 space-y-1">
            {item.children?.map((child) => renderTocItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
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
          <span className="text-text-muted">{isExpanded ? "▼" : "▶"}</span>
        </button>
        
        {isExpanded && (
          <div className="ml-4 mt-2 space-y-1">
            {category.files.map((file) => {
              const isActive = currentDoc === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => loadDocument(file.path)}
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                    isActive
                      ? "text-ember-glow bg-shadow border-l-2 border-ember-glow"
                      : "text-text-secondary hover:text-ember-glow hover:bg-deep"
                  }`}
                >
                  {file.name}
                </button>
              );
            })}
            {category.subcategories.map((sub) => renderCategory(sub, categoryPath))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full">
      {/* Sidebar Navigation */}
      <aside
        className={`${
          isSidebarOpen ? "w-80" : "w-0"
        } transition-all duration-300 overflow-hidden border-r border-border bg-shadow flex-shrink-0 relative h-full`}
      >
        {isSidebarOpen && (
          <div className="h-full overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-glow">Documentation</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-text-muted hover:text-ember-glow transition-colors p-1"
                aria-label="Collapse sidebar"
              >
                ←
              </button>
            </div>

            {/* Document Navigation */}
            <div className="mb-6 pb-6 border-b border-border">
              <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
                Documents
              </h3>
              <div className="space-y-1">
                {categories.map((category) => renderCategory(category))}
              </div>
            </div>

            {/* Table of Contents for Current Document */}
            {toc.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
                  Contents
                </h3>
                <nav className="space-y-1">
                  {toc.map((item) => renderTocItem(item))}
                </nav>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main ref={mainContentRef} className="flex-1 overflow-y-auto bg-void relative h-full documentation-scroll-area">
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute left-4 top-4 z-50 bg-ember border-2 border-ember-glow text-white p-3 rounded-lg shadow-lg hover:shadow-ember-glow/50 transition-all"
            aria-label="Open sidebar"
          >
            →
          </button>
        )}
        <div className="max-w-4xl mx-auto px-8 py-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-text-muted">Loading document...</p>
            </div>
          ) : (
            <>
              {/* Book Page Navigation */}
              {currentBookPage && (
                <div className="mb-8 pb-6 border-b border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-bold text-white mb-2">
                        {currentBookPage.book.bookData.title}
                      </h1>
                      {currentBookPage.page.chapterNumber >= 0 && (
                        <p className="text-lg text-ember-glow">
                          {currentBookPage.book.bookData.chapters.find(
                            (ch: { chapterNumber: number }) => ch.chapterNumber === currentBookPage.page.chapterNumber
                          )?.displayName || `Chapter ${currentBookPage.page.chapterNumber}`}
                        </p>
                      )}
                      <p className="text-sm text-text-muted mt-1">
                        Page {currentBookPage.page.pageNumber} of {currentBookPage.book.bookData.totalPages}
                      </p>
                    </div>
                  </div>
                  
                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={() => handlePreviousPage()}
                      disabled={!getPreviousPage(currentBookPage.book.bookData, currentBookPage.page.pageNumber)}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Previous Page
                    </button>
                    
                    <button
                      onClick={() => handleNextPage()}
                      disabled={!getNextPage(currentBookPage.book.bookData, currentBookPage.page.pageNumber)}
                      className="btn disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next Page →
                    </button>
                  </div>
                </div>
              )}
              
              <article className="documentation-content max-w-none">
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
                    
                    // Handle different path types
                    if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
                      // Full URL - use as is
                      imageSrc = imageSrc;
                    } else if (imageSrc.startsWith('/')) {
                      // Absolute path from public folder - use as is
                      imageSrc = imageSrc;
                    } else if (imageSrc.startsWith('./')) {
                      // Relative path starting with ./ - resolve relative to current document
                      if (currentBookPage) {
                        // For book pages, resolve relative to book's images folder
                        const bookBase = currentBookPage.book.bookData.basePath;
                        imageSrc = `${bookBase}/images/${imageSrc.replace(/^\.\//, '')}`;
                      } else if (currentDoc.startsWith('books/')) {
                        // Extract book path from current doc
                        const bookMatch = currentDoc.match(/^books\/([^\/]+)/);
                        if (bookMatch) {
                          imageSrc = `/books/${bookMatch[1]}/images/${imageSrc.replace(/^\.\//, '')}`;
                        } else {
                          imageSrc = `/design/${imageSrc.replace(/^\.\//, '')}`;
                        }
                      } else {
                        // Default to design folder
                        imageSrc = `/design/${imageSrc.replace(/^\.\//, '')}`;
                      }
                    } else {
                      // Relative path - resolve based on current document context
                      if (currentBookPage) {
                        const bookBase = currentBookPage.book.bookData.basePath;
                        imageSrc = `${bookBase}/images/${imageSrc}`;
                      } else if (currentDoc.startsWith('books/')) {
                        const bookMatch = currentDoc.match(/^books\/([^\/]+)/);
                        if (bookMatch) {
                          imageSrc = `/books/${bookMatch[1]}/images/${imageSrc}`;
                        } else {
                          imageSrc = `/design/${imageSrc}`;
                        }
                      } else {
                        imageSrc = `/design/${imageSrc}`;
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
                              // Fallback if image doesn't exist
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
                  strong: ({ node, ...props }) => <strong className="text-ember-glow font-bold" {...props} />,
                  em: ({ node, ...props }) => <em className="text-text-glow italic" {...props} />,
                  hr: ({ node, ...props }) => <hr className="my-8 border-border" {...props} />,
                  a: ({ node, ...props }: any) => {
                    const href = props.href || '';
                    const children = props.children || '';
                    
                    // Check if link points to a video file
                    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
                    const isVideoLink = videoExtensions.some(ext => href.toLowerCase().endsWith(ext));
                    
                    if (isVideoLink) {
                      let videoSrc = href;
                      
                      // Resolve video path similar to images
                      if (videoSrc.startsWith('http://') || videoSrc.startsWith('https://')) {
                        // Full URL - use as is
                        videoSrc = videoSrc;
                      } else if (videoSrc.startsWith('/')) {
                        // Absolute path from public folder - use as is
                        videoSrc = videoSrc;
                      } else if (videoSrc.startsWith('./')) {
                        // Relative path starting with ./ - resolve relative to current document
                        if (currentBookPage) {
                          const bookBase = currentBookPage.book.bookData.basePath;
                          videoSrc = `${bookBase}/videos/${videoSrc.replace(/^\.\//, '')}`;
                        } else if (currentDoc.startsWith('books/')) {
                          const bookMatch = currentDoc.match(/^books\/([^\/]+)/);
                          if (bookMatch) {
                            videoSrc = `/books/${bookMatch[1]}/videos/${videoSrc.replace(/^\.\//, '')}`;
                          } else {
                            videoSrc = `/design/${videoSrc.replace(/^\.\//, '')}`;
                          }
                        } else {
                          videoSrc = `/design/${videoSrc.replace(/^\.\//, '')}`;
                        }
                      } else {
                        // Relative path - resolve based on current document context
                        if (currentBookPage) {
                          const bookBase = currentBookPage.book.bookData.basePath;
                          videoSrc = `${bookBase}/videos/${videoSrc}`;
                        } else if (currentDoc.startsWith('books/')) {
                          const bookMatch = currentDoc.match(/^books\/([^\/]+)/);
                          if (bookMatch) {
                            videoSrc = `/books/${bookMatch[1]}/videos/${videoSrc}`;
                          } else {
                            videoSrc = `/design/${videoSrc}`;
                          }
                        } else {
                          videoSrc = `/design/${videoSrc}`;
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
                }}
              >
                {markdownContent}
              </ReactMarkdown>
            </article>
            </>
          )}
        </div>
      </main>

      {/* Floating Toolbar */}
      <FloatingToolbar
        imageCount={images.length}
        isMoodBoardOpen={isMoodBoardOpen}
        onToggleMoodBoard={() => setIsMoodBoardOpen(!isMoodBoardOpen)}
      />

      {/* Mood Board */}
      <MoodBoard
        images={images}
        isOpen={isMoodBoardOpen}
        onClose={() => setIsMoodBoardOpen(false)}
      />
    </div>
  );
}
