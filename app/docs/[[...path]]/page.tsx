import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import DocumentationViewer from "@components/DocumentationViewer";
import { ViewerMode } from "@lib/config/content-types";
import { 
  loadDocumentationFileServer, 
  getDocumentationMetadataServer,
  loadDocumentationListServer,
  getOrganizedCategoriesServer
} from "@lib/utils/docs-loader-server";
import { organizeByCategory } from "@lib/utils/docs-loader";
import { getDefaultDocument } from "@lib/utils/docs-loader";
import { processMarkdownContent, generateTableOfContents } from "@lib/utils/markdown-parser";
import { extractImagesFromMarkdown } from "@lib/utils/image-extractor";
import { getBookPageFromPathServer, getAllPages, getPageByNumber, loadBooksFromFileSystemServer } from "@lib/utils/book-scanner-server";
import { validateContentAccess, filterFilesByMode, getDefaultDocumentForMode } from "@lib/utils/content-validator";

// Enable static generation for customer-facing documentation
// Allow dynamic params for book pages that might not be in the static list
export const dynamicParams = true; // Allow dynamic generation for book pages
export const revalidate = 3600; // Revalidate every hour (ISR - Incremental Static Regeneration)

interface DocPageProps {
  params: Promise<{ path?: string[] }>;
  searchParams: Promise<{ mode?: string }>;
}

// Generate static params for all documentation pages at build time
export async function generateStaticParams() {
  try {
    const files = await loadDocumentationListServer();
    const params: { path?: string[] }[] = [];
    
    // Add root path (will redirect to default)
    params.push({ path: [] });
    
    // Add all documentation files
    function collectPaths(fileList: typeof files, basePath: string[] = []) {
      for (const file of fileList) {
        if (!file.isDirectory) {
          const pathSegments = file.path.split('/');
          params.push({ path: pathSegments });
        } else if (file.children) {
          collectPaths(file.children, [...basePath, file.name]);
        }
      }
    }
    
    collectPaths(files);
    
    // Also add all book pages from book scanner
    try {
      const books = await loadBooksFromFileSystemServer();
      for (const book of books) {
        const pages = getAllPages(book);
        for (const page of pages) {
          // Convert contentPath to route path
          // contentPath: /books/mordreds_tale/chapters/00-prologue/001-page-1.md
          // route path: books/mordreds_tale/chapters/00-prologue/001-page-1
          const routePath = page.contentPath
            .replace(/^\/books\//, 'books/')
            .replace(/\.md$/, '');
          const pathSegments = routePath.split('/');
          params.push({ path: pathSegments });
        }
      }
    } catch (bookError) {
      console.error("Error loading books for static params:", bookError);
      // Continue without book pages - they'll be generated dynamically
    }
    
    return params;
  } catch (error) {
    console.error("Error generating static params:", error);
    return [{ path: [] }]; // At least generate the root
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params, searchParams }: DocPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const pathSegments = resolvedParams.path || [];
  const docPath = pathSegments.length > 0 ? pathSegments.join('/') : undefined;
  const mode = resolvedSearchParams.mode as ViewerMode | undefined;

  try {
    // Determine mode
    const actualMode = mode || 
      (docPath?.startsWith("books/") ? ViewerMode.BOOKS : 
       docPath?.startsWith("developer/") ? ViewerMode.DEVELOPER : 
       ViewerMode.DESIGN);

    // Load file list to find the document
    const files = await loadDocumentationListServer();
    
    // Filter files based on mode
    let filteredFiles = files;
    if (actualMode === ViewerMode.DESIGN) {
      filteredFiles = files.filter(f => 
        f.category === "design" || f.path.startsWith("design/")
      );
    } else if (actualMode === ViewerMode.BOOKS) {
      filteredFiles = files.filter(f => 
        f.category === "books" || f.path.startsWith("books/")
      );
    } else if (actualMode === ViewerMode.DEVELOPER) {
      filteredFiles = files.filter(f => 
        f.category === "developer" || f.path.startsWith("developer/")
      );
    }

    // Get the document path
    let targetPath = docPath;
    if (!targetPath || targetPath.endsWith('/')) {
      targetPath = getDefaultDocument(filteredFiles, 'README') || undefined;
    }

    if (!targetPath) {
      return {
        title: "Documentation | Magicborn",
        description: "Magicborn game documentation, design guides, and developer resources",
      };
    }

    // Load the document content
    const content = await loadDocumentationFileServer(targetPath);
    const processed = processMarkdownContent(content);
    
    // Extract title from markdown (first h1 or first line)
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : targetPath.split('/').pop() || "Documentation";
    
    // Extract description (first paragraph after title, or first 160 chars)
    // Remove the title line and get the first paragraph
    const contentWithoutTitle = content.replace(/^#\s+.+$/m, '').trim();
    const descriptionMatch = contentWithoutTitle.match(/^[^\n#]+/m);
    const description = descriptionMatch 
      ? descriptionMatch[0].substring(0, 160).trim()
      : `Documentation page: ${title}`;

    // Get metadata
    const metadata = await getDocumentationMetadataServer(targetPath);

    return {
      title: `${title} | Magicborn Documentation`,
      description,
      openGraph: {
        title: `${title} | Magicborn Documentation`,
        description,
        type: "article",
        ...(metadata && {
          publishedTime: metadata.created.toISOString(),
          modifiedTime: metadata.modified.toISOString(),
        }),
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | Magicborn Documentation`,
        description,
      },
      ...(metadata && {
        other: {
          "article:published_time": metadata.created.toISOString(),
          "article:modified_time": metadata.modified.toISOString(),
        },
      }),
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Documentation | Magicborn",
      description: "Magicborn game documentation",
    };
  }
}

export default async function DocPage({ params, searchParams }: DocPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const pathSegments = resolvedParams.path || [];
  const docPath = pathSegments.length > 0 ? pathSegments.join('/') : undefined;
  const mode = resolvedSearchParams.mode as ViewerMode | undefined;

  // If no path specified, determine default based on mode
  if (!docPath) {
    // For books mode, always redirect to first book page immediately
    if (mode === ViewerMode.BOOKS) {
      try {
        const books = await loadBooksFromFileSystemServer();
        if (books.length > 0) {
          const firstBook = books[0];
          const firstPage = getPageByNumber(firstBook, 1);
          if (firstPage) {
            // contentPath is like /books/mordreds_tale/chapters/00-prologue/001-page-1.md
            // We need: books/mordreds_tale/chapters/00-prologue/001-page-1
            const bookPath = firstPage.contentPath
              .replace(/^\/books\//, 'books/')
              .replace(/\.md$/, '');
            // Use redirect with replace to avoid redirect loops
            redirect(`/docs/${bookPath}?mode=books`);
          }
        }
        // If no books or pages found, show not found instead of redirect loop
        notFound();
      } catch (error) {
        console.error("Error loading books:", error);
        // On error, show not found instead of redirect loop
        notFound();
      }
    }
    
    // For other modes, get default document
    try {
      const files = await loadDocumentationListServer();
      const actualMode = mode || ViewerMode.DESIGN;
      
      // Filter files based on mode
      let filteredFiles = files;
      if (actualMode === ViewerMode.DESIGN) {
        filteredFiles = files.filter(f => 
          (f.category === "design" || f.path.startsWith("design/")) &&
          !f.path.startsWith("books/") &&
          !f.path.startsWith("developer/")
        );
      } else if (actualMode === ViewerMode.DEVELOPER) {
        filteredFiles = files.filter(f => 
          f.category === "developer" || f.path.startsWith("developer/")
        );
      }
      
      // Get default document for the filtered files
      const defaultDoc = getDefaultDocument(filteredFiles, 'README');
      if (defaultDoc) {
        redirect(`/docs/${defaultDoc}?mode=${actualMode}`);
      }
    } catch (error) {
      console.error("Error loading default document:", error);
    }
  }

  try {
    // Determine mode
    const actualMode = mode || 
      (docPath?.startsWith("books/") ? ViewerMode.BOOKS : 
       docPath?.startsWith("developer/") ? ViewerMode.DEVELOPER : 
       ViewerMode.DESIGN);

    // Load file list
    const files = await loadDocumentationListServer();
    
    // Filter files based on mode using strict validation
    const filteredFiles = filterFilesByMode(files, actualMode);

    // Get the document path
    let targetPath = docPath;
    if (!targetPath || targetPath.endsWith('/')) {
      targetPath = getDefaultDocumentForMode(filteredFiles, actualMode) || undefined;
    }

    if (!targetPath) {
      notFound();
    }
    
    // Validate access before loading
    // For books, be more lenient since they might not be in the file list
    if (actualMode === ViewerMode.BOOKS && targetPath.startsWith('books/')) {
      // Skip strict validation for book paths - they're handled by book scanner
      // Just verify the path format is correct
      if (!targetPath.match(/^books\/[^/]+\/chapters\/[^/]+\/[^/]+$/)) {
        console.warn(`Invalid book path format: ${targetPath}`);
      }
    } else {
      // For other modes, use strict validation
      validateContentAccess(targetPath, actualMode);
    }

    // Load document content server-side (with mode validation)
    const content = await loadDocumentationFileServer(targetPath, actualMode);
    const processed = processMarkdownContent(content);
    const toc = generateTableOfContents(content);
    const images = extractImagesFromMarkdown(content);
    
    // Extract title and description for structured data
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : targetPath.split('/').pop() || "Documentation";
    const contentWithoutTitle = content.replace(/^#\s+.+$/m, '').trim();
    const descriptionMatch = contentWithoutTitle.match(/^[^\n#]+/m);
    const description = descriptionMatch 
      ? descriptionMatch[0].substring(0, 160).trim()
      : `Documentation page: ${title}`;
    
    // Get metadata
    const metadata = await getDocumentationMetadataServer(targetPath);
    
    // Load file list for sidebar (server-side)
    const allFiles = await loadDocumentationListServer();
    const filteredFilesForSidebar = filterFilesByMode(allFiles, actualMode);
    const categoriesForSidebar = organizeByCategory(filteredFilesForSidebar);
    
    // Check if this is a book page (server-side)
    const bookPageDataRaw = await getBookPageFromPathServer(targetPath);
    // Convert to the format expected by DocumentationViewer
    const bookPageData = bookPageDataRaw ? {
      book: {
        bookId: bookPageDataRaw.book.id,
        bookData: bookPageDataRaw.book,
        pages: getAllPages(bookPageDataRaw.book),
        stories: bookPageDataRaw.book.stories,
      },
      page: bookPageDataRaw.page,
    } : null;

    // Generate structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description: description,
      ...(metadata && {
        datePublished: metadata.created.toISOString(),
        dateModified: metadata.modified.toISOString(),
      }),
      author: {
        "@type": "Organization",
        name: "Magicborn",
      },
      publisher: {
        "@type": "Organization",
        name: "Magicborn",
      },
    };

    // Pass pre-loaded content to client component
    return (
      <>
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        )}
        <main className="ml-64 mt-16 h-[calc(100vh-4rem)] bg-void text-text-primary overflow-hidden">
          <DocumentationViewer
            initialPath={targetPath}
            mode={actualMode}
            initialContent={content}
            initialProcessedContent={processed}
            initialToc={toc}
            initialImages={images}
            initialMetadata={metadata}
            initialBookPage={bookPageData}
            initialFiles={filteredFilesForSidebar}
            initialCategories={categoriesForSidebar}
            currentPath={`/docs/${targetPath}${actualMode !== ViewerMode.AUTO ? `?mode=${actualMode}` : ''}`}
          />
        </main>
      </>
    );
  } catch (error) {
    console.error("Error loading documentation:", error);
    notFound();
  }
}

