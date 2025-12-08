// Server-side documentation file loader
// These functions use Node.js filesystem APIs and can only be used in server components

import { readFile, readdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { stat } from "fs/promises";
import { unstable_cache } from "next/cache";
import type { DocFile, DocCategory } from "./docs-loader";
import { organizeByCategory } from "./docs-loader";
import { validateContentAccess } from "./content-validator";
import { ViewerMode } from "@lib/config/content-types";

export interface DocMetadata {
  created: Date;
  modified: Date;
}

/**
 * Internal function to load documentation file (not cached)
 */
async function _loadDocumentationFileInternal(
  path: string,
  mode?: ViewerMode
): Promise<string> {
  const publicPath = join(process.cwd(), "public");
  
  // Handle both with and without .md extension
  const filePath = path.endsWith('.md') ? path : `${path}.md`;
  
  // Determine the full path
  let fullPath: string;
  if (filePath.startsWith('/')) {
    fullPath = join(publicPath, filePath.slice(1));
  } else if (filePath.startsWith('design/') || filePath.startsWith('books/') || filePath.startsWith('developer/')) {
    fullPath = join(publicPath, filePath);
  } else {
    // Default to design folder
    fullPath = join(publicPath, 'design', filePath);
  }
  
  // Security: ensure path is within public folder
  if (!fullPath.startsWith(publicPath)) {
    throw new Error("Invalid path");
  }
  
  if (!existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }
  
  // Validate access if mode is provided
  if (mode) {
    validateContentAccess(path, mode);
  }
  
  return await readFile(fullPath, "utf-8");
}

/**
 * Load documentation file from filesystem (server-side only)
 * Cached to avoid re-reading files on every request
 * @param path - File path relative to public folder
 * @param mode - Viewer mode for access validation (optional, but recommended)
 */
export async function loadDocumentationFileServer(
  path: string,
  mode?: ViewerMode
): Promise<string> {
  // Cache key includes path and mode for proper cache invalidation
  const cacheKey = `doc-file-${path}-${mode || 'auto'}`;
  return unstable_cache(
    () => _loadDocumentationFileInternal(path, mode),
    [cacheKey],
    {
      revalidate: 3600, // Revalidate every hour
      tags: ["documentation", `doc-file-${path}`], // Cache tag for manual revalidation
    }
  )();
}

/**
 * Internal function to get file metadata (not cached)
 */
async function _getDocumentationMetadataInternal(path: string): Promise<DocMetadata | null> {
  try {
    const publicPath = join(process.cwd(), "public");
    
    // Handle both with and without .md extension
    const filePath = path.endsWith('.md') ? path : `${path}.md`;
    
    // Determine the full path
    let fullPath: string;
    if (filePath.startsWith('/')) {
      fullPath = join(publicPath, filePath.slice(1));
    } else if (filePath.startsWith('design/') || filePath.startsWith('books/') || filePath.startsWith('developer/')) {
      fullPath = join(publicPath, filePath);
    } else {
      // Default to design folder
      fullPath = join(publicPath, 'design', filePath);
    }
    
    // Security: ensure path is within public folder
    if (!fullPath.startsWith(publicPath)) {
      return null;
    }
    
    if (!existsSync(fullPath)) {
      return null;
    }
    
    const stats = await stat(fullPath);
    
    return {
      created: stats.birthtime,
      modified: stats.mtime,
    };
  } catch (error) {
    console.error("Error getting file metadata:", error);
    return null;
  }
}

/**
 * Get file metadata (server-side only)
 * Cached to avoid re-reading file stats on every request
 * Note: We need to convert Date objects to/from strings for caching
 */
export async function getDocumentationMetadataServer(path: string): Promise<DocMetadata | null> {
  // Cache key includes path for proper cache invalidation
  const cacheKey = `doc-metadata-${path}`;
  const cached = await unstable_cache(
    async () => {
      const metadata = await _getDocumentationMetadataInternal(path);
      if (!metadata) return null;
      // Convert Dates to ISO strings for caching (unstable_cache serializes)
      return {
        created: metadata.created.toISOString(),
        modified: metadata.modified.toISOString(),
      };
    },
    [cacheKey],
    {
      revalidate: 3600, // Revalidate every hour
      tags: ["documentation", `doc-metadata-${path}`], // Cache tag for manual revalidation
    }
  )();
  
  // Convert back to Date objects
  if (!cached) return null;
  return {
    created: new Date(cached.created),
    modified: new Date(cached.modified),
  };
}

/**
 * Load documentation list from filesystem (server-side only)
 * Cached to avoid re-scanning on every request
 */
export const loadDocumentationListServer = unstable_cache(
  async (): Promise<DocFile[]> => {
    const publicPath = join(process.cwd(), "public");
    const allFiles: DocFile[] = [];
    
    // Scan design folder
    const designPath = join(publicPath, "design");
    if (existsSync(designPath)) {
      const designFiles = await scanDirectory(designPath, "design");
      allFiles.push(...designFiles);
    }
    
    // Scan books folder
    const booksPath = join(publicPath, "books");
    if (existsSync(booksPath)) {
      const booksFiles = await scanDirectory(booksPath, "books");
      allFiles.push(...booksFiles);
    }
    
    // Scan developer folder
    const developerPath = join(publicPath, "developer");
    if (existsSync(developerPath)) {
      const developerFiles = await scanDirectory(developerPath, "developer");
      allFiles.push(...developerFiles);
    }
    
    return allFiles;
  },
  ["documentation-list"], // Cache key
  {
    revalidate: 3600, // Revalidate every hour
    tags: ["documentation"], // Cache tag for manual revalidation
  }
);

/**
 * Scan directory recursively (server-side only)
 */
async function scanDirectory(dirPath: string, basePath: string = ""): Promise<DocFile[]> {
  const items: DocFile[] = [];
  
  if (!existsSync(dirPath)) {
    return items;
  }
  
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      // Skip hidden files and directories
      if (entry.name.startsWith('.')) {
        continue;
      }
      
      const fullPath = join(dirPath, entry.name);
      const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;
      
      if (entry.isDirectory()) {
        const children = await scanDirectory(fullPath, relativePath);
        // Only include directory if it has markdown files or subdirectories with content
        const hasContent = children.some(c => !c.isDirectory || (c.children && c.children.length > 0));
        if (hasContent) {
          items.push({
            name: entry.name,
            path: relativePath,
            category: basePath || entry.name,
            isDirectory: true,
            children: children.filter(c => !c.isDirectory || (c.children && c.children.length > 0)),
          });
        }
      } else if (entry.name.endsWith('.md')) {
        items.push({
          name: entry.name.replace('.md', ''),
          path: relativePath.replace('.md', ''),
          category: basePath || 'main',
          isDirectory: false,
        });
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
  }
  
  return items.sort((a, b) => {
    // Directories first, then files
    if (a.isDirectory !== b.isDirectory) {
      return a.isDirectory ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

/**
 * Get organized categories (server-side only)
 * Cached to avoid re-organizing on every request
 */
export const getOrganizedCategoriesServer = unstable_cache(
  async (): Promise<DocCategory[]> => {
    const files = await loadDocumentationListServer();
    return organizeByCategory(files);
  },
  ["documentation-categories"],
  {
    revalidate: 3600, // Revalidate every hour
    tags: ["documentation"], // Cache tag for manual revalidation
  }
);

