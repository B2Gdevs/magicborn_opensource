# Magicborn Assistant - Summary & Limitations

## What We Built

The Magicborn Assistant is an AI-powered chat interface (powered by OpenWebUI) that enables natural language interaction with your game database and project documentation.

## Key Features

### ✅ Chat Interface
- Embedded in developer workbench drawer
- Dedicated full-page at `/openwebui`
- Uses `magicborn-content-assistant` model
- Chat-only view with management link

### ✅ RAG (Retrieval Augmented Generation)
- Knowledge bases for project docs
- Access to `public/books` and `public/game-content`
- Automatic directory mounting
- Easy to add new folders

### ✅ Database Tools
- REST API tool server integration
- 20+ functions via OpenAPI specification
- Query, create, update, delete operations
- Access to creatures, characters, environments, maps, regions, runes, effects
- Safety warnings for destructive operations

### ✅ API Documentation
- Interactive Swagger UI at `/api-docs`
- OpenAPI 3.0 specification
- Complete endpoint documentation
- Try-it-out functionality

## Architecture Overview

```
User → Next.js App → Magicborn Assistant (OpenWebUI) → REST API Tool Server → Game Database
                                    ↓
                          Knowledge Bases (RAG)
```

## Quick Start

1. **Access Chat:**
   - Developer Workbench → OpenWebUI tab
   - Or navigate to `/openwebui`

2. **Set Up Knowledge Base:**
   - Open `http://localhost:8080/` (full interface)
   - Workspace → Knowledge → Create
   - Sync `/app/backend/data/public/books`

3. **Set Up Tool Server:**
   - Settings → External Tools → Tool Servers
   - Add tool server: `http://localhost:4300`
   - OpenAPI spec: `http://localhost:4300/api/docs/openapi.json`
   - Enable for your model

4. **Configure Model:**
   - Create `magicborn-content-assistant` model
   - Associate knowledge base
   - Enable tool server

## Use Cases

1. **Documentation Q&A** - Ask questions about your project
2. **Data Exploration** - Browse and search game entities
3. **Quick Data Entry** - Create entities via chat
4. **Content Writing** - Get style-consistent content suggestions
5. **Development Help** - Understand code and architecture

## Known Limitations

### 1. Directory Upload/Sync in Knowledge Base

**Issue:** The "Upload Directory" and "Sync Directory" features in OpenWebUI's knowledge base management don't work when OpenWebUI is embedded in an iframe.

**Why:** Browser security policies block file browser popups when content is embedded in iframes. This is a browser security feature, not a bug in OpenWebUI.

**Solution:** 
- **For directory uploads:** Open OpenWebUI in a separate tab (`http://localhost:8080/`) and use the directory upload feature there
- **For individual files:** Use "Upload File" with multiple file selection (`Cmd+Click` or `Ctrl+Click`) - this works in the embedded view
- **Alternative:** Use the sync script: `./scripts/sync-openwebui-knowledge.sh <knowledge-base-id> <directory-path>`

### 2. Settings and Management Interface

**Issue:** Some OpenWebUI settings and management features may not work properly when embedded.

**Solution:** Click the "Open in New Tab" button to open OpenWebUI in a new tab where all features work correctly.

### 3. File Browser Popups

**Issue:** File browser dialogs for directory selection are blocked in iframes.

**Solution:** Always use the full OpenWebUI interface (`http://localhost:8080/`) for any file browser operations.

## Best Practices

### For Chat
- ✅ Use the embedded chat interface in the developer workbench
- ✅ The `?layout=embedded` parameter hides the sidebar for a cleaner chat experience

### For Management
- ✅ Open OpenWebUI in a new tab for:
  - Knowledge base management
  - Directory uploads/sync
  - Settings configuration
  - Model management
  - Tool server configuration

### For File Uploads
- ✅ Individual files: Use "Upload File" in embedded view (works fine)
- ✅ Multiple files: Use `Cmd+Click` / `Ctrl+Click` to select multiple files
- ✅ Directories: Open in new tab or use the sync script

## Technical Details

### Why These Limitations Exist

1. **Browser Security:** Modern browsers block file dialogs in iframes to prevent malicious websites from accessing your file system
2. **X-Frame-Options:** Some features require full page context to function properly
3. **File Browser API:** The HTML5 file input API has restrictions when used in cross-origin iframes

### Workarounds

1. **Embedded Layout:** Using `?layout=embedded` provides a chat-only view
2. **New Tab for Management:** Opening management in a new tab bypasses all iframe restrictions
3. **API Scripts:** Using the OpenWebUI API directly (via scripts) bypasses UI limitations

## Files Created/Modified

### New Files
- `components/ai-stack/OpenWebUIChat.tsx` - Chat component
- `app/openwebui/page.tsx` - Dedicated chat page
- `app/api-docs/page.tsx` - Swagger UI page
- `app/api/docs/openapi.json/route.ts` - OpenAPI specification endpoint
- `lib/swagger.ts` - OpenAPI specification
- `lib/utils/cors.ts` - CORS helper for API routes
- `infra/ai-stack/openwebui-init.sh` - Startup script
- Documentation in `public/developer/magicborn-assistant/`

### Modified Files
- `components/DeveloperWorkbench.tsx` - Added Magicborn Assistant tab
- `components/SidebarNav.tsx` - Added "Magicborn Assistant" link
- `infra/ai-stack/docker-compose.yml` - OpenWebUI configuration

## Getting Help

If you encounter issues:
1. Try opening OpenWebUI in a new tab first
2. Check browser console for errors (F12 → Console)
3. Verify OpenWebUI is running: `docker-compose ps openwebui`
4. Check logs: `docker-compose logs openwebui`

## Next Steps

1. **Test the integration:**
   - Try asking questions about your docs
   - Query game data
   - Test creating/updating entities

2. **Customize:**
   - Add more entity types to tools
   - Expand knowledge bases
   - Configure model parameters

3. **Production readiness:**
   - Add authentication
   - Review security settings
   - Set up monitoring




