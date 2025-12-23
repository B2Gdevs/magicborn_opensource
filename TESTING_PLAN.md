# Testing Plan: Refactoring Validation

## Overview
This plan ensures that the enum/type refactoring and component extraction didn't break any existing functionality, especially CRUD operations and API compatibility.

## Quick Start

### Visual Testing (Recommended)
**Postman Collection** - Import and test visually:
1. Open Postman
2. Import from URL: `http://localhost:4300/api/openapi`
   - OR import files from `postman/` directory
3. Select "Magicborn Local Dev" environment
4. Run requests to test CRUD operations

**Swagger UI** - Built-in interactive explorer:
- Navigate to: `http://localhost:4300/docs/swagger`
- Click "Try it out" on any endpoint
- Execute requests directly in browser

See `postman/README.md` for detailed instructions.

### Automated Tests
```bash
# Run automated validation script
./scripts/test-refactoring.sh

# Test API endpoints (requires dev server running)
./scripts/test-api-endpoints.sh
```

### Manual Testing Priority
1. **Critical Path** (Do First):
   - [ ] Create/Edit/Delete Acts, Chapters, Scenes
   - [ ] Create/Edit/Delete Characters
   - [ ] Verify enum values convert to strings in API calls
   - [ ] Check browser console for errors

2. **Important** (Do Second):
   - [ ] All Codex categories work
   - [ ] Save status updates correctly
   - [ ] Search functionality works

3. **Nice to Have** (Do Third):
   - [ ] Performance testing
   - [ ] Browser compatibility
   - [ ] Mobile responsiveness

---

## Pre-Testing Checklist

### ✅ Type Checking
```bash
# Run TypeScript compiler to check for type errors
npm run type-check
# or
npx tsc --noEmit
```

**Expected:** No type errors

---

## 1. Content Editor - Core Functionality

### 1.1 Navigation & Tabs
- [ ] **Tab Navigation**
  - [ ] Click "Plan" tab - should highlight and show plan view
  - [ ] Tab button shows correct icon (ClipboardList)
  - [ ] Active tab has correct styling (bg-ember/20, border)

- [ ] **View Selection**
  - [ ] Click "Grid" view - should highlight
  - [ ] View button shows correct icon (LayoutGrid)
  - [ ] Active view has correct styling

- [ ] **Save Status Indicator**
  - [ ] Shows "Saved" with green cloud icon when saved
  - [ ] Shows "Saving..." with spinner when saving
  - [ ] Shows "Unsaved" with amber dot when unsaved
  - [ ] Shows "Error" with red cloud icon on error
  - [ ] Displays last saved time when available

- [ ] **Search Input**
  - [ ] Search input appears in navigation
  - [ ] Can type in search input
  - [ ] Search icon appears on left side
  - [ ] Placeholder text shows "Search content..."

- [ ] **Action Buttons**
  - [ ] "Roadmap" button opens roadmap dialog
  - [ ] "Versions" button opens version history modal

### 1.2 Story Plan View (CRUD Operations)

#### Create Operations
- [ ] **Create Act**
  - [ ] Click "+ Act" button
  - [ ] Enter act title
  - [ ] Save act - appears in list
  - [ ] Act appears with correct order

- [ ] **Create Chapter**
  - [ ] Expand an act
  - [ ] Click "+ Chapter" button
  - [ ] Enter chapter title
  - [ ] Save chapter - appears under act
  - [ ] Chapter appears with correct order

- [ ] **Create Scene**
  - [ ] Expand a chapter
  - [ ] Click "+ Scene" button
  - [ ] Enter scene title and summary
  - [ ] Save scene - appears under chapter
  - [ ] Scene appears with correct order

#### Read Operations
- [ ] **Load Existing Data**
  - [ ] Navigate to project with existing acts/chapters/scenes
  - [ ] All acts load and display correctly
  - [ ] Expand act - chapters load correctly
  - [ ] Expand chapter - scenes load correctly
  - [ ] Data persists after page refresh

#### Update Operations
- [ ] **Edit Act**
  - [ ] Click edit icon on act
  - [ ] Change title
  - [ ] Save - title updates in list
  - [ ] Save status shows "Saving..." then "Saved"

- [ ] **Edit Chapter**
  - [ ] Click edit icon on chapter
  - [ ] Change title
  - [ ] Save - title updates
  - [ ] Remains under correct act

- [ ] **Edit Scene**
  - [ ] Click edit icon on scene
  - [ ] Change title and summary
  - [ ] Save - updates display correctly
  - [ ] Remains under correct chapter

#### Delete Operations
- [ ] **Delete Scene**
  - [ ] Click delete icon on scene
  - [ ] Confirm deletion
  - [ ] Scene disappears from list
  - [ ] No errors in console

- [ ] **Delete Chapter**
  - [ ] Click delete icon on chapter
  - [ ] Confirm deletion
  - [ ] Chapter and all scenes disappear
  - [ ] No errors in console

- [ ] **Delete Act**
  - [ ] Click delete icon on act
  - [ ] Confirm deletion
  - [ ] Act and all children disappear
  - [ ] No errors in console

### 1.3 Save Status Integration
- [ ] **Auto-save Triggers**
  - [ ] Create new act - status changes to "Saving..." then "Saved"
  - [ ] Edit existing act - status changes appropriately
  - [ ] Delete item - status updates correctly

- [ ] **Error Handling**
  - [ ] Simulate network error (disable network in DevTools)
  - [ ] Try to save - status shows "Error"
  - [ ] Re-enable network
  - [ ] Retry save - status returns to "Saved"

---

## 2. Codex Sidebar - CRUD Operations

### 2.1 Category Navigation
- [ ] **Category Selection**
  - [ ] Click "Characters" category - highlights correctly
  - [ ] Click "Regions" category - highlights correctly
  - [ ] Click "Objects" category - highlights correctly
  - [ ] Click "Lore" category - highlights correctly
  - [ ] With Magicborn mode ON:
    - [ ] "Spells" category appears
    - [ ] "Runes" category appears
    - [ ] "Effects" category appears

- [ ] **Category Expansion**
  - [ ] Click category to expand
  - [ ] Chevron icon changes (right → down)
  - [ ] Entries load and display
  - [ ] Loading indicator shows while fetching
  - [ ] Empty state shows if no entries

### 2.2 Entry CRUD Operations

#### Create Operations
- [ ] **Create Character**
  - [ ] Right-click "Characters" category
  - [ ] Click "New Character"
  - [ ] Fill out character form
  - [ ] Save character
  - [ ] Character appears in list under "Characters"
  - [ ] Category refreshes automatically

- [ ] **Create Creature** (if Magicborn mode)
  - [ ] Right-click "Creatures" category
  - [ ] Click "New Creature"
  - [ ] Fill out creature form
  - [ ] Save creature
  - [ ] Creature appears in list

- [ ] **Create Region**
  - [ ] Right-click "Regions" category
  - [ ] Click "New Region"
  - [ ] Fill out region form
  - [ ] Save region
  - [ ] Region appears in list

- [ ] **Create Object**
  - [ ] Right-click "Objects" category
  - [ ] Click "New Object"
  - [ ] Fill out object form
  - [ ] Save object
  - [ ] Object appears in list

- [ ] **Create Spell** (if Magicborn mode)
  - [ ] Right-click "Spells" category
  - [ ] Click "New Spell"
  - [ ] Fill out spell form
  - [ ] Save spell
  - [ ] Spell appears in list

- [ ] **Create Rune** (if Magicborn mode)
  - [ ] Right-click "Runes" category
  - [ ] Click "New Rune"
  - [ ] Fill out rune form
  - [ ] Save rune
  - [ ] Rune appears in list

- [ ] **Create Effect** (if Magicborn mode)
  - [ ] Right-click "Effects" category
  - [ ] Click "New Effect"
  - [ ] Fill out effect form
  - [ ] Save effect
  - [ ] Effect appears in list

#### Read Operations
- [ ] **Load Entries**
  - [ ] Expand "Characters" category
  - [ ] All characters load from API
  - [ ] Entries display with correct names
  - [ ] Empty categories show "No entries" or similar

- [ ] **Search Functionality**
  - [ ] Type in search box
  - [ ] Search filters categories/entries
  - [ ] Clear search - all items reappear

#### Update Operations
- [ ] **Edit Entry**
  - [ ] Right-click on an entry
  - [ ] Click "Edit"
  - [ ] Form opens with existing data
  - [ ] Modify fields
  - [ ] Save changes
  - [ ] Entry updates in list
  - [ ] Changes persist after refresh

#### Delete Operations
- [ ] **Delete Single Entry**
  - [ ] Right-click on an entry
  - [ ] Click "Delete"
  - [ ] Confirm deletion
  - [ ] Entry disappears from list
  - [ ] No errors in console

- [ ] **Bulk Delete**
  - [ ] Right-click on a category with entries
  - [ ] Click "Delete All [Category]"
  - [ ] Confirm deletion
  - [ ] All entries disappear
  - [ ] Category shows empty state

- [ ] **Duplicate Entry**
  - [ ] Right-click on an entry
  - [ ] Click "Duplicate"
  - [ ] New entry appears with "(Copy)" suffix
  - [ ] Can edit duplicated entry independently

### 2.3 Context Menu
- [ ] **Category Context Menu**
  - [ ] Right-click category - menu appears
  - [ ] "New [Category]" option works
  - [ ] "Delete All" option appears only if entries exist
  - [ ] Menu closes on click outside

- [ ] **Entry Context Menu**
  - [ ] Right-click entry - menu appears
  - [ ] "Edit" option works
  - [ ] "Duplicate" option works
  - [ ] "Delete" option works (with confirmation)

---

## 3. API Compatibility Testing

### 3.1 Payload API Endpoints

#### GET Operations
- [ ] **Fetch Projects**
  ```bash
  curl http://localhost:4300/api/payload/projects
  ```
  - [ ] Returns list of projects
  - [ ] Response structure unchanged

- [ ] **Fetch Acts**
  ```bash
  curl http://localhost:4300/api/payload/acts?where[project][equals]=1
  ```
  - [ ] Returns acts for project
  - [ ] Response structure unchanged

- [ ] **Fetch Chapters**
  ```bash
  curl http://localhost:4300/api/payload/chapters?where[project][equals]=1
  ```
  - [ ] Returns chapters for project
  - [ ] Response structure unchanged

- [ ] **Fetch Scenes**
  ```bash
  curl http://localhost:4300/api/payload/scenes?where[project][equals]=1
  ```
  - [ ] Returns scenes for project
  - [ ] Response structure unchanged

- [ ] **Fetch Characters**
  ```bash
  curl http://localhost:4300/api/payload/characters?where[project][equals]=1
  ```
  - [ ] Returns characters for project
  - [ ] Response structure unchanged

#### POST Operations
- [ ] **Create Act**
  ```bash
  curl -X POST http://localhost:4300/api/payload/acts \
    -H "Content-Type: application/json" \
    -d '{"title":"Test Act","project":"1"}'
  ```
  - [ ] Act created successfully
  - [ ] Returns created act with ID
  - [ ] Appears in UI after refresh

- [ ] **Create Character**
  ```bash
  curl -X POST http://localhost:4300/api/payload/characters \
    -H "Content-Type: application/json" \
    -d '{"name":"Test Character","project":"1"}'
  ```
  - [ ] Character created successfully
  - [ ] Returns created character with ID
  - [ ] Appears in Codex sidebar

#### PUT Operations
- [ ] **Update Act**
  ```bash
  curl -X PUT http://localhost:4300/api/payload/acts/[ID] \
    -H "Content-Type: application/json" \
    -d '{"title":"Updated Act Title"}'
  ```
  - [ ] Act updated successfully
  - [ ] Changes reflected in UI

- [ ] **Update Character**
  ```bash
  curl -X PUT http://localhost:4300/api/payload/characters/[ID] \
    -H "Content-Type: application/json" \
    -d '{"name":"Updated Character Name"}'
  ```
  - [ ] Character updated successfully
  - [ ] Changes reflected in Codex sidebar

#### DELETE Operations
- [ ] **Delete Act**
  ```bash
  curl -X DELETE http://localhost:4300/api/payload/acts/[ID]
  ```
  - [ ] Act deleted successfully
  - [ ] Removed from UI

- [ ] **Delete Character**
  ```bash
  curl -X DELETE http://localhost:4300/api/payload/characters/[ID]
  ```
  - [ ] Character deleted successfully
  - [ ] Removed from Codex sidebar

### 3.2 Enum to String Conversion

**Critical Test:** Verify enums are correctly converted to strings when sent to API

- [ ] **Check Network Requests**
  - [ ] Open DevTools → Network tab
  - [ ] Create a new act
  - [ ] Check request payload - should contain string "plan" not enum
  - [ ] Check request payload - should contain string "grid" not enum
  - [ ] Check category IDs - should be strings like "characters", "spells", etc.

- [ ] **Verify API Receives Strings**
  - [ ] All enum values sent to API are strings
  - [ ] No enum objects in request bodies
  - [ ] Category IDs are string literals, not enum values

---

## 4. Type Safety Validation

### 4.1 TypeScript Compilation
```bash
# Run full type check
npm run type-check
```

- [ ] No type errors
- [ ] No implicit any types
- [ ] All enum usages are type-safe

### 4.2 Runtime Type Validation
- [ ] **Enum Values at Runtime**
  - [ ] `ContentEditorTab.Plan === "plan"` (true)
  - [ ] `ContentEditorView.Grid === "grid"` (true)
  - [ ] `SaveStatus.Saved === "saved"` (true)
  - [ ] `CodexCategory.Characters === "characters"` (true)

- [ ] **Type Guards**
  - [ ] Verify enum values match expected strings
  - [ ] Check that enum-to-string conversion works correctly

---

## 5. Component Integration Testing

### 5.1 Component Props
- [ ] **ContentNavigation Props**
  - [ ] Accepts `ContentEditorTab` enum
  - [ ] Accepts `ContentEditorView` enum
  - [ ] Accepts `SaveStatus` enum
  - [ ] All props are correctly typed

- [ ] **CodexSidebar Props**
  - [ ] Accepts `CodexCategory | null` for selectedCategory
  - [ ] Callback receives `CodexCategory` enum
  - [ ] All props are correctly typed

### 5.2 Component Rendering
- [ ] **SaveStatusIndicator**
  - [ ] Renders correctly for each SaveStatus value
  - [ ] Shows correct icon for each status
  - [ ] Displays lastSaved time when provided

- [ ] **TabButton**
  - [ ] Renders with correct icon
  - [ ] Active state styling works
  - [ ] Click handler receives correct enum value

- [ ] **ViewButton**
  - [ ] Renders with correct icon
  - [ ] Active state styling works
  - [ ] Click handler receives correct enum value

- [ ] **SearchInput**
  - [ ] Renders with search icon
  - [ ] onChange handler receives string value
  - [ ] Placeholder text displays correctly

---

## 6. Edge Cases & Error Handling

### 6.1 Invalid States
- [ ] **Null/Undefined Handling**
  - [ ] selectedCategory can be null
  - [ ] lastSaved can be null
  - [ ] Components handle null gracefully

- [ ] **Empty States**
  - [ ] Empty project (no acts/chapters/scenes)
  - [ ] Empty category (no entries)
  - [ ] Empty search results

### 6.2 Error Scenarios
- [ ] **API Errors**
  - [ ] Network failure during save
  - [ ] 404 error when fetching entries
  - [ ] 500 error from server
  - [ ] Error messages display correctly

- [ ] **Invalid Data**
  - [ ] Missing required fields
  - [ ] Invalid enum values (should be caught by TypeScript)
  - [ ] Malformed API responses

### 6.3 State Persistence
- [ ] **Page Refresh**
  - [ ] Selected category persists (if stored)
  - [ ] Expanded categories reset (expected)
  - [ ] Data reloads correctly

- [ ] **Navigation**
  - [ ] Navigate away and back
  - [ ] State resets appropriately
  - [ ] No memory leaks

---

## 7. Performance Testing

### 7.1 Component Rendering
- [ ] **Initial Load**
  - [ ] Content editor loads quickly
  - [ ] No unnecessary re-renders
  - [ ] Codex sidebar loads efficiently

- [ ] **Large Data Sets**
  - [ ] Project with 50+ acts
  - [ ] Category with 100+ entries
  - [ ] Performance remains acceptable

### 7.2 API Calls
- [ ] **Request Optimization**
  - [ ] No duplicate API calls
  - [ ] Proper caching where applicable
  - [ ] Debouncing on search input

---

## 8. Browser Compatibility

### 8.1 Modern Browsers
- [ ] **Chrome** (latest)
  - [ ] All functionality works
  - [ ] No console errors

- [ ] **Firefox** (latest)
  - [ ] All functionality works
  - [ ] No console errors

- [ ] **Safari** (latest)
  - [ ] All functionality works
  - [ ] No console errors

- [ ] **Edge** (latest)
  - [ ] All functionality works
  - [ ] No console errors

### 8.2 Mobile (if applicable)
- [ ] **iOS Safari**
  - [ ] Touch interactions work
  - [ ] Layout is responsive

- [ ] **Chrome Mobile**
  - [ ] Touch interactions work
  - [ ] Layout is responsive

---

## 9. Regression Testing

### 9.1 Previously Working Features
- [ ] **Version History**
  - [ ] Can view version history
  - [ ] Can restore previous versions
  - [ ] Snapshot creation works

- [ ] **Project Settings**
  - [ ] Can access settings page
  - [ ] Can update project name/description
  - [ ] Magicborn mode toggle works
  - [ ] AI Stack status displays correctly

- [ ] **Roadmap Dialog**
  - [ ] Opens from navigation
  - [ ] Displays quick guide
  - [ ] Displays roadmap
  - [ ] Displays issues section

---

## 10. Automated Test Scripts

### 10.1 Quick Validation Script
```bash
#!/bin/bash
# quick-test.sh

echo "Running TypeScript type check..."
npm run type-check || exit 1

echo "Checking for console errors..."
# Start dev server and check for errors
npm run dev &
sleep 5
# Run basic smoke tests
curl -f http://localhost:4300/api/payload/projects || exit 1

echo "✅ Basic checks passed"
```

### 10.2 Manual Test Checklist
Print this checklist and check off items as you test:
- [ ] All CRUD operations work
- [ ] Enums convert to strings correctly
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] All components render
- [ ] API endpoints respond correctly

---

## 11. Critical Path Testing

### Priority 1: Must Work
1. ✅ Create/Read/Update/Delete Acts
2. ✅ Create/Read/Update/Delete Chapters
3. ✅ Create/Read/Update/Delete Scenes
4. ✅ Create/Read/Update/Delete Characters
5. ✅ Save status updates correctly
6. ✅ Category navigation works

### Priority 2: Should Work
1. ✅ Search functionality
2. ✅ Context menus
3. ✅ Duplicate operations
4. ✅ Bulk delete
5. ✅ Error handling

### Priority 3: Nice to Have
1. ✅ Performance with large datasets
2. ✅ Mobile responsiveness
3. ✅ Browser compatibility

---

## 12. Test Results Template

```
## Test Results - [Date]

### Type Checking
- [ ] Passed
- [ ] Failed: [Details]

### Content Editor CRUD
- [ ] All tests passed
- [ ] Failed: [Details]

### Codex Sidebar CRUD
- [ ] All tests passed
- [ ] Failed: [Details]

### API Compatibility
- [ ] All endpoints working
- [ ] Failed: [Details]

### Enum Conversion
- [ ] All enums convert correctly
- [ ] Failed: [Details]

### Issues Found
1. [Issue description]
2. [Issue description]

### Notes
[Any additional observations]
```

---

## Quick Test Commands

```bash
# Type check
npm run type-check

# Lint check
npm run lint

# Build check
npm run build

# Start dev server
npm run dev

# Test API endpoints
curl http://localhost:4300/api/payload/projects
curl http://localhost:4300/api/payload/acts?where[project][equals]=1
```

---

## Success Criteria

✅ **All tests pass** - No regressions introduced
✅ **Type safety maintained** - No type errors
✅ **API compatibility** - All endpoints work
✅ **Enum conversion** - Enums correctly convert to strings
✅ **Component functionality** - All components work as expected
✅ **No console errors** - Clean browser console

---

## Next Steps After Testing

1. **If all tests pass:** Mark refactoring as complete ✅
2. **If issues found:** 
   - Document in issues list
   - Prioritize fixes
   - Re-test after fixes
3. **Update documentation** if needed
4. **Consider adding unit tests** for extracted components

