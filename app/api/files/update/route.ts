import { NextResponse } from "next/server";
import { writeFile, rename } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

/**
 * API endpoint to update files (rename or update content)
 * Body: { path: string, newPath?: string, content?: string }
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { path: relativePath, newPath, content } = body;
    
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
    
    // Rename file
    if (newPath) {
      const newTargetPath = join(publicPath, newPath);
      
      // Security check for new path
      if (!newTargetPath.startsWith(publicPath)) {
        return NextResponse.json(
          { error: "Invalid new path" },
          { status: 400 }
        );
      }
      
      if (existsSync(newTargetPath)) {
        return NextResponse.json(
          { error: "Target file already exists" },
          { status: 400 }
        );
      }
      
      await rename(targetPath, newTargetPath);
      return NextResponse.json({ success: true, path: newPath });
    }
    
    // Update content
    if (content !== undefined) {
      await writeFile(targetPath, content, "utf-8");
      return NextResponse.json({ success: true, path: relativePath });
    }
    
    return NextResponse.json(
      { error: "Either newPath or content must be provided" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating file:", error);
    return NextResponse.json(
      { error: "Failed to update file" },
      { status: 500 }
    );
  }
}

