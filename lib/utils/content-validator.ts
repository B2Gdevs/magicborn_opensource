/**
 * Content Validation Utilities
 * 
 * Provides strict validation for content access based on content types and modes.
 */

import { ViewerMode } from "@lib/config/content-types";
import type { DocFile } from "./docs-loader";
import {
  getContentTypeConfig,
  canAccessPath,
  getBasePathsForMode,
  type ContentType,
} from "@lib/config/content-types";
import { unstable_cache } from "next/cache";

/**
 * Validate that a path can be accessed in the given mode
 * Throws an error if access is denied
 */
export function validateContentAccess(
  path: string,
  mode: ViewerMode
): void {
  if (!canAccessPath(path, mode)) {
    const config = getContentTypeConfig(path);
    const allowedModes = config?.allowedModes ?? [];
    throw new Error(
      `Access denied: Content at "${path}" cannot be accessed in "${mode}" mode. ` +
        `Allowed modes: ${allowedModes.join(", ")}`
    );
  }
}

/**
 * Filter files based on mode with strict validation
 */
export function filterFilesByMode(
  files: DocFile[],
  mode: ViewerMode
): DocFile[] {
  const allowedBasePaths = getBasePathsForMode(mode);
  const allowedPaths = new Set(allowedBasePaths);

  function shouldInclude(file: DocFile): boolean {
    // Check if file path matches any allowed base path
    const filePath = file.path;
    
    // Direct match
    if (allowedPaths.has(filePath)) {
      return true;
    }
    
    // Check if path starts with any allowed base path
    for (const basePath of allowedBasePaths) {
      if (filePath.startsWith(basePath + "/") || filePath === basePath) {
        return true;
      }
    }
    
    // For directories, check if any children would be included
    if (file.isDirectory && file.children) {
      return file.children.some(shouldInclude);
    }
    
    return false;
  }

  function filterRecursive(file: DocFile): DocFile | null {
    if (!shouldInclude(file)) {
      return null;
    }

    if (file.isDirectory && file.children) {
      const filteredChildren = file.children
        .map(filterRecursive)
        .filter((f): f is DocFile => f !== null);

      if (filteredChildren.length === 0) {
        return null; // Directory has no valid children
      }

      return {
        ...file,
        children: filteredChildren,
      };
    }

    return file;
  }

  return files.map(filterRecursive).filter((f): f is DocFile => f !== null);
}

/**
 * Validate and filter files, throwing if invalid content is found
 */
export function validateAndFilterFiles(
  files: DocFile[],
  mode: ViewerMode
): DocFile[] {
  // First filter
  const filtered = filterFilesByMode(files, mode);

  // Double-check: ensure no invalid content slipped through
  function validateFile(file: DocFile): void {
    if (!file.isDirectory) {
      validateContentAccess(file.path, mode);
    }
    if (file.children) {
      file.children.forEach(validateFile);
    }
  }

  filtered.forEach(validateFile);

  return filtered;
}

/**
 * Get default document path for a mode
 */
export function getDefaultDocumentForMode(
  files: DocFile[],
  mode: ViewerMode
): string | null {
  const filtered = filterFilesByMode(files, mode);
  
  // Try to find README in filtered files
  function findReadme(fileList: DocFile[]): string | null {
    for (const file of fileList) {
      if (file.isDirectory && file.children) {
        const found = findReadme(file.children);
        if (found) return found;
      } else if (!file.isDirectory) {
        if (file.name === "README" || file.path.includes("README")) {
          return file.path;
        }
      }
    }
    return null;
  }

  const readme = findReadme(filtered);
  if (readme) return readme;

  // Fallback: first file in filtered list
  function findFirst(fileList: DocFile[]): string | null {
    for (const file of fileList) {
      if (file.isDirectory && file.children) {
        const found = findFirst(file.children);
        if (found) return found;
      } else if (!file.isDirectory) {
        return file.path;
      }
    }
    return null;
  }

  return findFirst(filtered);
}

