# Staff-Level Engineering Audit: Refactoring Opportunities

## Executive Summary

This audit identifies string literals that should be enums and components that could be decomposed for better reusability and maintainability.

---

## 1. String Literals → Enums

### 🔴 Critical: Content Editor Types

**Location:** `components/content-editor/`

**Issues:**
- Tab types: `"plan" | "write" | "chat" | "review"` scattered across files
- View types: `"grid" | "matrix" | "outline"` used as string literals
- SaveStatus: Already a type but should be enum for consistency

**Current State:**
```typescript
// ContentNavigation.tsx
activeTab: "plan";
onTabChange: (tab: "plan") => void;
activeView: "grid";
onViewChange: (view: "grid") => void;
export type SaveStatus = "saved" | "saving" | "unsaved" | "error";
```

**Recommended Solution:**
```typescript
// lib/content-editor/types.ts
export enum ContentEditorTab {
  Plan = "plan",
  Write = "write",
  Chat = "chat",
  Review = "review",
}

export enum ContentEditorView {
  Grid = "grid",
  Matrix = "matrix",
  Outline = "outline",
}

export enum SaveStatus {
  Saved = "saved",
  Saving = "saving",
  Unsaved = "unsaved",
  Error = "error",
}
```

**Files to Update:**
- `components/content-editor/ContentEditor.tsx`
- `components/content-editor/ContentNavigation.tsx`
- `app/content-editor/[projectId]/settings/page.tsx`

---

### 🟡 High Priority: Category IDs

**Location:** `components/content-editor/CodexSidebar.tsx`

**Issues:**
- Category IDs as string literals: `"characters"`, `"creatures"`, `"regions"`, etc.
- Inconsistent with existing `Collections` constants
- Mapping objects use string literals

**Current State:**
```typescript
const categoryToEntryType: Record<string, string> = {
  characters: "character",
  creatures: "creature",
  regions: "region",
  // ...
};

const categoryToCollection: Record<string, string> = {
  characters: COLLECTIONS.Characters,
  creatures: "creatures", // TODO: Add to constants
  // ...
};
```

**Recommended Solution:**
```typescript
// lib/content-editor/constants.ts
export enum CodexCategory {
  Characters = "characters",
  Creatures = "creatures",
  Regions = "regions",
  Objects = "objects",
  Stories = "stories",
  Spells = "spells",
  Runes = "runes",
  Effects = "effects",
}

export enum EntryType {
  Character = "character",
  Creature = "creature",
  Region = "region",
  Object = "object",
  Story = "story",
  Spell = "spell",
  Rune = "rune",
  Effect = "effect",
}

export const CATEGORY_TO_ENTRY_TYPE: Record<CodexCategory, EntryType> = {
  [CodexCategory.Characters]: EntryType.Character,
  [CodexCategory.Creatures]: EntryType.Creature,
  // ...
};
```

---

### 🟢 Medium Priority: Status Types

**Location:** Multiple files

**Issues:**
- Service status: `"running" | "stopped" | "error" | "unknown"`
- AI Generation status: Already has enum but not consistently used
- Project snapshot types: `"draft" | "published" | "checkpoint"`

**Recommended Solution:**
```typescript
// lib/types/status.ts
export enum ServiceStatus {
  Running = "running",
  Stopped = "stopped",
  Error = "error",
  Unknown = "unknown",
}

export enum SnapshotType {
  Draft = "draft",
  Published = "published",
  Checkpoint = "checkpoint",
}
```

---

## 2. Component Decomposition Opportunities

### 🔴 Critical: ContentNavigation Component

**File:** `components/content-editor/ContentNavigation.tsx` (195 lines)

**Issues:**
- Multiple responsibilities: save status, tabs, views, search, buttons
- Save status indicator is a reusable pattern
- Tab/View buttons are repeated patterns
- Search input could be extracted

**Recommended Decomposition:**

```typescript
// components/content-editor/SaveStatusIndicator.tsx
export function SaveStatusIndicator({ status, lastSaved }: SaveStatusIndicatorProps) {
  // Extracted save status logic
}

// components/content-editor/TabButton.tsx
export function TabButton({ tab, active, onClick, icon }: TabButtonProps) {
  // Reusable tab button
}

// components/content-editor/ViewButton.tsx
export function ViewButton({ view, active, onClick, icon }: ViewButtonProps) {
  // Reusable view button
}

// components/ui/SearchInput.tsx (or content-editor specific)
export function SearchInput({ placeholder, value, onChange }: SearchInputProps) {
  // Reusable search input with icon
}

// components/content-editor/ContentNavigation.tsx (simplified)
export function ContentNavigation({ ... }: ContentNavigationProps) {
  return (
    <div>
      <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} />
      <TabButtonGroup tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
      <ViewButtonGroup views={views} activeView={activeView} onViewChange={onViewChange} />
      <SearchInput placeholder="Search content..." />
    </div>
  );
}
```

**Benefits:**
- Testable in isolation
- Reusable across app
- Easier to maintain
- Clearer component boundaries

---

### 🔴 Critical: CodexSidebar Component

**File:** `components/content-editor/CodexSidebar.tsx` (493 lines)

**Issues:**
- Too many responsibilities: search, category list, entry list, context menu, actions
- Category rendering logic is complex
- Entry rendering is repeated
- Context menu logic could be extracted

**Recommended Decomposition:**

```typescript
// components/content-editor/CodexSearch.tsx
export function CodexSearch({ query, onChange }: CodexSearchProps) {
  // Search input with filtering logic
}

// components/content-editor/CategoryList.tsx
export function CategoryList({ 
  categories, 
  selectedCategory, 
  onSelect,
  expandedCategories,
  onToggleExpand 
}: CategoryListProps) {
  // Category list rendering
}

// components/content-editor/CategoryItem.tsx
export function CategoryItem({ 
  category, 
  isSelected, 
  isExpanded,
  entries,
  onSelect,
  onToggleExpand 
}: CategoryItemProps) {
  // Single category rendering
}

// components/content-editor/EntryList.tsx
export function EntryList({ 
  entries, 
  categoryId,
  onEntryClick,
  onEntryContextMenu 
}: EntryListProps) {
  // Entry list rendering
}

// components/content-editor/EntryItem.tsx
export function EntryItem({ 
  entry, 
  onClick,
  onContextMenu 
}: EntryItemProps) {
  // Single entry rendering
}

// components/content-editor/CodexSidebar.tsx (orchestrator)
export function CodexSidebar({ projectId, selectedCategory, onCategorySelect }: CodexSidebarProps) {
  // Orchestrates sub-components, manages state
}
```

**Benefits:**
- Each component has single responsibility
- Easier to test individual pieces
- Can reuse EntryItem/EntryList elsewhere
- Clearer data flow

---

### 🟡 High Priority: RoadmapDialog Component

**File:** `components/content-editor/RoadmapDialog.tsx` (384 lines)

**Issues:**
- Issue cards are repeated pattern
- Phase sections are similar structure
- Could extract card components

**Recommended Decomposition:**

```typescript
// components/content-editor/IssueCard.tsx
export function IssueCard({ 
  issue, 
  priority 
}: IssueCardProps) {
  // Reusable issue card with priority styling
}

// components/content-editor/PhaseSection.tsx
export function PhaseSection({ 
  phase 
}: PhaseSectionProps) {
  // Phase rendering with sections
}

// components/content-editor/RoadmapSection.tsx
export function RoadmapSection({ 
  phases 
}: RoadmapSectionProps) {
  // Roadmap phases rendering
}

// components/content-editor/IssuesSection.tsx
export function IssuesSection({ 
  issues 
}: IssuesSectionProps) {
  // Issues grouped by priority
}
```

---

### 🟡 High Priority: Form Components

**Location:** `components/*/Form.tsx` files

**Issues:**
- Repeated patterns: Image upload, ID input, form footers
- Similar validation logic
- Similar save/cancel patterns

**Recommended Extraction:**

```typescript
// components/forms/FormImageUpload.tsx
export function FormImageUpload({ 
  value, 
  onChange, 
  projectId 
}: FormImageUploadProps) {
  // Reusable image upload with preview
}

// components/forms/FormFooter.tsx
export function FormFooter({ 
  onSave, 
  onCancel, 
  saving, 
  saveLabel 
}: FormFooterProps) {
  // Reusable form footer
}

// components/forms/FormSection.tsx
export function FormSection({ 
  title, 
  description, 
  children 
}: FormSectionProps) {
  // Reusable form section wrapper
}
```

---

### 🟢 Medium Priority: Status Components

**Location:** Multiple files

**Issues:**
- Service status cards repeated in AIStackStatus
- Status indicators scattered

**Recommended Extraction:**

```typescript
// components/ui/StatusCard.tsx
export function StatusCard({ 
  name, 
  status, 
  url, 
  message, 
  icon 
}: StatusCardProps) {
  // Reusable status card
}

// components/ui/StatusBadge.tsx
export function StatusBadge({ 
  status 
}: StatusBadgeProps) {
  // Reusable status badge
}
```

---

## 3. Shared Constants & Types

### Recommended Structure

```
lib/
├── content-editor/
│   ├── types.ts          # Enums: Tab, View, SaveStatus
│   ├── constants.ts      # Category enums, mappings
│   └── hooks.ts          # Custom hooks
├── ui/
│   ├── types.ts          # UI-related enums
│   └── constants.ts      # UI constants
└── types/
    └── status.ts         # Status enums
```

---

## 4. Implementation Priority

### Phase 1: Critical (Week 1)
1. ✅ Create enums for ContentEditorTab, ContentEditorView, SaveStatus
2. ✅ Extract SaveStatusIndicator component
3. ✅ Extract TabButton and ViewButton components
4. ✅ Update ContentNavigation to use new components

### Phase 2: High Priority (Week 2)
1. ✅ Create CodexCategory and EntryType enums
2. ✅ Decompose CodexSidebar into smaller components
3. ✅ Extract form components (FormFooter, FormSection)
4. ✅ Extract SearchInput component

### Phase 3: Medium Priority (Week 3)
1. ✅ Extract IssueCard and PhaseSection components
2. ✅ Create StatusCard and StatusBadge components
3. ✅ Create ServiceStatus enum
4. ✅ Consolidate status-related types

---

## 5. Benefits Summary

### Type Safety
- Enums provide compile-time checking
- Prevents typos in string literals
- Better IDE autocomplete

### Reusability
- Smaller components are easier to reuse
- Consistent UI patterns across app
- Easier to maintain and test

### Maintainability
- Single responsibility principle
- Easier to locate bugs
- Clearer component boundaries
- Better code organization

### Developer Experience
- Better autocomplete
- Clearer APIs
- Easier onboarding
- Consistent patterns

---

## 6. Migration Strategy

1. **Create new enums/types** alongside existing code
2. **Extract components** without changing functionality
3. **Gradually migrate** usage to new enums/components
4. **Remove old code** once migration complete
5. **Update tests** as you go

---

## Next Steps

1. Review this audit with team
2. Prioritize based on current sprint goals
3. Create tickets for each refactoring
4. Start with Phase 1 (Critical) items
5. Measure impact (code reduction, bug reduction, dev velocity)


