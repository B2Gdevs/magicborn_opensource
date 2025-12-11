import { NextResponse } from "next/server";
import { stat } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export const dynamic = 'force-dynamic';

export interface DocMetadata {
  created: Date;
  modified: Date;
}

/**
 * API endpoint to get file metadata (created and modified dates) for a documentation file
 * Query params: path (relative to public folder, e.g., "design/README" or "books/mordreds_tale/chapter1")
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const relativePath = searchParams.get("path");
    
    if (!relativePath) {
      return NextResponse.json(
        { error: "Path parameter is required" },
        { status: 400 }
      );
    }
    
    const publicPath = join(process.cwd(), "public");
    
    // Handle both with and without .md extension
    const filePath = relativePath.endsWith('.md') ? relativePath : `${relativePath}.md`;
    
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
      return NextResponse.json(
        { error: "Invalid path" },
        { status: 400 }
      );
    }
    
    if (!existsSync(fullPath)) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }
    
    const stats = await stat(fullPath);
    
    return NextResponse.json({
      created: stats.birthtime,
      modified: stats.mtime,
    });
  } catch (error) {
    console.error("Error getting file metadata:", error);
    return NextResponse.json(
      { error: "Failed to get file metadata" },
      { status: 500 }
    );
  }
}


