// app/api/ai-stack/lmstudio/models/search/route.ts
// Search for models using LM Studio CLI or Hugging Face API

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    // Search Hugging Face for models
    // LM Studio models are typically GGUF format from Hugging Face
    try {
      const hfUrl = `https://huggingface.co/api/models?search=${encodeURIComponent(query)}&filter=gguf&sort=downloads&direction=-1&limit=${limit}`;
      
      const response = await fetch(hfUrl, {
        headers: {
          "User-Agent": "Magicborn/1.0",
        },
      });

      if (!response.ok) {
        throw new Error(`Hugging Face API returned ${response.status}`);
      }

      const data = await response.json();

      // Format the results for our UI
      const models = data.map((model: any) => ({
        id: model.id,
        name: model.id.split("/").pop(),
        author: model.id.split("/")[0],
        downloads: model.downloads || 0,
        likes: model.likes || 0,
        tags: model.tags || [],
        // Common GGUF model identifiers
        identifier: model.id,
      }));

      return NextResponse.json({
        models,
        total: models.length,
      });
    } catch (error: any) {
      return NextResponse.json(
        {
          error: error.message || "Failed to search models",
          models: [],
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process search request" },
      { status: 500 }
    );
  }
}

