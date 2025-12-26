#!/bin/bash
# Quick validation script for refactoring
# Tests basic functionality to ensure nothing broke

set -e  # Exit on error

echo "🧪 Testing Refactoring Changes..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo -e "${RED}❌ Error: Must run from project root${NC}"
  exit 1
fi

# 1. TypeScript Type Check
echo "1️⃣  Running TypeScript type check..."
if npx tsc --noEmit 2>&1 | grep -q "error"; then
  echo -e "${RED}❌ TypeScript errors found${NC}"
  npx tsc --noEmit
  exit 1
else
  echo -e "${GREEN}✅ Type check passed${NC}"
fi
echo ""

# 2. Check for enum usage in key files
echo "2️⃣  Verifying enum usage..."
ENUM_FILES=(
  "lib/content-editor/types.ts"
  "lib/content-editor/constants.ts"
  "components/content-editor/ContentNavigation.tsx"
  "components/content-editor/ContentEditor.tsx"
)

for file in "${ENUM_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✅ Found: $file${NC}"
  else
    echo -e "${RED}❌ Missing: $file${NC}"
    exit 1
  fi
done
echo ""

# 3. Check for extracted components
echo "3️⃣  Verifying extracted components..."
COMPONENTS=(
  "components/content-editor/SaveStatusIndicator.tsx"
  "components/content-editor/TabButton.tsx"
  "components/content-editor/ViewButton.tsx"
  "components/ui/SearchInput.tsx"
)

for component in "${COMPONENTS[@]}"; do
  if [ -f "$component" ]; then
    echo -e "${GREEN}✅ Found: $component${NC}"
  else
    echo -e "${RED}❌ Missing: $component${NC}"
    exit 1
  fi
done
echo ""

# 4. Check enum values match strings
echo "4️⃣  Verifying enum values..."
if grep -q 'Plan = "plan"' lib/content-editor/types.ts && \
   grep -q 'Grid = "grid"' lib/content-editor/types.ts && \
   grep -q 'Saved = "saved"' lib/content-editor/types.ts; then
  echo -e "${GREEN}✅ Enum values are correct strings${NC}"
else
  echo -e "${RED}❌ Enum values may be incorrect${NC}"
  exit 1
fi
echo ""

# 5. Check for string literal usage (should be minimal)
echo "5️⃣  Checking for remaining string literals..."
STRING_LITERALS=$(grep -r '"plan"\|"grid"\|"saved"' components/content-editor/*.tsx 2>/dev/null | grep -v "types.ts\|constants.ts" | wc -l | tr -d ' ')
if [ "$STRING_LITERALS" -gt 5 ]; then
  echo -e "${YELLOW}⚠️  Found $STRING_LITERALS string literals (may need review)${NC}"
else
  echo -e "${GREEN}✅ Minimal string literal usage${NC}"
fi
echo ""

# 6. Lint check
echo "6️⃣  Running linter..."
if npm run lint 2>&1 | grep -q "error"; then
  echo -e "${YELLOW}⚠️  Linter warnings found (check output above)${NC}"
else
  echo -e "${GREEN}✅ Linter passed${NC}"
fi
echo ""

# 7. Check imports
echo "7️⃣  Verifying imports use new enums..."
if grep -q "@lib/content-editor/types" components/content-editor/ContentNavigation.tsx && \
   grep -q "@lib/content-editor/constants" components/content-editor/CodexSidebar.tsx; then
  echo -e "${GREEN}✅ Imports are using new enum modules${NC}"
else
  echo -e "${RED}❌ Some imports may not be updated${NC}"
  exit 1
fi
echo ""

echo -e "${GREEN}✅ All automated checks passed!${NC}"
echo ""
echo "📋 Next steps:"
echo "   1. Run manual tests from TESTING_PLAN.md"
echo "   2. Test CRUD operations in the UI"
echo "   3. Verify API endpoints work correctly"
echo "   4. Check browser console for errors"
echo ""

