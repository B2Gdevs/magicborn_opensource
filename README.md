📘 MAGICBORN — Development Environment

Welcome to the Magicborn development repository.
This project powers:

The Magicborn Content Editor (spells, effects, characters, worldbuilding)

The Magicborn landing site and documentation

The AI-assisted creation tools (via n8n + Qdrant + Ollama)

Internal utilities for managing story, game data, and creative workflows

Magicborn's editor and site are built with Next.js, supported by a full local AI stack to help generate content, maintain consistency, and accelerate your development pipeline.

🧙‍♂️ Project Overview

This repo includes:

1. Next.js Application

Located in the root (app/, components/):

Main website

Content editor UI

Spell crafting tools

Game data visualization

Future player-facing portals

2. Local AI Stack (Dockerized)

Inside infra/ai-stack/:

n8n → workflow engine + AI agent system

Qdrant → vector database for RAG

Postgres → n8n storage, metadata

Magicborn Web Service → Next.js dev server running inside Docker

Bind-mounts your public/ and data/ folders so n8n can read and ingest game assets

3. Native Ollama Installation (Manual)

Ollama runs outside Docker and provides:

Local LLM models (llama3, nomic-embed-text, etc.)

Fast inference on Apple Silicon or CPU fallback on other systems

Runtime for all Magicborn RAG workflows

⚙️ System Requirements

Before working with this repo, install the following:

✔ 1. Install Ollama (manual)

Download and install Ollama from the official site:

🔗 https://ollama.com/download

After installation, verify:

ollama --version


Then pull the required models:

ollama pull llama3
ollama pull nomic-embed-text


Ollama is used by n8n for embeddings and AI agent responses.

✔ 2. Install Docker Desktop

Download here:
https://www.docker.com/products/docker-desktop/

Enable:

Kubernetes: off

Use Apple/WSL virtualization defaults

🚀 Starting the Magicborn Dev Environment
Step 1 — Start Ollama locally

In a separate terminal:

ollama serve


Make sure it stays running.

Step 2 — Start Everything Else (Docker)

From the repo root:

cd infra/ai-stack
docker compose up


This runs:

Service	Purpose	URL
web	Next.js app	http://localhost:3000

n8n	Magicborn AI engine + workflows	http://localhost:5678

Qdrant	Vector DB	http://localhost:6333

Postgres	AI stack storage	local container only

Logs for all services appear in the same terminal.

Stop everything with:

Ctrl + C

🔍 Project Structure
magicborn_react/
  app/                     → Next.js routes, pages, API
  components/              → UI components
  data/                    → Game data (SQLite, JSON, lore files, etc.)
  infra/
    ai-stack/              → docker-compose.yml for n8n + Qdrant + Postgres + Web
  lib/                     → Utilities and core logic
  public/                  → Static assets, images, ingestable content
  scripts/                 → (Reserved for future automation)
  package.json
  README.md

🧠 Magicborn AI (RAG System)

The editor integrates with a local Retrieval-Augmented Generation (RAG) system.

Powered by:

Ollama — local model runtime

Qdrant — semantic search

n8n — AI workflows and chat endpoints

Used for:

Spell design recommendations

Procedural worldbuilding

Consistency checks across lore

Metadata generation

Content queries (rune interactions, magical theory, item descriptions, etc.)

The system reads from:

public/ assets

data/ SQLite DB + content files

Future endpoints defined by you

🛠️ Common Commands
Start Ollama manually:
ollama serve

Start entire stack:
cd infra/ai-stack
docker compose up

Rebuild web container after dependency changes:
docker compose build web

Clean all containers:
docker compose down -v

🧩 For Contributors
When editing AI workflows:

Visit:
http://localhost:5678

Export workflows into infra/ai-stack/n8n/demo-data if you want to version them.

When adding new lore or data:

Place inside:

data/ → database, structured game content

public/ → image assets, markdown documents, etc.

These will eventually be auto-ingested via n8n ingestion workflows.

🎉 You're Ready to Build Magicborn

Once Ollama + Docker are running:

Visit http://localhost:3000
 — your Next.js editor

Visit http://localhost:5678
 — your AI engine

Start creating spells, effects, characters, lore, and more

Magicborn now has a unified development playground where:

Game design tools

Worldbuilding

Procedural generation

Documentation

AI reasoning

Live editing

all exist in one integrated environment.