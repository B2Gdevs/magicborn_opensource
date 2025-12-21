# Magicborn AI System

## Overview

Custom Node.js AI system that uses Open WebUI's REST API for chat completion while handling tool calling ourselves. This provides reliable tool execution and full test coverage.

## Architecture

```
User Request
    ↓
AIAgent (lib/ai/agent.ts)
    ↓
OpenWebUIClient (lib/ai/clients/openwebui-client.ts)
    ↓
Open WebUI REST API (http://localhost:8080/api/v1/chat/completions)
    ↓
Model Response (with or without tool calls)
    ↓
ToolRegistry (lib/ai/tools/registry.ts)
    ↓
Game Data API (http://localhost:4300/api/game-data/*)
    ↓
Response to User
```

## Components

### 1. AIAgent (`lib/ai/agent.ts`)
Main agent that orchestrates chat and tool calling.

**Features**:
- Handles conversation flow
- Detects tool calls from model
- Executes tools via ToolRegistry
- Manages tool call iterations (max 5 by default)
- Supports streaming responses

**Usage**:
```typescript
import { createGameDataAgent } from "@/lib/ai";

const agent = createGameDataAgent({
  openWebUIBaseUrl: "http://localhost:8080",
  defaultModel: "magicborn-content-assistant",
  systemPrompt: "You are a helpful assistant...",
});

const result = await agent.chat("List all creatures");
console.log(result.response);
```

### 2. OpenWebUIClient (`lib/ai/clients/openwebui-client.ts`)
REST API client for Open WebUI chat completion.

**Features**:
- Non-streaming chat completion
- Streaming chat completion
- Connection health check
- Error handling and timeouts

**API Endpoint**: `POST /api/v1/chat/completions`

### 3. ToolRegistry (`lib/ai/tools/registry.ts`)
Manages available tools and executes them.

**Features**:
- Register tools
- Get tool definitions (OpenAPI format)
- Execute tools with error handling

### 4. Game Data Tools (`lib/ai/tools/game-data-tools.ts`)
Pre-built tools for game data API.

**Available Tools**:
- `list_creatures` - List all creatures
- `get_creature` - Get creature by ID
- `list_characters` - List all characters
- `get_character` - Get character by ID
- `list_environments` - List all environments
- `get_environment` - Get environment by ID
- `list_maps` - List all maps
- `get_map` - Get map by ID
- `list_runes` - List all runes
- `get_rune` - Get rune by code
- `list_effects` - List all effects
- `get_effect` - Get effect by ID

## Usage Examples

### Basic Chat

```typescript
import { createGameDataAgent } from "@/lib/ai";

const agent = createGameDataAgent({
  openWebUIBaseUrl: "http://localhost:8080",
  defaultModel: "magicborn-content-assistant",
});

const result = await agent.chat("What creatures are in the game?");
console.log(result.response);
console.log(`Made ${result.toolCalls} tool calls`);
```

### Streaming Chat

```typescript
for await (const chunk of agent.chatStream("List all creatures")) {
  if (chunk.type === "content") {
    process.stdout.write(chunk.data);
  } else if (chunk.type === "tool_call") {
    console.log(`\nCalling tool: ${chunk.data.tool}`);
  } else if (chunk.type === "done") {
    console.log(`\n\nFinal: ${chunk.data.content}`);
  }
}
```

### Custom Tools

```typescript
import { AIAgent } from "@/lib/ai";
import { ToolExecutor } from "@/lib/ai/types";

const customTool: ToolExecutor = {
  name: "custom_tool",
  description: "A custom tool",
  schema: {
    type: "object",
    properties: {
      input: { type: "string" },
    },
    required: ["input"],
  },
  execute: async (args) => {
    // Your tool logic
    return { success: true, result: `Processed: ${args.input}` };
  },
};

const agent = new AIAgent({
  config: {
    openWebUIBaseUrl: "http://localhost:8080",
    defaultModel: "magicborn-content-assistant",
  },
});

agent.registerTools([customTool]);
```

## Testing

Unit tests are located in `lib/__tests__/ai/`:

- `openwebui-client.test.ts` - Tests for Open WebUI client
- `tool-registry.test.ts` - Tests for tool registry

Run tests:
```bash
npm test lib/__tests__/ai
```

## Configuration

### Environment Variables

- `NEXT_PUBLIC_SITE_URL` - Base URL for game data API (default: `http://localhost:4300`)
- `OPENWEBUI_BASE_URL` - Open WebUI base URL (default: `http://localhost:8080`)

### Docker Network

When running in Docker, use service names:
- Open WebUI: `http://openwebui:8080` (from other containers)
- Game Data API: `http://web:3000` (from other containers)

## API Integration

### Open WebUI REST API

The system uses Open WebUI's OpenAI-compatible REST API:

**Endpoint**: `POST /api/v1/chat/completions`

**Request Format**:
```json
{
  "model": "magicborn-content-assistant",
  "messages": [
    { "role": "user", "content": "List all creatures" }
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "list_creatures",
        "description": "...",
        "parameters": { ... }
      }
    }
  ],
  "tool_choice": "auto"
}
```

**Response Format**:
```json
{
  "id": "chatcmpl-...",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": null,
        "tool_calls": [
          {
            "id": "call_...",
            "type": "function",
            "function": {
              "name": "list_creatures",
              "arguments": "{}"
            }
          }
        ]
      },
      "finish_reason": "tool_calls"
    }
  ]
}
```

### Game Data API

Tools call our REST API endpoints:

- `GET /api/game-data/creatures` - List creatures
- `GET /api/game-data/creatures?id={id}` - Get creature
- `GET /api/game-data/characters` - List characters
- `GET /api/game-data/environments` - List environments
- `GET /api/game-data/maps` - List maps
- `GET /api/game-data/runes` - List runes
- `GET /api/game-data/effects` - List effects

## Benefits Over Open WebUI Tool System

1. **Reliability**: Full control over tool execution
2. **Testability**: Unit testable components
3. **Debugging**: Clear error messages and logging
4. **Flexibility**: Easy to add custom tools
5. **Performance**: Direct API calls, no intermediate layers

## Next Steps

1. Add API route wrapper (`app/api/ai/chat/route.ts`)
2. Add integration tests
3. Add error recovery and retry logic
4. Add conversation memory/persistence
5. Add rate limiting and usage tracking

