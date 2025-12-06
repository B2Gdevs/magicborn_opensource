#!/usr/bin/env bash
set -e

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AI_STACK_DIR="$REPO_DIR/infra/ai-stack"

echo "=== Magicborn dev: starting Ollama + Docker stack ==="

# 1) Ensure Ollama is installed
if ! command -v ollama >/dev/null 2>&1; then
  echo "❌ Ollama is not installed. Run ./scripts/install-ollama.sh first."
  exit 1
fi

# 2) Start Ollama server in background if not already running
echo "Checking Ollama server..."
if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
  echo "✅ Ollama server already running."
else
  echo "➡️  Starting Ollama server in background..."
  # nohup so it keeps running; logs go to ~/.ollama/ollama-dev.log
  nohup ollama serve > "$HOME/.ollama/ollama-dev.log" 2>&1 &
  # brief wait to let it start
  sleep 3
  if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
    echo "✅ Ollama server started."
  else
    echo "❌ Failed to reach Ollama server. Check $HOME/.ollama/ollama-dev.log"
    exit 1
  fi
fi

# 3) Start Docker stack (n8n + Qdrant + Postgres + web)
echo "➡️  Starting Docker stack (n8n + Qdrant + Postgres + web)..."
cd "$AI_STACK_DIR"
docker compose up
