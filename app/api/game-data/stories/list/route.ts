// app/api/game-data/stories/list/route.ts
// API route to list available story files from mordreds_legacy/stories

import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import { join } from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const storiesDir = join(process.cwd(), "public", "books", "mordreds_legacy", "stories");
    
    try {
      const files = await readdir(storiesDir);
      const storyFiles = files
        .filter((file) => file.endsWith(".md"))
        .map((file) => file.replace(".md", "")); // Remove .md extension
      
      return NextResponse.json({ stories: storyFiles });
    } catch (error) {
      // Directory doesn't exist or can't be read
      console.warn("Stories directory not found or unreadable:", error);
      return NextResponse.json({ stories: [] });
    }
  } catch (error) {
    console.error("Error listing stories:", error);
    return NextResponse.json({ error: "Failed to list stories" }, { status: 500 });
  }
}

