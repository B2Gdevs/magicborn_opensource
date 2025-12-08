import { Metadata } from "next";
import { notFound } from "next/navigation";
import DocumentationViewer from "@components/DocumentationViewer";
import { ViewerMode } from "@lib/config/content-types";
import { 
  loadDocumentationFileServer, 
  getDocumentationMetadataServer,
  loadDocumentationListServer,
  getOrganizedCategoriesServer,
} from "@lib/utils/docs-loader-server";
import { processMarkdownContent, generateTableOfContents } from "@lib/utils/markdown-parser";
import { extractImagesFromMarkdown } from "@lib/utils/image-extractor";
import { filterFilesByMode } from "@lib/utils/content-validator";
import { organizeByCategory } from "@lib/utils/docs-loader";

// Enable static generation
export const dynamicParams = true;
export const revalidate = 3600;

interface BookPageProps {
  params: Promise<{ path?: string[] }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Generate static params for all book pages
export async function generateStaticParams() {
  try {
    const files = await loadDocumentationListServer();
    // Filter to only books
    const bookFiles = files.filter(f => 
      f.category === "books" || f.path.startsWith("books/")
    );
    
    const params: { path?: string[] }[] = [];
    params.push({ path: [] }); // Root
    
    function collectPaths(fileList: typeof bookFiles, basePath: string[] = []) {
      for (const file of fileList) {
        if (!file.isDirectory) {
          // Remove "books/" prefix from path for URL segments
          let pathWithoutPrefix = file.path;
          if (pathWithoutPrefix.startsWith('books/')) {
            pathWithoutPrefix = pathWithoutPrefix.replace(/^books\//, '');
          }
          const pathSegments = pathWithoutPrefix.split('/');
          params.push({ path: pathSegments });
        } else if (file.children) {
          collectPaths(file.children, [...basePath, file.name]);
        }
      }
    }
    
    collectPaths(bookFiles);
    return params;
  } catch (error) {
    console.error("Error generating static params for books:", error);
    return [{ path: [] }];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const pathSegments = resolvedParams.path || [];
  let docPath = pathSegments.length > 0 ? pathSegments.join('/') : undefined;

  try {
    if (!docPath) {
      return {
        title: "Books & Stories | Magicborn",
        description: "Read the stories and books of Magicborn: Mordred's Legacy",
      };
    }

    // Add "books/" prefix if missing (URL paths don't include it)
    if (!docPath.startsWith('books/')) {
      docPath = `books/${docPath}`;
    }

    const content = await loadDocumentationFileServer(docPath);
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : docPath.split('/').pop() || "Book";
    const contentWithoutTitle = content.replace(/^#\s+.+$/m, '').trim();
    const descriptionMatch = contentWithoutTitle.match(/^[^\n#]+/m);
    const description = descriptionMatch 
      ? descriptionMatch[0].substring(0, 160).trim()
      : `Read: ${title}`;

    return {
      title: `${title} | Magicborn Books`,
      description,
      openGraph: {
        title: `${title} | Magicborn Books`,
        description,
        type: "article",
      },
    };
  } catch (error) {
    return {
      title: "Books & Stories | Magicborn",
      description: "Read the stories and books of Magicborn: Mordred's Legacy",
    };
  }
}

export default async function BookPage({ params }: BookPageProps) {
  const resolvedParams = await params;
  const pathSegments = resolvedParams.path || [];
  const docPath = pathSegments.length > 0 ? pathSegments.join('/') : undefined;

  try {
    // Load file list and filter to only books
    const files = await loadDocumentationListServer();
    const bookFiles = filterFilesByMode(files, ViewerMode.BOOKS);

    // Get the document path
    let targetPath = docPath;
    if (!targetPath || targetPath.endsWith('/')) {
      // Find first book file
      function findFirstFile(fileList: typeof bookFiles): string | null {
        for (const file of fileList) {
          if (!file.isDirectory) {
            return file.path;
          } else if (file.children) {
            const found = findFirstFile(file.children);
            if (found) return found;
          }
        }
        return null;
      }
      
      targetPath = findFirstFile(bookFiles) || null;
    }

    if (!targetPath) {
      notFound();
    }

    // Ensure it's a book path - add "books/" prefix if missing
    if (!targetPath.startsWith('books/')) {
      targetPath = `books/${targetPath}`;
    }

    // Load document content server-side
    const content = await loadDocumentationFileServer(targetPath);
    const processed = processMarkdownContent(content);
    const toc = generateTableOfContents(content);
    const images = extractImagesFromMarkdown(content);
    
    // Extract title and description
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : targetPath.split('/').pop() || "Book";
    const contentWithoutTitle = content.replace(/^#\s+.+$/m, '').trim();
    const descriptionMatch = contentWithoutTitle.match(/^[^\n#]+/m);
    const description = descriptionMatch 
      ? descriptionMatch[0].substring(0, 160).trim()
      : `Read: ${title}`;
    
    // Get metadata
    const metadata = await getDocumentationMetadataServer(targetPath);

    // Organize book files for sidebar (already loaded above)
    const bookCategories = organizeByCategory(bookFiles);

    // Generate structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Book",
      name: title,
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

    // Remove "books/" prefix for URL
    const urlPath = targetPath.startsWith('books/') ? targetPath.replace(/^books\//, '') : targetPath;

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
            mode={ViewerMode.BOOKS}
            initialContent={content}
            initialProcessedContent={processed}
            initialToc={toc}
            initialImages={images}
            initialMetadata={metadata}
            initialFiles={bookFiles}
            initialCategories={bookCategories}
            currentPath={`/books/${urlPath}`}
          />
        </main>
      </>
    );
  } catch (error) {
    console.error("Error loading book page:", error);
    notFound();
  }
}

