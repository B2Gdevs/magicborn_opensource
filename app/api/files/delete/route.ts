import { NextResponse } from "next/server";
import { unlink, rmdir, stat } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

/**
 * API endpoint to delete files or directories
 * Body: { path: string } (relative to public folder)
 */
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { path: relativePath } = body;
    
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
        { error: "File or directory not found" },
        { status: 404 }
      );
    }
    
    const stats = await stat(targetPath);
    
    if (stats.isDirectory()) {
      // For directories, we'd need recursive deletion
      // For now, only allow deletion of empty directories
      await rmdir(targetPath);
    } else {
      await unlink(targetPath);
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting file:", error);
    
    if (error.code === "ENOTEMPTY") {
      return NextResponse.json(
        { error: "Directory is not empty" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to delete file or directory" },
      { status: 500 }
    );
  }
}

