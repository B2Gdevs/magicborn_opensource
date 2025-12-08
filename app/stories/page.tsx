import { notFound } from "next/navigation";
import DocumentationViewer from "@components/DocumentationViewer";
import { ViewerMode } from "@lib/config/content-types";
import { 
  loadDocumentationFileServer, 
  getDocumentationMetadataServer,
  loadDocumentationListServer,
} from "@lib/utils/docs-loader-server";
import { processMarkdownContent, generateTableOfContents } from "@lib/utils/markdown-parser";
import { extractImagesFromMarkdown } from "@lib/utils/image-extractor";
import { filterFilesByMode } from "@lib/utils/content-validator";
import { organizeByCategory } from "@lib/utils/docs-loader";

// Enable static generation
export const dynamicParams = false;
export const revalidate = 3600;

interface StoriesPageProps {
  searchParams: Promise<{ page?: string; book?: string }>;
}

export default async function StoriesPage({ searchParams }: StoriesPageProps) {
  const params = await searchParams;
  
  try {
    // Load file list and filter to only books
    const allFiles = await loadDocumentationListServer();
    const bookFiles = filterFilesByMode(allFiles, ViewerMode.BOOKS);
    
    // Find first book file (alphabetically, first file in first folder)
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
    
    const firstBookPath = findFirstFile(bookFiles);
    
    if (!firstBookPath) {
      notFound();
    }

    // Ensure path doesn't already have /books/ prefix
    const cleanPath = firstBookPath.startsWith('books/') 
      ? firstBookPath 
      : `books/${firstBookPath}`;

    // Load document content server-side
    const content = await loadDocumentationFileServer(cleanPath);
    const processed = processMarkdownContent(content);
    const toc = generateTableOfContents(content);
    const images = extractImagesFromMarkdown(content);
    const metadata = await getDocumentationMetadataServer(cleanPath);

    // Organize book files for sidebar (already loaded above)
    const bookCategories = organizeByCategory(bookFiles);

    // Render directly instead of redirecting
    return (
      <main className="ml-64 mt-16 h-[calc(100vh-4rem)] bg-void text-text-primary overflow-hidden">
        <DocumentationViewer
          initialPath={cleanPath}
          mode={ViewerMode.BOOKS}
          initialContent={content}
          initialProcessedContent={processed}
          initialToc={toc}
          initialImages={images}
          initialMetadata={metadata}
          initialFiles={bookFiles}
          initialCategories={bookCategories}
          currentPath={`/books/${cleanPath}`}
        />
      </main>
    );
  } catch (error) {
    console.error("Error loading stories page:", error);
    notFound();
  }
}
