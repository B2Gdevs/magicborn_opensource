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
import { filterFilesByMode, getDefaultDocumentForMode } from "@lib/utils/content-validator";
import { organizeByCategory } from "@lib/utils/docs-loader";

// Enable static generation
export const dynamicParams = false;
export const revalidate = 3600;

export default async function StyleGuidePage() {
  try {
    // Load file list and filter to only design docs
    const allFiles = await loadDocumentationListServer();
    const designFiles = filterFilesByMode(allFiles, ViewerMode.DESIGN);
    
    // Get default document (README)
    const defaultPath = getDefaultDocumentForMode(designFiles, ViewerMode.DESIGN);
    
    if (!defaultPath) {
      notFound();
    }

    // Load document content server-side
    const content = await loadDocumentationFileServer(defaultPath);
    const processed = processMarkdownContent(content);
    const toc = generateTableOfContents(content);
    const images = extractImagesFromMarkdown(content);
    const metadata = await getDocumentationMetadataServer(defaultPath);

    // Organize design files for sidebar (already loaded above)
    const designCategories = organizeByCategory(designFiles);

    // Render directly instead of redirecting
    return (
      <main className="ml-64 mt-16 h-[calc(100vh-4rem)] bg-void text-text-primary overflow-hidden">
        <DocumentationViewer
          initialPath={defaultPath}
          mode={ViewerMode.DESIGN}
          initialContent={content}
          initialProcessedContent={processed}
          initialToc={toc}
          initialImages={images}
          initialMetadata={metadata}
          initialFiles={designFiles}
          initialCategories={designCategories}
          currentPath={`/docs/${defaultPath}?mode=design`}
        />
      </main>
    );
  } catch (error) {
    console.error("Error loading style guide:", error);
    notFound();
  }
}
