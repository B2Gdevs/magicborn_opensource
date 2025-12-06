#!/usr/bin/env bash
set -e

echo "=== Magicborn setup: Installing Ollama ==="

# Check if ollama is already installed
if command -v ollama >/dev/null 2>&1; then
  echo "Ollama is already installed."
else
  unameOut="$(uname -s)"

  case "${unameOut}" in
      Darwin*)
        echo "Detected macOS. Installing Ollama via PKG installer..."

        PKG_URL="https://ollama.ai/download/Ollama-darwin.pkg"
        PKG_PATH="/tmp/Ollama-darwin.pkg"

        echo "Downloading Ollama PKG..."
        curl -L "$PKG_URL" -o "$PKG_PATH"

        echo "Running PKG installer (requires sudo)..."
        sudo installer -pkg "$PKG_PATH" -target /

        rm "$PKG_PATH"

        echo "Starting Ollama service..."
        sudo launchctl stop ai.ollama || true
        sudo launchctl start ai.ollama
        ;;
      Linux*)
        echo "Detected Linux. Installing via official Linux script..."
        curl -fsSL https://ollama.ai/install.sh | sh
        ;;
      *)
        echo "Unsupported OS. Please install Ollama manually:"
        echo "https://ollama.ai"
        exit 1
        ;;
  esac
fi

echo "Pulling base Magicborn models..."
ollama pull llama3 || true
ollama pull nomic-embed-text || true

echo "✅ Ollama setup complete."
