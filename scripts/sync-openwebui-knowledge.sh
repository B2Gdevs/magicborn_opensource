#!/bin/bash
# Script to sync directories to OpenWebUI knowledge base via API
# Usage: ./sync-openwebui-knowledge.sh <knowledge-base-id> <local-directory-path>
# Example: ./sync-openwebui-knowledge.sh abc123 ./public/books

set -e

KNOWLEDGE_BASE_ID="${1}"
LOCAL_DIR="${2}"
OPENWEBUI_URL="${OPENWEBUI_URL:-http://localhost:8080}"

if [ -z "$KNOWLEDGE_BASE_ID" ] || [ -z "$LOCAL_DIR" ]; then
  echo "Usage: $0 <knowledge-base-id> <local-directory-path>"
  echo ""
  echo "Example:"
  echo "  $0 abc123 ./public/books"
  echo ""
  echo "To find your knowledge base ID:"
  echo "  1. Go to OpenWebUI → Workspace → Knowledge"
  echo "  2. Click on your knowledge base"
  echo "  3. Check the URL - the ID is in the path (e.g., /knowledge/abc123)"
  exit 1
fi

if [ ! -d "$LOCAL_DIR" ]; then
  echo "Error: Directory '$LOCAL_DIR' does not exist"
  exit 1
fi

echo "Syncing files from '$LOCAL_DIR' to knowledge base '$KNOWLEDGE_BASE_ID'..."
echo "OpenWebUI URL: $OPENWEBUI_URL"
echo ""

# Count files to process
FILE_COUNT=$(find "$LOCAL_DIR" -type f \( -name "*.md" -o -name "*.txt" -o -name "*.mdx" \) | wc -l | tr -d ' ')
echo "Found $FILE_COUNT text files to upload"
echo ""

UPLOADED=0
FAILED=0

# Process each file
find "$LOCAL_DIR" -type f \( -name "*.md" -o -name "*.txt" -o -name "*.mdx" \) | while read -r file; do
  filename=$(basename "$file")
  echo -n "Uploading $filename... "
  
  # Upload file to OpenWebUI
  UPLOAD_RESPONSE=$(curl -s -X POST "$OPENWEBUI_URL/api/v1/files/" \
    -H "Accept: application/json" \
    -F "file=@$file" 2>&1)
  
  # Check if upload was successful (response should contain file_id or id)
  if echo "$UPLOAD_RESPONSE" | grep -q -E '"file_id"|"id"|"fileId"'; then
    # Extract file ID (try different possible field names)
    FILE_ID=$(echo "$UPLOAD_RESPONSE" | grep -oE '"file_id"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4 || \
              echo "$UPLOAD_RESPONSE" | grep -oE '"id"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4 || \
              echo "$UPLOAD_RESPONSE" | grep -oE '"fileId"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$FILE_ID" ] && [ "$FILE_ID" != "null" ]; then
      # Add file to knowledge base
      ADD_RESPONSE=$(curl -s -X POST "$OPENWEBUI_URL/api/v1/knowledge/$KNOWLEDGE_BASE_ID/file/add" \
        -H "Content-Type: application/json" \
        -d "{\"file_id\": \"$FILE_ID\"}" 2>&1)
      
      if echo "$ADD_RESPONSE" | grep -q -E '"success"|"status"|"message"'; then
        echo "✅"
        UPLOADED=$((UPLOADED + 1))
      else
        echo "⚠️  (uploaded but failed to add to KB)"
        FAILED=$((FAILED + 1))
      fi
    else
      echo "❌ (failed to get file ID)"
      FAILED=$((FAILED + 1))
    fi
  else
    echo "❌ (upload failed)"
    echo "   Response: $UPLOAD_RESPONSE" | head -1
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo "✅ Sync complete!"
echo "   Uploaded: $UPLOADED files"
if [ $FAILED -gt 0 ]; then
  echo "   Failed: $FAILED files"
fi
echo ""
echo "Check OpenWebUI to verify files were added to your knowledge base."




