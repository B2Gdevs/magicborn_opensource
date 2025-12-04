// Extract images from markdown content

export interface ExtractedImage {
  src: string;
  alt: string;
  originalSrc: string; // Keep original for reference
}

/**
 * Extract all image references from markdown content
 * Supports: ![alt](src) format
 */
export function extractImagesFromMarkdown(markdown: string): ExtractedImage[] {
  const images: ExtractedImage[] = [];
  
  // Match markdown image syntax: ![alt text](image-path)
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  
  while ((match = imageRegex.exec(markdown)) !== null) {
    const alt = match[1] || '';
    const originalSrc = match[2];
    
    // Resolve image path (same logic as in DocumentationViewer)
    let src = originalSrc;
    
    if (src.startsWith('http://') || src.startsWith('https://')) {
      // Full URL - use as is
      src = src;
    } else if (src.startsWith('/')) {
      // Absolute path from public folder - use as is
      src = src;
    } else if (src.startsWith('./')) {
      // Relative path starting with ./ - resolve relative to design folder
      src = `/design/${src.replace(/^\.\//, '')}`;
    } else {
      // Relative path - assume it's in design folder
      src = `/design/${src}`;
    }
    
    images.push({
      src,
      alt,
      originalSrc,
    });
  }
  
  return images;
}

