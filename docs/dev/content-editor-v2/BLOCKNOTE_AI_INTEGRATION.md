# BlockNote AI Integration with LM Studio

## Overview

This document describes how BlockNote AI is integrated with LM Studio (local AI) for AI-powered content editing in the Magicborn content editor.

## Architecture

```
BlockNote Editor (Client)
    ↓
DefaultChatTransport (Vercel AI SDK)
    ↓
/api/chat (Next.js API Route)
    ↓
Vercel AI SDK (streamText)
    ↓
LM Studio (Local AI Provider)
    ↓
Streaming Response → BlockNote Editor
```

## Setup

### 1. Install Dependencies

```bash
npm install @blocknote/xl-ai @ai-sdk/openai-compatible ai
```

**Key Packages:**
- `@blocknote/xl-ai` - BlockNote AI extension
- `@ai-sdk/openai-compatible` - For LM Studio (OpenAI-compatible local server)
- `ai` - Vercel AI SDK core (v5)

### 2. LM Studio Configuration

LM Studio runs locally and provides an OpenAI-compatible API endpoint. No API key is required.

**Default Configuration:**
- **Base URL**: `http://127.0.0.1:1234/v1`
- **API Key**: Not required (dummy key used: `sk-local`)
- **Model**: Auto-detected from `/v1/models` endpoint, or set via `LMSTUDIO_MODEL` env var

**Environment Variables (Optional):**
```bash
# LM Studio
LMSTUDIO_BASE_URL=http://127.0.0.1:1234  # Default
LMSTUDIO_MODEL=openai/gpt-oss-20b        # Optional - auto-detected if not set
```

### 3. API Route Implementation

The `/api/chat` route (`app/api/chat/route.ts`) handles AI requests:

```typescript
import { streamText, convertToModelMessages } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import {
  injectDocumentStateMessages,
  toolDefinitionsToToolSet,
} from "@blocknote/xl-ai/server";

// Create LM Studio provider instance
const lm = createOpenAICompatible({
  name: "lmstudio",
  baseURL: process.env.LMSTUDIO_BASE_URL
    ? `${process.env.LMSTUDIO_BASE_URL.replace(/\/$/, "")}/v1`
    : "http://127.0.0.1:1234/v1",
  apiKey: "sk-local", // Dummy key for local servers
});

// Resolve model ID (auto-detect or use env var)
async function resolveLmStudioModelId(): Promise<string> {
  if (process.env.LMSTUDIO_MODEL) return process.env.LMSTUDIO_MODEL;
  
  const res = await fetch("http://127.0.0.1:1234/v1/models");
  if (!res.ok) throw new Error(`LM Studio /v1/models failed: ${res.status}`);
  const json = await res.json();
  
  const first = json?.data?.[0]?.id;
  if (!first) throw new Error("No models returned from LM Studio");
  return first;
}

// In POST handler
const modelId = await resolveLmStudioModelId();
const model = lm(modelId);

const result = streamText({
  model,
  system: systemPrompt,
  messages: convertToModelMessages(injectDocumentStateMessages(messages)),
  tools: toolDefinitionsToToolSet(toolDefinitions),
  toolChoice: "required",
});

return result.toUIMessageStreamResponse();
```

## Hierarchical Prompt System

The AI uses a hierarchical prompt system that pulls context from your project structure:

### Prompt Hierarchy

1. **Project Level** (`projects` collection):
   - `aiSystemPrompt` - Base system prompt (how AI behaves)
   - `aiProjectStory` - Project story & world context
   - `aiAssistantBehavior` - Writing style guidelines

2. **Act Level** (`acts` collection):
   - `aiContextPrompt` - Act-specific context

3. **Chapter Level** (`chapters` collection):
   - `aiContextPrompt` - Chapter-specific context

4. **Page Level** (`pages` collection):
   - `aiContextPrompt` - Page/scene-specific context

5. **Entity Level** (characters, lore, locations, etc.):
   - `aiContextPrompt` - Entity-specific context

### How It Works

When you use AI in the editor, the system:
1. Detects your current context (project, page, chapter, etc.)
2. Fetches prompts from Payload CMS
3. Builds a hierarchical system prompt:
   ```
   [BlockNote Default Prompt]
   
   [Project System Prompt]
   [Project Story]
   [Assistant Behavior]
   
   ---
   CONTEXT:
   [Act Context]
   [Chapter Context]
   [Page Context]
   [Entity Context]
   ```

### Seeding Default Prompts

Run the seed script to add Magicborn placeholder prompts to project 1:

```bash
npm run payload:seed-prompts
```

This adds:
- System prompt (AI behavior)
- Project story (Magicborn universe context)
- Assistant behavior (writing style guidelines)

You can then edit these in Payload admin or project settings.

## Client-Side Integration

### BlockNoteEditor Component

The `BlockNoteEditor` component (`components/content-editor/BlockNoteEditor.tsx`) sets up AI:

```typescript
import { AIExtension } from "@blocknote/xl-ai";
import { DefaultChatTransport } from "ai";

const editor = useCreateBlockNote({
  extensions: [
    AIExtension({
      transport: new DefaultChatTransport({
        api: "/api/chat",
        // Custom fetch to pass context IDs
        fetch: async (url, options) => {
          const body = JSON.parse(options.body as string);
          const bodyWithContext = {
            ...body,
            projectId,
            pageId,
            chapterId,
            actId,
            entityId,
            entityType,
          };
          return fetch(url, {
            ...options,
            body: JSON.stringify(bodyWithContext),
          });
        },
      }),
    }),
  ],
});
```

### Context Passing

The editor automatically passes context IDs to `/api/chat`:
- `projectId` - Current project
- `pageId` - Current page (if editing a page)
- `chapterId` - Current chapter (if available)
- `actId` - Current act (if available)
- `entityId` - Current entity (if editing character/lore/etc.)
- `entityType` - Entity type ("characters", "lore", "locations", etc.)

## Usage

### In the Editor

1. **Select text** → Click AI button in formatting toolbar
2. **Type `/ai`** → Opens AI slash menu with commands:
   - Rewrite
   - Expand
   - Condense
   - Improve
   - And more...

### AI Features

- **Text Rewriting**: Select text → AI button → Choose action
- **Content Generation**: Type `/ai` → Choose generation command
- **Context-Aware**: AI uses your project's prompts and context automatically

## Troubleshooting

### "Unsupported model version" Error

**Problem**: Model reports version v3, but AI SDK v5 only supports v2.

**Solution**: Use a different model in LM Studio that supports v2 specification. Models like Llama 3.2, Mistral, or other v2-compatible models should work.

### Provider shows as "undefined.chat"

**Problem**: The provider name isn't being set correctly.

**Solution**: Use `createOpenAICompatible` with the `name` parameter:

```typescript
// ✅ Correct - includes name parameter
const lm = createOpenAICompatible({
  name: "lmstudio",
  baseURL: "http://127.0.0.1:1234/v1",
  apiKey: "sk-local",
});

// ❌ Wrong - missing name parameter
const lm = createOpenAICompatible({
  baseURL: "http://127.0.0.1:1234/v1",
  apiKey: "sk-local",
});
```

### LM Studio Not Responding

1. **Check LM Studio is running**: Open LM Studio app, ensure server is running
2. **Check port**: Default is `1234`, verify in LM Studio settings
3. **Check model loaded**: Ensure a model is loaded in LM Studio
4. **Check baseURL**: Verify `LMSTUDIO_BASE_URL` matches LM Studio's server address

### Model Not Found

1. **Auto-detection**: The route tries to fetch from `/v1/models` endpoint
2. **Manual override**: Set `LMSTUDIO_MODEL` env var with exact model ID
3. **Check model ID**: Use LM Studio's API docs or check `/v1/models` response

## Related Files

- `app/api/chat/route.ts` - AI API endpoint
- `components/content-editor/BlockNoteEditor.tsx` - Editor with AI extension
- `lib/ai/prompts.ts` - Hierarchical prompt builder
- `lib/payload/collections/Projects.ts` - Project prompt fields
- `scripts/seed-magicborn-prompts.ts` - Seed default prompts

## References

- [BlockNote AI Documentation](https://www.blocknotejs.org/docs/features/ai/getting-started)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [LM Studio Documentation](https://lmstudio.ai/docs)
- [OpenAI-Compatible API](https://platform.openai.com/docs/api-reference)

