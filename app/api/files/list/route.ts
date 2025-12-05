import { NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Force dynamic rendering since we use request.url
export const dynamic = 'force-dynamic';

export interface FileItem {
  name: string;
  path: string;
  type: "file" | "directory";
  size?: number;
  extension?: string;
  modified?: Date;
}

/**
 * API endpoint to list files and directories in public folder
 * Query params: path (relative to public folder, e.g., "design/images")
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const relativePath = searchParams.get("path") || "";
    
    const publicPath = join(process.cwd(), "public");
    const targetPath = relativePath 
      ? join(publicPath, relativePath)
      : publicPath;
    
    // Security: ensure path is within public folder
    const resolvedPath = join(publicPath, relativePath);
    if (!resolvedPath.startsWith(publicPath)) {
      return NextResponse.json(
        { error: "Invalid path" },
        { status: 400 }
      );
    }
    
    if (!existsSync(targetPath)) {
      return NextResponse.json({ files: [] });
    }
    
    const entries = await readdir(targetPath, { withFileTypes: true });
    const files: FileItem[] = [];
    
    for (const entry of entries) {
      // Skip hidden files
      if (entry.name.startsWith(".")) {
        continue;
      }
      
      const fullPath = join(targetPath, entry.name);
      const stats = await stat(fullPath);
      const relativeFilePath = relativePath 
        ? `${relativePath}/${entry.name}`
        : entry.name;
      
      if (entry.isDirectory()) {
        files.push({
          name: entry.name,
          path: relativeFilePath,
          type: "directory",
          modified: stats.mtime,
        });
      } else {
        const ext = entry.name.includes(".") 
          ? entry.name.split(".").pop()?.toLowerCase() 
          : undefined;
        
        files.push({
          name: entry.name,
          path: relativeFilePath,
          type: "file",
          size: stats.size,
          extension: ext,
          modified: stats.mtime,
        });
      }
    }
    
    // Sort: directories first, then files, both alphabetically
    files.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "directory" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
    
    return NextResponse.json({ files });
  } catch (error) {
    console.error("Error listing files:", error);
    return NextResponse.json(
      { error: "Failed to list files" },
      { status: 500 }
    );
  }
}

