#!/bin/bash
# Script to list all OpenWebUI knowledge bases
# Usage: ./list-openwebui-knowledge-bases.sh

OPENWEBUI_URL="${OPENWEBUI_URL:-http://localhost:8080}"

echo "Fetching knowledge bases from $OPENWEBUI_URL..."
echo ""

# Try to get knowledge bases list
RESPONSE=$(curl -s "$OPENWEBUI_URL/api/v1/knowledge/" 2>&1)

if echo "$RESPONSE" | grep -q -E '"id"|"name"|"title"'; then
  echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
else
  echo "Could not fetch knowledge bases. Response:"
  echo "$RESPONSE" | head -20
  echo ""
  echo "Note: You may need to:"
  echo "  1. Check if OpenWebUI is running"
  echo "  2. Check if authentication is required (we have it disabled)"
  echo "  3. Visit http://localhost:8080/api/v1/knowledge/ in your browser to see the API response"
fi







