// app/api/ai-stack/n8n/api-key/route.ts
// Manage n8n API key storage

import { NextResponse } from "next/server";
import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

const CONFIG_DIR = join(process.cwd(), "infra", "ai-stack", "n8n");
const API_KEY_FILE = join(CONFIG_DIR, ".api-key");

// Get API key from file or environment
async function getApiKey(): Promise<string | null> {
  // First check environment variable
  if (process.env.N8N_API_KEY) {
    return process.env.N8N_API_KEY;
  }
  
  // Then check file
  if (existsSync(API_KEY_FILE)) {
    try {
      const key = await readFile(API_KEY_FILE, "utf-8");
      return key.trim() || null;
    } catch {
      return null;
    }
  }
  
  return null;
}

export async function GET() {
  try {
    const apiKey = await getApiKey();
    return NextResponse.json({ 
      hasApiKey: !!apiKey,
      // Don't return the actual key for security
    });
  } catch (error) {
    console.error("Error reading API key:", error);
    return NextResponse.json(
      { error: "Failed to read API key" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();
    
    if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length === 0) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    // Ensure config directory exists
    if (!existsSync(CONFIG_DIR)) {
      await mkdir(CONFIG_DIR, { recursive: true });
    }

    // Save API key to file
    await writeFile(API_KEY_FILE, apiKey.trim(), "utf-8");

    return NextResponse.json({
      success: true,
      message: "API key saved successfully",
    });
  } catch (error) {
    console.error("Error saving API key:", error);
    return NextResponse.json(
      { error: "Failed to save API key" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    if (existsSync(API_KEY_FILE)) {
      const { unlink } = await import("fs/promises");
      await unlink(API_KEY_FILE);
    }
    return NextResponse.json({
      success: true,
      message: "API key removed",
    });
  } catch (error) {
    console.error("Error deleting API key:", error);
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 }
    );
  }
}

// Export helper function for use in other routes
export { getApiKey };

