# Magicborn Assistant

AI-powered assistant for the Magicborn game, providing natural language interaction with game data and documentation.

## Current Status

### ✅ Working
- **Chat Interface**: Open WebUI embedded chat and full-page interface
- **RAG (Knowledge Bases)**: Access to project documentation, books, game content
- **Custom AI System**: Node.js AI system with reliable tool calling (NEW)

### ❌ Not Working
- **Open WebUI Tool Calling**: Both Python tools and REST API tool servers fail silently
  - See [TOOL_CALLING_FAILURES.md](./TOOL_CALLING_FAILURES.md) for details

## Quick Start

### Using the Custom AI System (Recommended)

The new custom AI system provides reliable tool calling:

```typescript
import { createGameDataAgent } from "@/lib/ai";

const agent = createGameDataAgent({
  openWebUIBaseUrl: "http://localhost:8080",
  defaultModel: "magicborn-content-assistant",
});

const result = await agent.chat("List all creatures");
console.log(result.response);
```

See [AI_SYSTEM.md](./AI_SYSTEM.md) for full documentation.

### Using Open WebUI Chat (RAG Only)

1. Access chat at `/openwebui` or via Developer Workbench
2. Chat uses RAG knowledge bases for documentation Q&A
3. Tool calling does NOT work (see failures doc)

## Documentation

- **[AI_SYSTEM.md](./AI_SYSTEM.md)** - Custom Node.js AI system documentation
- **[TOOL_CALLING_FAILURES.md](./TOOL_CALLING_FAILURES.md)** - Why Open WebUI tool calling doesn't work
- **[TOOLS_SETUP.md](./TOOLS_SETUP.md)** - Historical setup guide (for reference)
- **[SUMMARY.md](./SUMMARY.md)** - Overview of features and architecture
- **[Magicborn Ingestion (RAG).md](./Magicborn%20Ingestion%20(RAG).md)** - RAG/knowledge base setup

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Request                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   Custom AI System     │
         │   (lib/ai/agent.ts)    │
         └───────────┬────────────┘
                     │
         ┌───────────┴────────────┐
         │                        │
         ▼                        ▼
┌──────────────────┐    ┌──────────────────┐
│  Open WebUI       │    │  Tool Registry   │
│  REST API         │    │  (Game Data API) │
│  (Chat Only)       │    │                  │
└──────────────────┘    └──────────────────┘
```

## Features

### Chat Interface
- Embedded in Developer Workbench
- Full-page at `/openwebui`
- Uses `magicborn-content-assistant` model

### RAG (Retrieval Augmented Generation)
- Knowledge bases for project docs
- Access to `public/books`, `public/game-content`, `public/design`, `public/developer`
- Automatic directory mounting in Docker

### Game Data Access (Custom AI System)
- Query creatures, characters, environments, maps, runes, effects
- Direct REST API integration
- Reliable tool execution
- Full unit test coverage

## Development

### Running Tests

```bash
# Test AI system components
npm test lib/__tests__/ai

# Test all
npm test
```

### Adding New Tools

1. Create tool executor in `lib/ai/tools/`
2. Register with `ToolRegistry`
3. Add unit tests
4. Update documentation

### Docker Setup

The AI system works with Docker networking:

- Open WebUI: `http://openwebui:8080` (from containers)
- Game Data API: `http://web:3000` (from containers)
- Host access: `http://localhost:8080` and `http://localhost:4300`

## Troubleshooting

### Tool Calling Not Working
- **If using Open WebUI tools**: They don't work. Use the custom AI system instead.
- **If using custom AI system**: Check logs, verify Open WebUI is accessible, verify game data API is running.

### Connection Issues
- Verify Docker containers are on same network (`demo`)
- Check service names match `docker-compose.yml`
- Verify ports are correctly mapped

## Next Steps

1. ✅ Document tool calling failures
2. ✅ Build custom AI system
3. 🔄 Add API route wrapper for web interface
4. 🔄 Add integration tests
5. 🔄 Add conversation persistence
6. 🔄 Add rate limiting

## References

- Open WebUI Docs: https://docs.openwebui.com
- Open WebUI REST API: https://docs.openwebui.com/api
- Our OpenAPI Spec: `http://localhost:4300/api/docs/openapi.json`
