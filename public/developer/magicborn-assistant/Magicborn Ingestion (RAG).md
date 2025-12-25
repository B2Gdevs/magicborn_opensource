# Magicborn Ingestion (RAG)

The Magicborn Assistant uses RAG (Retrieval Augmented Generation) to provide AI-powered access to your project documentation and game content through knowledge bases.

## What is Magicborn Assistant?

Magicborn Assistant is built on OpenWebUI and provides:
- **Chat interface** for asking questions about your project
- **RAG (Retrieval Augmented Generation)** with access to your documentation and game content
- **Database tools** to query, create, update, and delete game entities
- **API documentation** via interactive Swagger UI

## Quick Start

Get the Magicborn Assistant up and running in 5 minutes.

### Prerequisites

- Docker and Docker Compose installed
- Next.js app running
- OpenWebUI container running (part of `infra/ai-stack`)

### Step 1: Verify OpenWebUI is Running

```bash
cd infra/ai-stack
docker-compose ps openwebui
```

Should show `Up` status. If not:
```bash
docker-compose up -d openwebui
```

### Step 2: Access the Chat

**Option A: Developer Workbench**
1. Open Content Editor
2. Click terminal icon (Developer Workbench)
3. Select "OpenWebUI" tab

**Option B: Dedicated Page**
- Navigate to `/openwebui`
- Or click "Magicborn Assistant" in sidebar

## Setting Up RAG (Knowledge Bases)

### Prerequisites

- Magicborn Assistant (OpenWebUI) running at `http://localhost:8080/`
- Folders are already mounted in the Docker container:
  - `/data/nextjs_public/books` - Contains all book content (Markdown files)
  - `/data/nextjs_public/game-content` - Contains game assets and content

### Step 1: Create Knowledge Bases

1. Open Magicborn Assistant management in your browser: `http://localhost:8080/`
   - Or click "Open in New Tab" from the chat interface
2. Navigate to **Workspace** → **Knowledge** (in the left sidebar)
3. Click the **+** button to create a new knowledge base

#### Create "Books Knowledge Base"
- **Name:** `Magicborn Books`
- **Description:** `All book content including Mordred's Legacy and Mordred's Tale`
- Click **Create Knowledge**

#### Create "Game Content Knowledge Base" (Optional)
- **Name:** `Game Content`
- **Description:** `Game content assets and documentation`
- Click **Create Knowledge**

### Step 2: Sync Directories

#### For Books Knowledge Base:

1. Click on the **Magicborn Books** knowledge base
2. Click the **+** icon next to the search bar
3. Select **Sync Directory** or **Upload Directory**
4. In the file browser, navigate to: `/app/backend/data/public/books`
   - **Note:** This is a direct mount of your `public/books` folder
5. Select the folder and confirm

This will sync all Markdown files from:
- `public/books/mordreds_legacy/stories/`
- `public/books/mordreds_tale/chapters/`

#### For Game Content (Optional):

1. Click on the **Game Content** knowledge base
2. Click the **+** icon
3. Select **Sync Directory** or **Upload Directory**
4. Navigate to: `/app/backend/data/public/game-content`
   - **Note:** This is a direct mount of your `public/game-content` folder
5. Select the folder and confirm

#### For Design Folder:

1. Create a knowledge base for "Design Documentation"
2. Navigate to: `/app/backend/data/public/design`
3. Select and sync the folder

#### For Developer Documentation:

1. Create a knowledge base for "Developer Docs"
2. Navigate to: `/app/backend/data/public/developer`
3. Select and sync the folder

**Note:** Game content contains mostly images (PNG files). RAG works best with text files. You may want to focus on the books folder for RAG, and use game-content for reference only.

### Step 3: Associate Knowledge Base with Models

1. Navigate to **Workspace** → **Models**
2. Click **+** to add/edit a model
3. In the model configuration:
   - **Knowledge Source:** Select your knowledge base (e.g., "Magicborn Books")
   - Configure other model settings as needed
4. Save the model

### Step 4: Use RAG in Chat

Once configured:

1. Start a new chat in OpenWebUI
2. Select a model that has a knowledge base associated
3. Ask questions about your content, for example:
   - "What is Mordred's Legacy about?"
   - "Tell me about Morgana's story"
   - "What happened in Chapter 1?"

The model will use the RAG knowledge base to provide accurate answers based on your documents.

## Access Points

| Location | How to Access | Purpose |
|----------|--------------|---------|
| **Developer Workbench** | Content Editor → Terminal icon → OpenWebUI tab | Embedded chat in workbench |
| **Dedicated Page** | `/openwebui` or "Magicborn Assistant" in sidebar | Full-screen chat interface |
| **Full Management** | Click "Open in New Tab" or `http://localhost:8080/` | Complete OpenWebUI interface |
| **API Documentation** | `/api-docs` | Interactive Swagger UI |

## Architecture

```
Magicborn Assistant (OpenWebUI)
├── Chat Interface
│   ├── Embedded (Developer Workbench)
│   └── Full Page (/openwebui)
├── Knowledge Bases (RAG)
│   ├── Books
│   ├── Game Content
│   ├── Design
│   └── Developer Docs
└── REST API Tool Server
    ├── OpenAPI Spec (/api/docs/openapi.json)
    │   └── Tool Discovery
    └── Game Data API (/api/game-data/*)
         └── Direct API Calls
              ↓
    Game Database (SQLite)
```

## Directory Structure Reference

**Inside OpenWebUI container (use these paths in the UI):**
```
/app/backend/data/public/books/          # Direct mount of public/books
/app/backend/data/public/game-content/   # Direct mount of public/game-content
/app/backend/data/public/design/         # Direct mount of public/design
/app/backend/data/public/developer/      # Direct mount of public/developer
```

**Adding New Folders:**

To add a new folder from your `public/` directory to OpenWebUI:

1. Edit `infra/ai-stack/docker-compose.yml`
2. Add a new volume mount under the `openwebui` service:
   ```yaml
   - ../../public/your-new-folder:/app/backend/data/public/your-new-folder:ro
   ```
3. Restart OpenWebUI: `docker-compose restart openwebui`
4. Access it at: `/app/backend/data/public/your-new-folder`

**Important:** Always use `/app/backend/data/public/[folder-name]` when selecting directories in OpenWebUI's knowledge base interface.

## Troubleshooting

### Chat Not Loading?
- Check OpenWebUI is running: `docker-compose ps openwebui`
- Check logs: `docker-compose logs openwebui`

### 401 Unauthorized?
- Clear database: `rm infra/ai-stack/openwebui-data/webui.db*`
- Restart: `docker-compose restart openwebui`

### Files Not Appearing
- Ensure the Docker container has read permissions
- Check that files are in the correct mounted directory
- Verify the mount path in `docker-compose.yml`

### Sync/Upload Directory Not Working

**⚠️ Important:** This is a known limitation when OpenWebUI is embedded in an iframe.

**Quick Solutions:**

1. **Open in New Tab** (Recommended):
   - Click the "Open in New Tab" button in the chat interface
   - Or navigate directly to `http://localhost:8080/`
   - Use directory upload/sync in the full interface

2. **Upload Multiple Files**:
   - Click **+** → **Upload File**
   - Use `Ctrl+Click` (Windows/Linux) or `Cmd+Click` (Mac) to select multiple files
   - Select all `.md` files from your books folder

3. **Use Sync Script**:
   - Run: `./scripts/sync-openwebui-knowledge.sh <knowledge-base-id> ./public/books`
   - See script documentation for details

### RAG Not Responding
- Ensure a knowledge base is associated with your model
- Check that documents were successfully indexed
- Verify the model supports RAG functionality

### Directory Upload Not Working?
- Use full OpenWebUI interface (click "Open in New Tab")
- Or upload files individually

## Use Cases

1. **Documentation Q&A** - Ask questions about your project
2. **Data Exploration** - Browse and search game entities
3. **Quick Data Entry** - Create entities via natural language
4. **Content Writing** - Get style-consistent content suggestions
5. **Development Help** - Understand code and architecture






