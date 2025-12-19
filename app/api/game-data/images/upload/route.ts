// app/api/game-data/images/upload/route.ts
// API endpoint to upload images for game content (spells, effects, runes, etc.)

import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const contentType = (formData.get("contentType") as string) || "spells"; // spells, effects, runes, etc.
    const entityId = (formData.get("entityId") as string) || ""; // Optional: specific entity ID
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate content type
    const validContentTypes = ["spells", "effects", "runes", "characters", "creatures", "environments", "maps", "regions", "objects", "lore"];
    if (!validContentTypes.includes(contentType)) {
      return NextResponse.json(
        { error: `Invalid content type. Must be one of: ${validContentTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate file type
    const validImageTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
    if (!validImageTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Must be an image (png, jpeg, webp, gif)" },
        { status: 400 }
      );
    }

    // Determine filename
    let filename = file.name;
    if (entityId) {
      // Use entity ID as filename (preserve extension)
      const extension = file.name.split(".").pop();
      filename = `${entityId}.${extension}`;
    }

    // Build target path
    const publicPath = join(process.cwd(), "public", "game-content", contentType);
    const targetDir = publicPath;
    
    // Create directory if it doesn't exist
    if (!existsSync(targetDir)) {
      await mkdir(targetDir, { recursive: true });
    }
    
    const filePath = join(targetDir, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await writeFile(filePath, buffer);
    
    // Return the path relative to public folder (for use in Next.js Image component)
    const imagePath = `/game-content/${contentType}/${filename}`;
    
    return NextResponse.json({
      success: true,
      path: imagePath,
      filename,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

