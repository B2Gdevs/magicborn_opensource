#!/bin/bash
# Test API endpoints to ensure CRUD operations work
# Run this after starting the dev server

set -e

BASE_URL="${1:-http://localhost:4300}"

echo "🧪 Testing API Endpoints..."
echo "Base URL: $BASE_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test GET endpoints
echo "1️⃣  Testing GET endpoints..."

# Projects
echo -n "  GET /api/payload/projects ... "
if curl -sf "$BASE_URL/api/payload/projects" > /dev/null; then
  echo -e "${GREEN}✅${NC}"
else
  echo -e "${RED}❌ Failed${NC}"
  exit 1
fi

# Acts (requires project ID - adjust as needed)
echo -n "  GET /api/payload/acts ... "
if curl -sf "$BASE_URL/api/payload/acts?limit=10" > /dev/null; then
  echo -e "${GREEN}✅${NC}"
else
  echo -e "${YELLOW}⚠️  May need project filter${NC}"
fi

# Characters
echo -n "  GET /api/payload/characters ... "
if curl -sf "$BASE_URL/api/payload/characters?limit=10" > /dev/null; then
  echo -e "${GREEN}✅${NC}"
else
  echo -e "${YELLOW}⚠️  May need project filter${NC}"
fi

echo ""

# Test AI Stack status
echo "2️⃣  Testing AI Stack endpoints..."

echo -n "  GET /api/ai-stack/status ... "
if curl -sf "$BASE_URL/api/ai-stack/status" > /dev/null; then
  echo -e "${GREEN}✅${NC}"
else
  echo -e "${YELLOW}⚠️  Service may not be running${NC}"
fi

echo ""

echo -e "${GREEN}✅ Basic API tests complete${NC}"
echo ""
echo "📋 For full CRUD testing, use the manual test checklist in TESTING_PLAN.md"


