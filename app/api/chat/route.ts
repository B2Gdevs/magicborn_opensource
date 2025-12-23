// app/api/chat/route.ts
// BlockNote AI backend endpoint (Vercel AI SDK Data Stream Protocol)
//
// Based on BlockNote AI backend integration docs:
// - https://www.blocknotejs.org/docs/features/ai/getting-started
// - https://www.blocknotejs.org/docs/features/ai/backend-integration

import { convertToModelMessages, streamText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import {
  aiDocumentFormats,
  injectDocumentStateMessages,
  toolDefinitionsToToolSet,
} from "@blocknote/xl-ai/server";
import { buildHierarchicalPrompt, type PromptContext } from "@lib/ai/prompts";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export const runtime = "nodejs";

type ChatRequestBody = {
  messages: unknown[];
  toolDefinitions?: unknown[];
  // Optional context IDs for hierarchical prompts
  projectId?: string | number;
  pageId?: string | number;
  chapterId?: string | number;
  actId?: string | number;
  entityId?: string | number;
  entityType?: "characters" | "lore" | "locations" | "creatures" | "objects";
};

// Create LM Studio provider instance
const lm = createOpenAICompatible({
  name: "lmstudio",
  baseURL: process.env.LMSTUDIO_BASE_URL
    ? `${process.env.LMSTUDIO_BASE_URL.replace(/\/$/, "")}/v1`
    : "http://127.0.0.1:1234/v1",
  apiKey: "sk-local", // Dummy key for local servers
});

async function resolveLmStudioModelId(): Promise<string> {
  if (process.env.LMSTUDIO_MODEL) return process.env.LMSTUDIO_MODEL;

  const baseURL = process.env.LMSTUDIO_BASE_URL
    ? `${process.env.LMSTUDIO_BASE_URL.replace(/\/$/, "")}/v1`
    : "http://127.0.0.1:1234/v1";

  const res = await fetch(`${baseURL}/models`, { signal: AbortSignal.timeout(3000) });
  if (!res.ok) {
    throw new Error(`LM Studio /v1/models failed: ${res.status}`);
  }
  const json = await res.json();

  const first = json?.data?.[0]?.id;
  if (!first) {
    throw new Error("No models returned from LM Studio /v1/models");
  }
  console.log(`Auto-detected LM Studio model: ${first}`);
  return first;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatRequestBody;
    const messages = body.messages ?? [];
    const toolDefinitions = body.toolDefinitions ?? [];
    const { projectId, pageId, chapterId, actId, entityId, entityType } = body;

    // Resolve model ID from LM Studio
    const modelId = await resolveLmStudioModelId();
    const model = lm(modelId);

    // Build hierarchical system prompt from context
    let systemPrompt = aiDocumentFormats.html.systemPrompt;
    if (projectId || pageId || chapterId || actId || entityId) {
      const promptContext: PromptContext = {
        projectId,
        pageId,
        chapterId,
        actId,
        entityId,
        entityType,
      };
      const builtPrompt = await buildHierarchicalPrompt(promptContext);
      
      // Combine BlockNote's default prompt with project-specific prompts
      const promptParts: string[] = [systemPrompt];
      if (builtPrompt.systemPrompt) {
        promptParts.push(builtPrompt.systemPrompt);
      }
      if (builtPrompt.contextPrompt) {
        promptParts.push("\n---\nCONTEXT:\n" + builtPrompt.contextPrompt);
      }
      systemPrompt = promptParts.join("\n\n");
    }

    const result = streamText({
      model,
      system: systemPrompt,
      messages: convertToModelMessages(injectDocumentStateMessages(messages as any)),
      tools: toolDefinitionsToToolSet(toolDefinitions as any),
      toolChoice: "required",
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error("POST /api/chat error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to handle /api/chat request",
        message: error?.message || String(error),
        stack: error?.stack,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}


