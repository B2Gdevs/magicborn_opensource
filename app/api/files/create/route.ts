import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

/**
 * API endpoint to create files or directories
 * Body: { path: string, type: "file" | "directory", content?: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { path: relativePath, type, content = "" } = body;
    
    if (!relativePath || !type) {
      return NextResponse.json(
        { error: "Path and type are required" },
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
    
    if (existsSync(targetPath)) {
      return NextResponse.json(
        { error: "File or directory already exists" },
        { status: 400 }
      );
    }
    
    if (type === "directory") {
      await mkdir(targetPath, { recursive: true });
    } else {
      // Create parent directories if they don't exist
      const parentDir = join(targetPath, "..");
      if (!existsSync(parentDir)) {
        await mkdir(parentDir, { recursive: true });
      }
      await writeFile(targetPath, content, "utf-8");
    }
    
    return NextResponse.json({ success: true, path: relativePath });
  } catch (error) {
    console.error("Error creating file:", error);
    return NextResponse.json(
      { error: "Failed to create file or directory" },
      { status: 500 }
    );
  }
}

