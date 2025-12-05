import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

/**
 * API routes for managing named spells game data
 */

export async function GET() {
  try {
    const filePath = join(process.cwd(), "lib", "data", "namedSpells.ts");
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    const content = await readFile(filePath, "utf-8");
    return NextResponse.json({ content });
  } catch (error) {
    console.error("Error reading spells:", error);
    return NextResponse.json(
      { error: "Failed to read spells" },
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
    
    const filePath = join(process.cwd(), "lib", "data", "namedSpells.ts");
    await writeFile(filePath, content, "utf-8");
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error writing spells:", error);
    return NextResponse.json(
      { error: "Failed to write spells" },
      { status: 500 }
    );
  }
}

