import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

/**
 * API routes for managing runes game data
 */

export async function GET() {
  try {
    const filePath = join(process.cwd(), "lib", "packages", "runes", "index.ts");
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    const content = await readFile(filePath, "utf-8");
    return NextResponse.json({ content });
  } catch (error) {
    console.error("Error reading runes:", error);
    return NextResponse.json(
      { error: "Failed to read runes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content } = body;
    
    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }
    
    const filePath = join(process.cwd(), "lib", "packages", "runes", "index.ts");
    await writeFile(filePath, content, "utf-8");
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error writing runes:", error);
    return NextResponse.json(
      { error: "Failed to write runes" },
      { status: 500 }
    );
  }
}

