import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

/**
 * API endpoint to upload files
 * Form data: file, path (relative to public folder)
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const relativePath = (formData.get("path") as string) || "";
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }
    
    const publicPath = join(process.cwd(), "public");
    const targetDir = relativePath 
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
    
    // Create directory if it doesn't exist
    if (!existsSync(targetDir)) {
      await mkdir(targetDir, { recursive: true });
    }
    
    const filePath = join(targetDir, file.name);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await writeFile(filePath, buffer);
    
    return NextResponse.json({
      success: true,
      path: relativePath ? `${relativePath}/${file.name}` : file.name,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

