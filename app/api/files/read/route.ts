import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Force dynamic rendering since we use request.url
export const dynamic = 'force-dynamic';

/**
 * API endpoint to read file content
 * Query params: path (relative to public folder)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const relativePath = searchParams.get("path");
    
    if (!relativePath) {
      return NextResponse.json(
        { error: "Path is required" },
        { status: 400 }
      );
    }
    
    const publicPath = join(process.cwd(), "public");
    const targetPath = join(publicPath, relativePath);
    
    // Security: ensure path is within public folder
    if (!targetPath.startsWith(publicPath)) {
      return NextResponse.json(
        { error: "Invalid path" },
        { status: 400 }
      );
    }
    
    if (!existsSync(targetPath)) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }
    
    const content = await readFile(targetPath, "utf-8");
    
    return NextResponse.json({
      content,
      path: relativePath,
    });
  } catch (error) {
    console.error("Error reading file:", error);
    return NextResponse.json(
      { error: "Failed to read file" },
      { status: 500 }
    );
  }
}

