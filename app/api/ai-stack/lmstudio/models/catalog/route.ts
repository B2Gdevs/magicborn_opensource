// app/api/ai-stack/lmstudio/models/catalog/route.ts
// Fetch models from LM Studio's model catalog

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "50");

    // LM Studio's model catalog API endpoint
    // 
    // TODO: Future improvements needed:
    // - Fetch from LM Studio's actual API endpoint when available
    // - Cache model catalog data with periodic refresh
    // - Support pagination for large model lists
    // - Integrate with LM Studio's real-time catalog updates
    // 
    // For now, we'll return curated popular models based on their catalog
    // https://lmstudio.ai/models
    
    const catalogModels = [
      // Ollama Models (popular and commonly used)
      { id: "ollama/llama3.2", name: "Llama 3.2", author: "ollama", downloads: 500000, likes: 2000, tags: ["general-purpose"], identifier: "llama3.2" },
      { id: "ollama/llama3.1", name: "Llama 3.1", author: "ollama", downloads: 400000, likes: 1500, tags: ["general-purpose"], identifier: "llama3.1" },
      { id: "ollama/llama3", name: "Llama 3", author: "ollama", downloads: 600000, likes: 2500, tags: ["general-purpose"], identifier: "llama3" },
      { id: "ollama/llama3.2:3b", name: "Llama 3.2 3B", author: "ollama", downloads: 300000, likes: 1200, tags: ["general-purpose", "small"], identifier: "llama3.2:3b" },
      { id: "ollama/llama3.2:1b", name: "Llama 3.2 1B", author: "ollama", downloads: 200000, likes: 800, tags: ["general-purpose", "small"], identifier: "llama3.2:1b" },
      { id: "ollama/mistral", name: "Mistral", author: "ollama", downloads: 350000, likes: 1400, tags: ["general-purpose"], identifier: "mistral" },
      { id: "ollama/mixtral", name: "Mixtral", author: "ollama", downloads: 280000, likes: 1100, tags: ["general-purpose", "moe"], identifier: "mixtral" },
      { id: "ollama/codellama", name: "CodeLlama", author: "ollama", downloads: 250000, likes: 1000, tags: ["coding"], identifier: "codellama" },
      { id: "ollama/qwen2.5", name: "Qwen2.5", author: "ollama", downloads: 180000, likes: 700, tags: ["general-purpose"], identifier: "qwen2.5" },
      { id: "ollama/phi3", name: "Phi-3", author: "ollama", downloads: 150000, likes: 600, tags: ["general-purpose", "small"], identifier: "phi3" },
      { id: "ollama/gemma2", name: "Gemma 2", author: "ollama", downloads: 120000, likes: 500, tags: ["general-purpose"], identifier: "gemma2" },
      { id: "ollama/nomic-embed-text", name: "Nomic Embed Text", author: "ollama", downloads: 100000, likes: 400, tags: ["embedding"], identifier: "nomic-embed-text" },
      
      // LM Studio Catalog Models
      // From LM Studio Catalog - https://lmstudio.ai/models
      { id: "mistralai/Mistral-7B-Instruct-v0.3", name: "Mistral 7B Instruct", author: "mistralai", downloads: 77500, likes: 33, tags: ["general-purpose"], identifier: "mistralai/Mistral-7B-Instruct-v0.3-GGUF" },
      { id: "mistralai/Ministral-3-8B-Instruct", name: "Ministral 3 8B", author: "mistralai", downloads: 173700, likes: 396, tags: ["general-purpose"], identifier: "mistralai/Ministral-3-8B-Instruct-GGUF" },
      { id: "mistralai/Ministral-3-14B-Instruct", name: "Ministral 3 14B", author: "mistralai", downloads: 173700, likes: 396, tags: ["general-purpose"], identifier: "mistralai/Ministral-3-14B-Instruct-GGUF" },
      { id: "mistralai/Ministral-3-3B-Instruct", name: "Ministral 3 3B", author: "mistralai", downloads: 173700, likes: 396, tags: ["general-purpose"], identifier: "mistralai/Ministral-3-3B-Instruct-GGUF" },
      { id: "mistralai/Magistral-24B-Instruct", name: "Magistral 24B", author: "mistralai", downloads: 138100, likes: 442, tags: ["reasoning"], identifier: "mistralai/Magistral-24B-Instruct-GGUF" },
      { id: "mistralai/Mistral-Small-24B", name: "Mistral Small 24B", author: "mistralai", downloads: 65700, likes: 17, tags: ["multimodal"], identifier: "mistralai/Mistral-Small-24B-GGUF" },
      { id: "mistralai/Codestral-22B", name: "Codestral 22B", author: "mistralai", downloads: 32800, likes: 18, tags: ["coding"], identifier: "mistralai/Codestral-22B-GGUF" },
      { id: "mistralai/Devstral-24B", name: "Devstral 24B", author: "mistralai", downloads: 73900, likes: 312, tags: ["coding", "agentic"], identifier: "mistralai/Devstral-24B-GGUF" },
      { id: "Qwen/Qwen3-4B-Instruct", name: "Qwen3 4B", author: "Qwen", downloads: 340500, likes: 1186, tags: ["general-purpose"], identifier: "Qwen/Qwen3-4B-Instruct-GGUF" },
      { id: "Qwen/Qwen3-30B-Instruct", name: "Qwen3 30B", author: "Qwen", downloads: 340500, likes: 1186, tags: ["general-purpose"], identifier: "Qwen/Qwen3-30B-Instruct-GGUF" },
      { id: "Qwen/Qwen3-235B-Instruct", name: "Qwen3 235B", author: "Qwen", downloads: 340500, likes: 1186, tags: ["general-purpose", "moe"], identifier: "Qwen/Qwen3-235B-Instruct-GGUF" },
      { id: "Qwen/Qwen3-Coder-30B", name: "Qwen3-Coder 30B", author: "Qwen", downloads: 213200, likes: 852, tags: ["coding"], identifier: "Qwen/Qwen3-Coder-30B-GGUF" },
      { id: "Qwen/Qwen3-Coder-480B", name: "Qwen3-Coder 480B", author: "Qwen", downloads: 213200, likes: 852, tags: ["coding", "moe"], identifier: "Qwen/Qwen3-Coder-480B-GGUF" },
      { id: "Qwen/Qwen3-VL-8B", name: "Qwen3-VL 8B", author: "Qwen", downloads: 452000, likes: 715, tags: ["vision", "multimodal"], identifier: "Qwen/Qwen3-VL-8B-GGUF" },
      { id: "Qwen/Qwen3-VL-30B", name: "Qwen3-VL 30B", author: "Qwen", downloads: 452000, likes: 715, tags: ["vision", "multimodal"], identifier: "Qwen/Qwen3-VL-30B-GGUF" },
      { id: "Qwen/Qwen3-Next-80B", name: "Qwen3 Next 80B", author: "Qwen", downloads: 27200, likes: 20, tags: ["general-purpose", "moe"], identifier: "Qwen/Qwen3-Next-80B-GGUF" },
      { id: "microsoft/Phi-4-3B", name: "Phi-4 3B", author: "microsoft", downloads: 21600, likes: 92, tags: ["general-purpose"], identifier: "microsoft/Phi-4-3B-GGUF" },
      { id: "microsoft/Phi-4-14B", name: "Phi-4 14B", author: "microsoft", downloads: 21600, likes: 92, tags: ["general-purpose"], identifier: "microsoft/Phi-4-14B-GGUF" },
      { id: "microsoft/Phi-4-reasoning-3.8B", name: "Phi-4 Reasoning 3.8B", author: "microsoft", downloads: 111300, likes: 293, tags: ["reasoning"], identifier: "microsoft/Phi-4-reasoning-3.8B-GGUF" },
      { id: "microsoft/Phi-4-reasoning-14.7B", name: "Phi-4 Reasoning 14.7B", author: "microsoft", downloads: 111300, likes: 293, tags: ["reasoning"], identifier: "microsoft/Phi-4-reasoning-14.7B-GGUF" },
      { id: "google/gemma-3-4B", name: "Gemma 3 4B", author: "google", downloads: 736500, likes: 1055, tags: ["multimodal", "vision"], identifier: "google/gemma-3-4B-GGUF" },
      { id: "google/gemma-3-12B", name: "Gemma 3 12B", author: "google", downloads: 736500, likes: 1055, tags: ["multimodal", "vision"], identifier: "google/gemma-3-12B-GGUF" },
      { id: "google/gemma-3-27B", name: "Gemma 3 27B", author: "google", downloads: 736500, likes: 1055, tags: ["multimodal", "vision"], identifier: "google/gemma-3-27B-GGUF" },
      { id: "google/gemma-3n-4.5B", name: "Gemma 3n 4.5B", author: "google", downloads: 160100, likes: 652, tags: ["mobile", "edge"], identifier: "google/gemma-3n-4.5B-GGUF" },
      { id: "google/gemma-3n-6.9B", name: "Gemma 3n 6.9B", author: "google", downloads: 160100, likes: 652, tags: ["mobile", "edge"], identifier: "google/gemma-3n-6.9B-GGUF" },
      { id: "google/FunctionGemma-270M", name: "FunctionGemma 270M", author: "google", downloads: 4535, likes: 0, tags: ["function-calling"], identifier: "google/FunctionGemma-270M-GGUF" },
      { id: "openai/gpt-oss-20B", name: "GPT-OSS 20B", author: "openai", downloads: 1200000, likes: 2412, tags: ["general-purpose"], identifier: "openai/gpt-oss-20B-GGUF" },
      { id: "openai/gpt-oss-120B", name: "GPT-OSS 120B", author: "openai", downloads: 1200000, likes: 2412, tags: ["general-purpose"], identifier: "openai/gpt-oss-120B-GGUF" },
      { id: "openai/gpt-oss-safeguard-20B", name: "GPT-OSS Safeguard 20B", author: "openai", downloads: 7900, likes: 212, tags: ["safety"], identifier: "openai/gpt-oss-safeguard-20B-GGUF" },
      { id: "openai/gpt-oss-safeguard-120B", name: "GPT-OSS Safeguard 120B", author: "openai", downloads: 7900, likes: 212, tags: ["safety"], identifier: "openai/gpt-oss-safeguard-120B-GGUF" },
      { id: "deepseek-ai/deepseek-r1-7B", name: "DeepSeek-R1 7B", author: "deepseek-ai", downloads: 473600, likes: 1176, tags: ["reasoning"], identifier: "deepseek-ai/deepseek-r1-7B-GGUF" },
      { id: "deepseek-ai/deepseek-r1-32B", name: "DeepSeek-R1 32B", author: "deepseek-ai", downloads: 473600, likes: 1176, tags: ["reasoning"], identifier: "deepseek-ai/deepseek-r1-32B-GGUF" },
      { id: "allenai/olmOCR-2-7B", name: "olmOCR 2 7B", author: "allenai", downloads: 33200, likes: 8, tags: ["vision", "ocr"], identifier: "allenai/olmOCR-2-7B-GGUF" },
      { id: "allenai/olmo-3-7B", name: "Olmo 3 7B", author: "allenai", downloads: 28200, likes: 213, tags: ["general-purpose"], identifier: "allenai/olmo-3-7B-GGUF" },
      { id: "allenai/olmo-3-32B", name: "Olmo 3 32B", author: "allenai", downloads: 28200, likes: 213, tags: ["general-purpose"], identifier: "allenai/olmo-3-32B-GGUF" },
      { id: "nvidia/nemotron-3-30B", name: "Nemotron 3 30B", author: "nvidia", downloads: 30700, likes: 12, tags: ["general-purpose", "moe"], identifier: "nvidia/nemotron-3-30B-GGUF" },
      { id: "nvidia/mistral-nemo-12B", name: "Mistral-Nemo 12B", author: "nvidia", downloads: 24600, likes: 2, tags: ["multilingual"], identifier: "nvidia/mistral-nemo-12B-GGUF" },
      { id: "THUDM/GLM-4.6V-Flash-9B", name: "GLM-4.6V Flash 9B", author: "THUDM", downloads: 11800, likes: 3, tags: ["vision", "multimodal"], identifier: "THUDM/GLM-4.6V-Flash-9B-GGUF" },
      { id: "ibm/granite-4.0-3B", name: "Granite 4.0 3B", author: "ibm", downloads: 51700, likes: 394, tags: ["multilingual"], identifier: "ibm/granite-4.0-3B-GGUF" },
      { id: "ibm/granite-4.0-7B", name: "Granite 4.0 7B", author: "ibm", downloads: 51700, likes: 394, tags: ["multilingual"], identifier: "ibm/granite-4.0-7B-GGUF" },
      { id: "ibm/granite-4.0-32B", name: "Granite 4.0 32B", author: "ibm", downloads: 51700, likes: 394, tags: ["multilingual"], identifier: "ibm/granite-4.0-32B-GGUF" },
      { id: "bytedance/seed-oss-36B", name: "seed-oss 36B", author: "bytedance", downloads: 41300, likes: 19, tags: ["reasoning"], identifier: "bytedance/seed-oss-36B-GGUF" },
      { id: "minimax/minimax-m2-230B", name: "MiniMax M2 230B", author: "minimax", downloads: 25200, likes: 16, tags: ["coding", "agentic", "moe"], identifier: "minimax/minimax-m2-230B-GGUF" },
      { id: "baidu/ernie-4.5-21B", name: "Ernie 4.5 21B", author: "baidu", downloads: 14200, likes: 9, tags: ["general-purpose", "moe"], identifier: "baidu/ernie-4.5-21B-GGUF" },
      { id: "liquid-ai/lfm2-1.2B", name: "LFM2 1.2B", author: "liquid-ai", downloads: 53700, likes: 393, tags: ["edge", "mobile"], identifier: "liquid-ai/lfm2-1.2B-GGUF" },
      { id: "essential-ai/rnj-1-8B", name: "Rnj-1 8B", author: "essential-ai", downloads: 14300, likes: 4, tags: ["general-purpose"], identifier: "essential-ai/rnj-1-8B-GGUF" },
    ];

    // Filter by query if provided
    let filtered = catalogModels;
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = catalogModels.filter(
        (model) =>
          model.name.toLowerCase().includes(lowerQuery) ||
          model.author.toLowerCase().includes(lowerQuery) ||
          model.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
          model.identifier.toLowerCase().includes(lowerQuery)
      );
    }

    // Sort by downloads (popularity) and limit
    const sorted = filtered
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, limit);

    return NextResponse.json({
      models: sorted,
      total: filtered.length,
      source: "lmstudio-catalog",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch catalog models", models: [] },
      { status: 500 }
    );
  }
}

