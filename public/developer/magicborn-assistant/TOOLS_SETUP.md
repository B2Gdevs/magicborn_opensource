# Magicborn Assistant - Tool Server Setup

This guide explains how the Magicborn Assistant (powered by OpenWebUI) connects to your REST API as a tool server to access and manage your game database.

## Overview

OpenWebUI connects to your Next.js REST API as an external tool server. The API exposes game data operations (creatures, characters, environments, maps, regions, runes, effects) that OpenWebUI can call through function calling.

## Architecture

```
Magicborn Assistant (OpenWebUI)
    ↓
OpenAPI Specification (/api/docs/openapi.json)
    ↓
Tool Discovery & Direct API Calls
    ↓
Game Data API (/api/game-data/*)
    ↓
SQLite Database
```

OpenWebUI reads the OpenAPI specification to discover available endpoints and makes direct calls to your REST API endpoints.

## Setup Instructions

### 1. Configure Tool Server in OpenWebUI

1. **Open Magicborn Assistant Management**:
   - Navigate to `http://localhost:8080/`
   - Or click "Open in New Tab" from the chat interface

2. **Navigate to External Tools Settings**:
   - Go to **Settings** → **External Tools** (app-wide settings)
   - Look for **Tool Servers** section
   - Click **+** to add a new tool server

3. **Configure the Tool Server**:
   - **Name**: `Magicborn Game Data API`
   - **Base URL**: `http://web:3000` (use Docker service name when OpenWebUI is containerized)
   - **OpenAPI Spec URL**: `http://web:3000/api/docs/openapi.json`
   - **Authentication**: None (or configure if you add API keys later)
   
   **Important**: Since OpenWebUI runs in a Docker container, use the Docker service name `web` with the container port `3000` instead of `localhost:4300`. The container port mapping (4300:3000) only applies to host access, not inter-container communication.
   
   OpenWebUI will read the OpenAPI specification to discover all available endpoints and their operations.

4. **Save and Verify**:
   - Save the tool server configuration
   - OpenWebUI should automatically fetch the OpenAPI specification
   - Verify that tools are discovered and listed

### 2. Enable Tools for Your Model

1. **Go to Models**:
   - Navigate to **Workspace** → **Models**
   - Edit your model (or create `magicborn-content-assistant`)

2. **Enable Tool Server**:
   - Find "Magicborn Game Data API" in the available tool servers
   - Enable it for your model
   - Save

3. **Test**:
   - Start a chat with your model
   - Try: "List all creatures"
   - The model should use the tool server to fetch data

## OpenAPI Specification

The OpenAPI specification is the source of truth for tool discovery:

- **OpenAPI JSON**: `http://localhost:4300/api/docs/openapi.json`
- **Swagger UI**: `http://localhost:4300/api-docs`

OpenWebUI reads the OpenAPI specification to:
- Discover all available endpoints
- Understand request/response schemas
- Make direct API calls to `/api/game-data/*` endpoints
- Present available operations to the AI model

The OpenAPI spec defines all game data endpoints (creatures, characters, environments, maps, regions, runes, effects) with their full schemas.

## Available Endpoints

OpenWebUI discovers all available endpoints from the OpenAPI specification. The following game data endpoints are available:

### Query Endpoints (GET)
- `GET /api/game-data/creatures` - List all creatures
- `GET /api/game-data/creatures?id={id}` - Get creature by ID
- `GET /api/game-data/characters` - List all characters
- `GET /api/game-data/characters?id={id}` - Get character by ID
- `GET /api/game-data/environments` - List all environments
- `GET /api/game-data/environments?id={id}` - Get environment by ID
- `GET /api/game-data/maps` - List all maps
- `GET /api/game-data/maps?id={id}` - Get map by ID
- `GET /api/game-data/map-regions` - List map regions
- `GET /api/game-data/map-regions?id={id}` - Get map region by ID
- `GET /api/game-data/runes` - List all runes
- `GET /api/game-data/runes?code={code}` - Get rune by code
- `GET /api/game-data/effects` - List all effects
- `GET /api/game-data/effects?id={id}` - Get effect by ID

### Create Endpoints (POST)
- `POST /api/game-data/creatures` - Create a new creature
- `POST /api/game-data/characters` - Create a new character
- `POST /api/game-data/environments` - Create a new environment

### Update Endpoints (PUT)
- `PUT /api/game-data/creatures` - Update an existing creature
- `PUT /api/game-data/characters` - Update an existing character
- `PUT /api/game-data/environments` - Update an existing environment

### Delete Endpoints (DELETE)
- `DELETE /api/game-data/creatures?id={id}` - Delete a creature
- `DELETE /api/game-data/characters?id={id}` - Delete a character
- `DELETE /api/game-data/environments?id={id}` - Delete an environment

## Usage Examples

### Querying Data
- "List all creatures"
- "Show me the goblin creature"
- "What environments are available?"
- "Get information about the Tarro environment"
- "List all runes"
- "What does rune A do?"

### Creating Data (Sparingly)
- "Create a new creature called 'Dragon' with 500 HP and 200 mana"
- "Add a new character named 'Morgana'"

### Updating Data (Sparingly)
- "Update the goblin's HP to 150"
- "Change the Tarro environment description to..."

### Deleting Data (Extreme Caution)
- "Delete the test creature with ID 'test_creature'"

## CORS Configuration

The API endpoints include CORS headers to allow requests from OpenWebUI (`localhost:8080`). The following endpoint has CORS enabled:

- `/api/docs/openapi.json` - OpenAPI specification (for tool discovery)
- `/api/game-data/*` - All game data endpoints (for direct API calls)

## Security Considerations

1. **No Authentication**: Currently, the API has no authentication. For production, add API key authentication.

2. **Delete Operations**: Delete tools are marked as "use with extreme caution" in their descriptions to guide the AI.

3. **Edit Operations**: Edit operations are marked as "use sparingly" to prevent accidental mass updates.

4. **Localhost Only**: These endpoints are only accessible from localhost by default.

5. **CORS**: CORS is configured to allow requests from `localhost:8080` (OpenWebUI).

## Troubleshooting

### Tool Server Not Connecting

1. **Verify OpenAPI Spec is Accessible**:
   ```bash
   curl http://localhost:4300/api/docs/openapi.json
   ```
   Should return valid OpenAPI JSON.

2. **Check CORS Configuration**:
   - Ensure CORS headers are present in OpenAPI spec response
   - Verify OpenWebUI can reach `localhost:4300`
   - Check that `/api/game-data/*` endpoints have CORS enabled

3. **Check OpenWebUI Logs**:
   ```bash
   docker-compose logs openwebui
   ```
   Look for errors when fetching the OpenAPI specification.

4. **Docker Container Networking Issue**:
   If you see `ConnectionRefusedError: Connect call failed ('127.0.0.1', 4300)` in OpenWebUI logs:
   - This happens because OpenWebUI is trying to reach `localhost:4300` from inside its container
   - **Solution**: Use the Docker service name instead:
     - Change Base URL from `http://localhost:4300` to `http://web:3000`
     - Change OpenAPI Spec URL from `http://localhost:4300/api/docs/openapi.json` to `http://web:3000/api/docs/openapi.json`
   - The service name `web` is defined in `docker-compose.yml` and works for inter-container communication
   - Port `3000` is the container's internal port (not the host-mapped port `4300`)

### Tools Not Appearing

1. **Verify OpenAPI Spec is Accessible**:
   ```bash
   curl http://localhost:4300/api/docs/openapi.json
   ```

2. **Check Tool Server Configuration**:
   - Verify base URL is correct (`http://localhost:4300`)
   - Verify OpenAPI spec URL is correct
   - Check that tool server is enabled for your model

3. **Refresh Tool Server**:
   - In OpenWebUI, go to tool server settings
   - Click refresh/reload to fetch tools again

### API Calls Failing

1. **Check Next.js Server Logs**:
   - Look for errors in the Next.js console
   - Check for API endpoint errors
   - Verify CORS headers are being sent

2. **Verify Game Data API Endpoints**:
   ```bash
   curl http://localhost:4300/api/game-data/creatures
   curl http://localhost:4300/api/game-data/environments
   ```
   Should return valid JSON responses.

3. **Check CORS on Game Data Endpoints**:
   - Verify `/api/game-data/*` endpoints include CORS headers
   - Test with: `curl -H "Origin: http://localhost:8080" http://localhost:4300/api/game-data/creatures`

4. **Check Database**:
   - Ensure SQLite database is accessible
   - Verify database file exists and is readable

### Model Not Using Tools

1. **Verify Tool Server is Enabled**:
   - Check model settings
   - Ensure tool server is enabled for the model

2. **Check Model Supports Function Calling**:
   - Verify your model supports function calling
   - Some models may not support tools

3. **Try Explicit Requests**:
   - Ask explicitly: "Use the list_creatures tool to show me all creatures"
   - Some models need explicit instructions

## API Base URL Configuration

The tool execution uses `NEXT_PUBLIC_SITE_URL` environment variable or defaults to `http://localhost:4300`.

If your Next.js app runs on a different port, set:
```bash
NEXT_PUBLIC_SITE_URL=http://localhost:YOUR_PORT
```

## Next Steps

1. **Test the integration**:
   - Try asking questions about your game data
   - Test querying, creating, and updating entities

2. **Add authentication** (for production):
   - Implement API key authentication
   - Configure authentication in tool server settings

3. **Extend tools**:
   - Add more entity types (maps, regions, etc.)
   - Add more operations as needed

4. **Monitor usage**:
   - Check API logs for tool usage
   - Monitor database changes
