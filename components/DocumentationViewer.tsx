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
  getDefaultDocument,
  type DocFile,
  type DocCategory 
} from "@lib/utils/docs-loader";
import { filterFilesByMode, getDefaultDocumentForMode } from "@lib/utils/content-validator";
import { getReadingMode } from "@lib/config/content-types";
import { 
  getBookPageFromPath,
  type BookDocument 
} from "@lib/utils/book-integration";
import { getNextPage, getPreviousPage, type BookPage } from "@lib/utils/book-scanner";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { RotateCw } from "lucide-react";
import MoodBoard from "@components/MoodBoard";
import FloatingToolbar from "@components/FloatingToolbar";
import VideoPlayer from "@components/VideoPlayer";
import { ViewerMode } from "@lib/config/content-types";

// Re-export for backward compatibility
export { ViewerMode };

interface DocumentationViewerProps {
  initialPath?: string;
  mode?: ViewerMode; // DESIGN shows only design docs, BOOKS shows only books, AUTO detects from path
  // Pre-loaded content (for server-side rendering / SEO)
  initialContent?: string; // Raw markdown content
  initialProcessedContent?: string; // Processed markdown content
  initialToc?: TocItem[]; // Pre-generated table of contents
  initialImages?: ExtractedImage[]; // Pre-extracted images
  initialMetadata?: { created: Date; modified: Date } | null; // File metadata
  initialBookPage?: { book: BookDocument; page: BookPage } | null; // Book page data
  initialFiles?: DocFile[]; // Pre-loaded file list for sidebar (server-side)
  initialCategories?: DocCategory[]; // Pre-organized categories for sidebar (server-side)
  currentPath?: string; // Current pathname for active state (server-side)
  embedded?: boolean; // If true, don't navigate away (for drawer/iframe use)
}

export default function DocumentationViewer({ 
  initialPath, 
  mode = ViewerMode.AUTO,
  initialContent,
  initialProcessedContent,
  initialToc,
  initialImages,
  initialMetadata,
  initialBookPage,
  initialFiles,
  initialCategories,
  currentPath: initialCurrentPath,
  embedded = false,
}: DocumentationViewerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [toc, setToc] = useState<TocItem[]>(initialToc || []);
  const [markdownContent, setMarkdownContent] = useState<string>(initialProcessedContent || "");
  const [rawMarkdownContent, setRawMarkdownContent] = useState<string>(initialContent || "");
  const [images, setImages] = useState<ExtractedImage[]>(initialImages || []);
  const [activeSection, setActiveSection] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMoodBoardOpen, setIsMoodBoardOpen] = useState(false);
  const [currentDoc, setCurrentDoc] = useState<string>(initialPath || "");
  const [docFiles, setDocFiles] = useState<DocFile[]>(initialFiles || []);
  const [categories, setCategories] = useState<DocCategory[]>(initialCategories || []);
  const [loading, setLoading] = useState(!initialContent); // If we have initial content, we're not loading
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => {
    // Initialize with all categories expanded if we have initial categories
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
  const mainContentRef = useRef<HTMLElement>(null);
  
  // Book mode state
  const [currentBookPage, setCurrentBookPage] = useState<{ book: BookDocument; page: BookPage } | null>(initialBookPage || null);
  
  // File metadata state
  const [fileMetadata, setFileMetadata] = useState<{ created: Date; modified: Date } | null>(initialMetadata || null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Refresh state
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Determine actual mode based on prop or path
  const actualMode: ViewerMode.DESIGN | ViewerMode.BOOKS | ViewerMode.DEVELOPER = mode === ViewerMode.AUTO 
    ? (initialPath?.startsWith("books/") ? ViewerMode.BOOKS : initialPath?.startsWith("developer/") ? ViewerMode.DEVELOPER : ViewerMode.DESIGN)
    : mode;
  
  // Get reading mode for special UI treatment (books get "fun" reading experience)
  const readingMode = initialPath ? getReadingMode(initialPath) : "documentation";

  // Function to check if a document exists in the file tree
  const docExistsInFiles = (docPath: string, files: DocFile[]): boolean => {
    for (const file of files) {
      if (file.path === docPath) return true;
      if (file.isDirectory && file.children) {
        if (docExistsInFiles(docPath, file.children)) return true;
      }
    }
    return false;
  };

  // Load documentation structure (only if not provided as initial props)
  useEffect(() => {
    // If we already have initial files/categories, skip loading
    if (initialFiles && initialCategories) {
      return;
    }

    async function loadDocs() {
      try {
        const files = await loadDocumentationList();
        setDocFiles(files);
        
        // Filter files based on mode using strict validation
        const filteredFiles = filterFilesByMode(files, actualMode);
        
        const organized = organizeByCategory(filteredFiles);
        setCategories(organized);
        
        // Expand all categories by default
        const allCategoryNames = new Set<string>();
        organized.forEach(cat => {
          allCategoryNames.add(cat.name);
          cat.subcategories.forEach(sub => allCategoryNames.add(`${cat.name}/${sub.name}`));
        });
        setExpandedCategories(allCategoryNames);
        
        // Only load document if we don't have initial content
        if (!initialContent) {
          let docPath = initialPath;
          if (!docPath || docPath.endsWith('/')) {
            // For books mode, try to load first book page first
            if (actualMode === ViewerMode.BOOKS) {
              try {
                const { loadBooksFromFileSystem, getPageByNumber } = await import("@lib/utils/book-scanner");
                const books = await loadBooksFromFileSystem();
                if (books.length > 0) {
                  const firstBook = books[0];
                  const firstPage = getPageByNumber(firstBook, 1);
                  if (firstPage) {
                    docPath = firstPage.contentPath.replace(/^\/books\//, 'books/').replace(/\.md$/, '');
                  }
                }
              } catch (error) {
                console.error("Error loading default book:", error);
              }
            }
            
            // If still no path, use default document from filtered files
            // This ensures we only get documents that match the current mode
            if (!docPath) {
              docPath = getDefaultDocumentForMode(filteredFiles, actualMode) || undefined;
            }
          }
          if (docPath) {
            await loadDocument(docPath);
          }
        }
      } catch (error) {
        console.error("Failed to load documentation:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDocs();
  }, [initialPath, actualMode, initialContent, initialFiles, initialCategories]);

  // Update content when pathname changes (for client-side navigation via Link)
  useEffect(() => {
    const currentPath = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');
    if (currentPath) {
      // Extract path from URL for docs or books routes
      const pathMatch = currentPath.match(/\/(?:docs|books)\/(.+?)(?:\?|$)/);
      if (pathMatch && pathMatch[1]) {
        let docPath = pathMatch[1];
        
        // If we're on /books route, add "books/" prefix to match file.path format
        // If we're on /docs route, determine prefix based on mode
        if (currentPath.startsWith('/books/')) {
          docPath = `books/${docPath}`;
        } else if (currentPath.startsWith('/docs/')) {
          // For /docs, we need to determine the prefix based on the actual mode
          if (actualMode === ViewerMode.DESIGN && !docPath.startsWith('design/')) {
            docPath = `design/${docPath}`;
          } else if (actualMode === ViewerMode.DEVELOPER && !docPath.startsWith('developer/')) {
            docPath = `developer/${docPath}`;
          }
        }
        
        if (docPath !== currentDoc) {
          // Only load if we don't have initial content (to avoid double loading)
          // This handles client-side navigation via Next.js Link
          loadDocument(docPath);
        }
      }
    }
  }, [pathname, currentDoc]);

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
      
      // Load file metadata
      try {
        const metadataResponse = await fetch(`/api/docs/metadata?path=${encodeURIComponent(path)}`);
        if (metadataResponse.ok) {
          const metadata = await metadataResponse.json();
          setFileMetadata({
            created: new Date(metadata.created),
            modified: new Date(metadata.modified),
          });
        } else {
          setFileMetadata(null);
        }
      } catch (error) {
        console.error("Failed to load file metadata:", error);
        setFileMetadata(null);
      }
    } catch (error) {
      console.error("Failed to load document:", error);
      setMarkdownContent("# Error\n\nFailed to load document. Please try again.");
      setRawMarkdownContent("");
      setImages([]);
      setCurrentBookPage(null);
      setFileMetadata(null);
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh documentation list
  const refreshDocumentation = async () => {
    setIsRefreshing(true);
    try {
      const files = await loadDocumentationList();
      setDocFiles(files);
      
      // Filter files based on mode using strict validation
      const filteredFiles = filterFilesByMode(files, actualMode);
      
      const organized = organizeByCategory(filteredFiles);
      setCategories(organized);
      
      // Expand all categories by default
      const allCategoryNames = new Set<string>();
      organized.forEach(cat => {
        allCategoryNames.add(cat.name);
        cat.subcategories.forEach(sub => allCategoryNames.add(`${cat.name}/${sub.name}`));
      });
      setExpandedCategories(allCategoryNames);
      
      // Reload current document if it still exists
      const currentDocPath = currentDoc;
      if (currentDocPath) {
        // Check if the current document still exists in the new file list
        if (docExistsInFiles(currentDocPath, filteredFiles)) {
          // Reload the current document to get any updates
          await loadDocument(currentDocPath);
        }
      }
    } catch (error) {
      console.error("Failed to refresh documentation:", error);
    } finally {
      setIsRefreshing(false);
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

  // Filter categories and files based on search query
  const filterCategory = (category: DocCategory, query: string): DocCategory | null => {
    const lowerQuery = query.toLowerCase();
    
    // Filter files
    const filteredFiles = category.files.filter(file => 
      file.name.toLowerCase().includes(lowerQuery) || 
      file.path.toLowerCase().includes(lowerQuery)
    );
    
    // Filter subcategories recursively
    const filteredSubcategories = category.subcategories
      .map(sub => filterCategory(sub, query))
      .filter((sub): sub is DocCategory => sub !== null);
    
    // Check if category name matches
    const categoryMatches = category.name.toLowerCase().includes(lowerQuery);
    
    // If there are matching files, subcategories, or category name matches, return filtered category
    if (filteredFiles.length > 0 || filteredSubcategories.length > 0 || categoryMatches) {
      return {
        ...category,
        files: filteredFiles,
        subcategories: filteredSubcategories,
      };
    }
    
    return null;
  };

  // Highlight matching text in a string
  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);
    
    if (index === -1) return text;
    
    const before = text.substring(0, index);
    const match = text.substring(index, index + query.length);
    const after = text.substring(index + query.length);
    
    return (
      <>
        {before}
        <span className="bg-ember-glow/30 text-ember-glow font-semibold">{match}</span>
        {after}
      </>
    );
  };

  // Get filtered categories based on search
  const filteredCategories = searchQuery
    ? categories
        .map(cat => filterCategory(cat, searchQuery))
        .filter((cat): cat is DocCategory => cat !== null)
    : categories;

  // Auto-expand categories with matches when searching
  useEffect(() => {
    if (searchQuery) {
      const categoriesWithMatches = new Set<string>();
      
      // Compute filtered categories for this effect
      const filtered = categories
        .map(cat => filterCategory(cat, searchQuery))
        .filter((cat): cat is DocCategory => cat !== null);
      
      const collectMatchingCategories = (cats: DocCategory[], parentPath = "") => {
        cats.forEach(cat => {
          const categoryPath = parentPath ? `${parentPath}/${cat.name}` : cat.name;
          if (cat.files.length > 0 || cat.subcategories.length > 0) {
            categoriesWithMatches.add(categoryPath);
            collectMatchingCategories(cat.subcategories, categoryPath);
          }
        });
      };
      
      collectMatchingCategories(filtered);
      setExpandedCategories(categoriesWithMatches);
    } else {
      // When search is cleared, restore default expanded state
      const allCategoryNames = new Set<string>();
      categories.forEach(cat => {
        allCategoryNames.add(cat.name);
        cat.subcategories.forEach(sub => allCategoryNames.add(`${cat.name}/${sub.name}`));
      });
      setExpandedCategories(allCategoryNames);
    }
  }, [searchQuery, categories]);

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

  // Get the base route for navigation based on mode
  const getBaseRoute = () => {
    if (actualMode === ViewerMode.BOOKS) return "/books";
    if (actualMode === ViewerMode.DESIGN) return "/docs";
    if (actualMode === ViewerMode.DEVELOPER) return "/docs";
    return "/docs";
  };

  // Normalize file path by removing base folder prefix if present
  const normalizeFilePath = (filePath: string, mode: ViewerMode): string => {
    // Remove base folder prefix if it exists (e.g., "books/" or "design/" or "developer/")
    if (mode === ViewerMode.BOOKS && filePath.startsWith("books/")) {
      return filePath.replace(/^books\//, "");
    }
    if (mode === ViewerMode.DESIGN && filePath.startsWith("design/")) {
      return filePath.replace(/^design\//, "");
    }
    if (mode === ViewerMode.DEVELOPER && filePath.startsWith("developer/")) {
      return filePath.replace(/^developer\//, "");
    }
    return filePath;
  };

  const renderCategory = (category: DocCategory, parentPath = "") => {
    const categoryPath = parentPath ? `${parentPath}/${category.name}` : category.name;
    const isExpanded = expandedCategories.has(categoryPath);
    const hasContent = category.files.length > 0 || category.subcategories.length > 0;

    if (!hasContent) return null;

    const categoryNameMatches = searchQuery && category.name.toLowerCase().includes(searchQuery.toLowerCase());
    const baseRoute = getBaseRoute();
    // Only add mode param for /docs route, not for /books (which has its own route)
    const modeParam = (mode !== ViewerMode.AUTO && baseRoute === "/docs") ? `?mode=${actualMode}` : "";

    return (
      <div key={categoryPath} className="mb-4">
        <button
          onClick={() => toggleCategory(categoryPath)}
          className="flex items-center justify-between w-full px-3 py-2 text-left text-sm font-semibold text-glow hover:bg-deep rounded-lg transition-colors"
        >
          <span className="capitalize">
            {searchQuery ? highlightText(category.name, searchQuery) : category.name}
          </span>
          <span className={`text-text-muted transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
            ▶
          </span>
        </button>
        {isExpanded && (
          <div className="ml-4 mt-2 space-y-1">
            {category.files.map((file) => {
              // Normalize file path to remove base folder prefix
              const normalizedPath = normalizeFilePath(file.path, actualMode);
              const fileUrl = `${baseRoute}/${normalizedPath}${modeParam}`;
              // Determine active state from URL pathname
              const currentPathValue = initialCurrentPath || pathname || (typeof window !== 'undefined' ? window.location.pathname : '');
              const currentPathWithoutQuery = currentPathValue.split('?')[0];
              const fileUrlWithoutQuery = fileUrl.split('?')[0];
              const isActive = currentPathWithoutQuery === fileUrlWithoutQuery || 
                               currentPathWithoutQuery === `/${normalizedPath}` || 
                               currentPathWithoutQuery.includes(`/${normalizedPath}`) ||
                               currentDoc === file.path;
              
              // In embedded mode, use button instead of Link to avoid navigation
              if (embedded) {
                return (
                  <button
                    key={file.path}
                    onClick={() => {
                      // Load document without navigating
                      setCurrentDoc(file.path);
                      loadDocument(file.path);
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                      isActive
                        ? "text-ember-glow bg-shadow border-l-2 border-ember-glow"
                        : "text-text-secondary hover:text-ember-glow hover:bg-deep"
                    }`}
                  >
                    {searchQuery ? highlightText(file.name, searchQuery) : file.name}
                  </button>
                );
              }
              
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
                    // Update local state immediately for instant UI feedback
                    setCurrentDoc(file.path);
                  }}
                >
                  {searchQuery ? highlightText(file.name, searchQuery) : file.name}
                </Link>
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
              <div className="flex items-center gap-2">
                <button
                  onClick={refreshDocumentation}
                  disabled={isRefreshing}
                  className="text-text-muted hover:text-ember-glow transition-colors p-1.5 rounded hover:bg-deep disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Refresh documentation list"
                  title="Refresh documentation list"
                >
                  <RotateCw 
                    className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
                  />
                </button>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="text-text-muted hover:text-ember-glow transition-colors p-1"
                  aria-label="Collapse sidebar"
                >
                  ←
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-deep border border-border rounded-lg text-text-secondary placeholder-text-muted focus:outline-none focus:border-ember-glow focus:ring-1 focus:ring-ember-glow transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-2 text-xs text-text-muted hover:text-ember-glow transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>

            {/* Document Navigation */}
            <div className="mb-6 pb-6 border-b border-border">
              <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
                Documents
              </h3>
              {filteredCategories.length === 0 && searchQuery ? (
                <div className="text-sm text-text-muted py-4 text-center">
                  No documents found matching "{searchQuery}"
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredCategories.map((category) => renderCategory(category))}
                </div>
              )}
            </div>

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
        {/* File Metadata */}
        {fileMetadata && !loading && (
          <div className="absolute top-4 right-4 z-40 bg-shadow/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-xs text-text-muted">
            <div className="space-y-1">
              <div>
                <span className="text-text-secondary">Created: </span>
                <span className="text-ember-glow">
                  {formatDateForDisplay(fileMetadata.created)}
                </span>
              </div>
              <div>
                <span className="text-text-secondary">Updated: </span>
                <span className="text-ember-glow">
                  {formatDateForDisplay(fileMetadata.modified)}
                </span>
              </div>
            </div>
          </div>
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
              
              <article className={`documentation-content max-w-none ${
                readingMode === "book" ? "book-reading-mode" : ""
              }`}>
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
                  p: ({ node, ...props }: any) => {
                    // Check if paragraph contains a video link
                    // If so, render as div to avoid hydration error (<figure> can't be in <p>)
                    const nodeChildren = node?.children || [];
                    const hasVideoLink = nodeChildren.some((child: any) => {
                      if (child.type === 'link' || child.type === 'linkReference') {
                        const href = child.url || child.href || '';
                        const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.m4v'];
                        return videoExtensions.some(ext => href.toLowerCase().endsWith(ext));
                      }
                      return false;
                    });

                    // Also check props.children for rendered links (more reliable)
                    const propsChildren = props.children;
                    let hasVideoInProps = false;
                    if (React.isValidElement(propsChildren)) {
                      const childProps = propsChildren.props as any;
                      if (propsChildren.type === 'a' && typeof childProps?.href === 'string') {
                        const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.m4v'];
                        hasVideoInProps = videoExtensions.some(ext => 
                          childProps.href.toLowerCase().endsWith(ext)
                        );
                      }
                    }

                    if (hasVideoLink || hasVideoInProps) {
                      // Render as div instead of p to allow block-level children (VideoPlayer with <figure>)
                      return (
                        <div className={`mb-6 leading-relaxed ${
                          readingMode === "book" 
                            ? "text-text-primary text-lg leading-loose" 
                            : "text-text-secondary"
                        }`} {...props} />
                      );
                    }

                    return (
                      <p className={`mb-6 leading-relaxed ${
                        readingMode === "book" 
                          ? "text-text-primary text-lg leading-loose" 
                          : "text-text-secondary"
                      }`} {...props} />
                    );
                  },
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
