/**
 * Content Type Registry
 * 
 * Central configuration for all content types in the application.
 * This provides explicit control over what content appears in which modes.
 */

// Define ViewerMode here to avoid circular dependency
export enum ViewerMode {
  DESIGN = "design",
  BOOKS = "books",
  DEVELOPER = "developer",
  AUTO = "auto",
}

export enum ContentType {
  DEVELOPER_DOCS = "developer-docs",
  DESIGN_DOCS = "design-docs",
  BOOKS = "books",
  CUSTOMER_CONTENT = "customer-content",
  NEWS = "news",
  CHARACTERS = "characters",
}

export interface ContentTypeConfig {
  type: ContentType;
  basePath: string; // Base path in public/ folder
  allowedModes: ViewerMode[]; // Which viewer modes can access this content
  isPublic: boolean; // Customer-facing (true) or internal (false)
  displayName: string; // Human-readable name
  metadata?: {
    defaultFile?: string; // Default file to show (e.g., "README")
    icon?: string;
    description?: string;
    readingMode?: "documentation" | "book" | "article"; // Special reading experience
  };
}

/**
 * Content Type Registry
 * 
 * Defines all content types and their access rules.
 * Add new content types here.
 */
export const CONTENT_TYPE_REGISTRY: ContentTypeConfig[] = [
  {
    type: ContentType.DEVELOPER_DOCS,
    basePath: "developer",
    allowedModes: [ViewerMode.DEVELOPER],
    isPublic: false,
    displayName: "Developer Documentation",
    metadata: {
      defaultFile: "README",
      description: "Internal developer documentation",
      readingMode: "documentation",
    },
  },
  {
    type: ContentType.DESIGN_DOCS,
    basePath: "design",
    allowedModes: [ViewerMode.DESIGN],
    isPublic: false,
    displayName: "Design Documentation",
    metadata: {
      defaultFile: "README",
      description: "Internal design documentation",
      readingMode: "documentation",
    },
  },
  {
    type: ContentType.BOOKS,
    basePath: "books",
    allowedModes: [ViewerMode.BOOKS],
    isPublic: true,
    displayName: "Books & Stories",
    metadata: {
      description: "Customer-facing books and stories",
      readingMode: "book", // Special "fun" reading experience
    },
  },
];

/**
 * Get content type configuration for a given path
 */
export function getContentTypeConfig(path: string): ContentTypeConfig | null {
  // Normalize path (remove leading/trailing slashes)
  const normalizedPath = path.replace(/^\/+|\/+$/g, "");
  
  for (const config of CONTENT_TYPE_REGISTRY) {
    // Check if path starts with base path
    if (
      normalizedPath === config.basePath ||
      normalizedPath.startsWith(config.basePath + "/")
    ) {
      return config;
    }
  }
  
  return null;
}

/**
 * Get content type for a given path
 */
export function getContentType(path: string): ContentType | null {
  const config = getContentTypeConfig(path);
  return config?.type ?? null;
}

/**
 * Check if a content type can be accessed in a given mode
 */
export function canAccessContentType(
  contentType: ContentType,
  mode: ViewerMode
): boolean {
  const config = CONTENT_TYPE_REGISTRY.find((c) => c.type === contentType);
  return config?.allowedModes.includes(mode) ?? false;
}

/**
 * Check if a path can be accessed in a given mode
 */
export function canAccessPath(path: string, mode: ViewerMode): boolean {
  const config = getContentTypeConfig(path);
  if (!config) {
    return false; // Unknown content type - deny by default
  }
  return canAccessContentType(config.type, mode);
}

/**
 * Get all content types allowed in a given mode
 */
export function getContentTypesForMode(mode: ViewerMode): ContentType[] {
  return CONTENT_TYPE_REGISTRY
    .filter((config) => config.allowedModes.includes(mode))
    .map((config) => config.type);
}

/**
 * Get all base paths allowed in a given mode
 */
export function getBasePathsForMode(mode: ViewerMode): string[] {
  return CONTENT_TYPE_REGISTRY.filter((config) =>
    config.allowedModes.includes(mode)
  ).map((config) => config.basePath);
}

/**
 * Check if content is public (customer-facing)
 */
export function isPublicContent(path: string): boolean {
  const config = getContentTypeConfig(path);
  return config?.isPublic ?? false;
}

/**
 * Get reading mode for content (for special UI treatment)
 */
export function getReadingMode(path: string): "documentation" | "book" | "article" {
  const config = getContentTypeConfig(path);
  return config?.metadata?.readingMode ?? "documentation";
}

