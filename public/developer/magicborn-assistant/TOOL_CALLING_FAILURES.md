# Open WebUI Tool Calling - Known Failures

## Status: ❌ NOT WORKING

**Date**: 2024-12-19  
**Decision**: Pivoting to custom Node.js AI system using Open WebUI REST API for chat only

## Attempted Approaches

### 1. Python Tools (Custom Functions)
**Status**: ❌ Failed  
**Location**: `infra/ai-stack/openwebui-tools/magicborn_game_data.py`

**What We Tried**:
- Created Python tool functions following Open WebUI's tool format
- Added tool via "New Tool" in Open WebUI workspace
- Configured API base URL to call our REST endpoints

**Issues Encountered**:
- Tools never appeared in chat interface
- No error messages, just silent failure
- Tool registration appeared successful but tools were never available
- Model never received tool definitions

**Documentation**: See `infra/ai-stack/openwebui-tools/README.md`

---

### 2. REST API Tool Server (Admin Configuration)
**Status**: ❌ Failed  
**Location**: Open WebUI Admin Settings → External Tools → Tool Servers

**What We Tried**:
- Configured tool server with OpenAPI specification
- Used Docker network URL: `http://web:3000/api/docs/openapi.json`
- Verified OpenAPI spec is valid and accessible
- Enabled tool server for model configuration
- Tried both admin-level and user-level tool servers

**Issues Encountered**:
- OpenAPI spec fetched successfully (verified in logs)
- Tools discovered and listed in admin panel
- Tools enabled for model
- **But**: Model never calls tools, tools never appear in chat
- No function calling happens despite correct configuration
- Open WebUI claims REST API is "first class citizen" but it doesn't work

**Configuration Attempted**:
- Base URL: `http://web:3000` (Docker network)
- OpenAPI Spec: `http://web:3000/api/docs/openapi.json`
- Authentication: None (development)
- Model: `magicborn-content-assistant`

**OpenAPI Spec Details**:
- Valid OpenAPI 3.0 specification
- 20+ endpoints defined
- All endpoints have `operationId` set
- Servers array includes Docker network URL first
- CORS headers configured correctly

**Documentation**: See `public/developer/magicborn-assistant/TOOLS_SETUP.md`

---

### 3. MCP (Model Context Protocol)
**Status**: ⚠️ Not Attempted (Open WebUI Recommended REST API)

**Why Not Used**:
- Open WebUI documentation explicitly recommended REST API over MCP
- They stated REST API is "first class citizen"
- MCP support appeared less mature

---

## Root Cause Analysis

### Why Tool Calling Fails

1. **Open WebUI Tool System is Unreliable**
   - Despite documentation claiming REST API tool servers are "first class", they don't work
   - No clear error messages when tools fail to register
   - Silent failures make debugging impossible

2. **Model Integration Issues**
   - Even when tools are "discovered" and "enabled", models don't receive them
   - Function calling never triggers
   - No way to verify tool availability to the model

3. **Docker Networking Complexity**
   - Multiple URL configurations needed (host vs container)
   - OpenAPI spec servers array must match request source
   - Network issues mask actual tool registration problems

4. **Lack of Debugging Tools**
   - No logs showing tool execution attempts
   - No way to verify model received tool definitions
   - Admin panel shows tools as "enabled" but they don't work

---

## Decision: Build Custom AI System

Since Open WebUI's tool calling is unreliable, we're building our own Node.js AI system that:

1. **Uses Open WebUI REST API for Chat Only**
   - Open WebUI is stable for hosting Ollama models
   - REST API for chat completion works reliably
   - We'll use it purely as a model hosting/chat endpoint

2. **Custom Tool Calling System**
   - Our Node.js system will handle tool/function calling
   - Direct integration with our REST APIs
   - Full control over tool execution
   - Unit testable architecture

3. **Benefits**
   - Reliable tool execution
   - Full test coverage
   - Complete control over AI behavior
   - Can switch models easily
   - Better error handling and logging

---

## Open WebUI REST API for Chat

Open WebUI exposes a REST API for chat completion. We'll use this instead of tool calling.

### Endpoints (from Open WebUI documentation)

**Chat Completion**:
```
POST http://localhost:8080/api/v1/chat/completions
```

**Request Format**:
```json
{
  "model": "magicborn-content-assistant",
  "messages": [
    { "role": "user", "content": "List all creatures" }
  ],
  "stream": false
}
```

**Response Format**:
```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "magicborn-content-assistant",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Here are the creatures..."
      },
      "finish_reason": "stop"
    }
  ]
}
```

**Streaming**:
Set `"stream": true` for streaming responses.

---

## Next Steps

1. ✅ Document tool calling failures (this document)
2. 🔄 Build Node.js AI system structure
3. 🔄 Implement Open WebUI REST API client
4. 🔄 Implement custom tool calling system
5. 🔄 Add unit tests
6. 🔄 Integrate with game data APIs

---

## References

- Open WebUI Tool Server Docs: https://docs.openwebui.com/features/tool-server
- Open WebUI REST API: https://docs.openwebui.com/api
- Our OpenAPI Spec: `http://localhost:4300/api/docs/openapi.json`
- Tool Setup Guide: `public/developer/magicborn-assistant/TOOLS_SETUP.md`


