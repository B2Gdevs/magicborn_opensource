import { NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export const dynamic = 'force-dynamic';

export interface RecentDocFile {
  name: string;
  path: string;
  created: Date;
  modified: Date;
}

/**
 * Recursively collect all markdown files from a directory
 */
async function collectMarkdownFiles(
  dirPath: string,
  basePath: string = "",
  files: Array<{ path: string; fullPath: string }> = []
): Promise<Array<{ path: string; fullPath: string }>> {
  if (!existsSync(dirPath)) {
    return files;
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
        await collectMarkdownFiles(fullPath, relativePath, files);
      } else if (entry.name.endsWith('.md')) {
        files.push({
          path: relativePath.replace('.md', ''),
          fullPath: fullPath.replace('.md', ''),
        });
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
  }

  return files;
}

/**
 * API endpoint to get the latest 3 updated/created documentation files
 * Query params: mode (optional) - filter by mode (developer, design, books)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "developer"; // Default to developer
    const limit = parseInt(searchParams.get("limit") || "3", 10);

    const publicPath = join(process.cwd(), "public");
    let targetPath: string;

    // Determine which folder to scan based on mode
    if (mode === "developer") {
      targetPath = join(publicPath, "developer");
    } else if (mode === "design") {
      targetPath = join(publicPath, "design");
    } else if (mode === "books") {
      targetPath = join(publicPath, "books");
    } else {
      return NextResponse.json(
        { error: "Invalid mode. Must be 'developer', 'design', or 'books'" },
        { status: 400 }
      );
    }

    if (!existsSync(targetPath)) {
      return NextResponse.json({ files: [] });
    }

    // Collect all markdown files
    const allFiles = await collectMarkdownFiles(targetPath, mode);

    // Get metadata for each file and sort by modified date (most recent first)
    const filesWithMetadata = await Promise.all(
      allFiles.map(async (file) => {
        const mdPath = `${file.fullPath}.md`;
        try {
          const stats = await stat(mdPath);
          return {
            name: file.path.split('/').pop() || file.path,
            path: file.path,
            created: stats.birthtime,
            modified: stats.mtime,
          };
        } catch (error) {
          console.error(`Error getting stats for ${mdPath}:`, error);
          return null;
        }
      })
    );

    // Filter out nulls and sort by modified date (most recent first)
    const validFiles: RecentDocFile[] = filesWithMetadata
      .filter((file): file is RecentDocFile => file !== null)
      .sort((a, b) => {
        // Sort by modified date first, then by created date
        const modifiedDiff = b.modified.getTime() - a.modified.getTime();
        if (modifiedDiff !== 0) return modifiedDiff;
        return b.created.getTime() - a.created.getTime();
      })
      .slice(0, limit);

    return NextResponse.json({ files: validFiles });
  } catch (error) {
    console.error("Error getting recent documentation files:", error);
    return NextResponse.json(
      { error: "Failed to get recent documentation files", files: [] },
      { status: 500 }
    );
  }
}


