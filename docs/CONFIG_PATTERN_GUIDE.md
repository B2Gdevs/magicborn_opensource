# Configuration Pattern Guide

## What is `entry-config.tsx`?

`entry-config.tsx` is a **centralized configuration system** that eliminates hardcoded mappings and string literals scattered throughout the codebase. It provides:

### 1. **Single Source of Truth**
All entry type information (icons, names, collections, categories) lives in one place:
```typescript
export const ENTRY_CONFIGS: Record<EntryType, EntryConfig> = {
  [EntryType.Character]: {
    id: EntryType.Character,
    name: "Character",
    displayName: "Character",
    icon: <Icons.User className="w-4 h-4" />,
    category: CodexCategory.Characters,
    collection: Collections.Characters,
  },
  // ... more entries
};
```

### 2. **Type-Safe Lookups**
Helper functions provide type-safe access:
```typescript
getEntryConfig(EntryType.Character)        // Get full config
getCollectionForEntryType(EntryType.Character)  // Get collection name
getCategoryForEntryType(EntryType.Character)    // Get category
getAllEntryTypes(magicbornMode)            // Filter by mode
```

### 3. **Easy to Extend**
Adding a new entry type requires:
- Adding one object to `ENTRY_CONFIGS`
- All mappings update automatically
- No need to update multiple files

### 4. **Eliminates Duplication**
Before: Hardcoded mappings in 5+ files
After: One config file, imported everywhere

---

## Benefits of This Pattern

### ✅ **Maintainability**
- Change an icon? Update one place
- Add a new entry type? Add one config object
- No hunting through multiple files

### ✅ **Type Safety**
- TypeScript enums prevent typos
- Compile-time errors catch mistakes
- Autocomplete works everywhere

### ✅ **Consistency**
- Same icons used everywhere
- Same names displayed consistently
- No drift between components

### ✅ **Testability**
- Easy to mock configs
- Can test helper functions in isolation
- Predictable behavior

---

## Real Examples from Your Codebase

### 🔴 **Example 1: CodexSidebar Duplicating Entry Config**

**Location:** `components/content-editor/CodexSidebar.tsx` (lines 89-107)

**The Problem:**
```typescript
// ❌ BAD: Hardcoded category definitions duplicating entry-config.tsx
const coreCategories: Category[] = [
  { id: CodexCategory.Characters, name: "Characters", icon: <User className="w-4 h-4" /> },
  { id: CodexCategory.Creatures, name: "Creatures", icon: <User className="w-4 h-4" /> },
  { id: CodexCategory.Regions, name: "Regions", icon: <MapPin className="w-4 h-4" /> },
  { id: CodexCategory.Objects, name: "Objects/Items", icon: <Package className="w-4 h-4" /> },
  { id: CodexCategory.Stories, name: "Lore", icon: <BookOpen className="w-4 h-4" /> },
];

const magicbornCategories: Category[] = isMagicbornMode
  ? [
      { id: CodexCategory.Spells, name: "Spells", icon: <Sparkles className="w-4 h-4" /> },
      { id: CodexCategory.Runes, name: "Runes", icon: <Gem className="w-4 h-4" /> },
      { id: CodexCategory.Effects, name: "Effects", icon: <Zap className="w-4 h-4" /> },
    ]
  : [];
```

**Why This Is Bad:**
- ❌ **Duplication**: Same icons/names defined in `entry-config.tsx` AND `CodexSidebar.tsx`
- ❌ **Inconsistency Risk**: If you change an icon in one place, the other doesn't update
- ❌ **Maintenance Burden**: Adding a new entry type requires updating 2+ files
- ❌ **Type Safety**: Using string literals instead of enums

**The Fix:**
```typescript
// ✅ GOOD: Use entry-config as single source of truth
import { getAllEntryTypes } from "@lib/content-editor/entry-config";

const allEntryConfigs = getAllEntryTypes(isMagicbornMode);
const allCategories = allEntryConfigs.map(config => ({
  id: config.category,
  name: config.displayName,
  icon: config.icon,
}));
```

**Benefits:**
- ✅ One source of truth
- ✅ Automatic updates when entry-config changes
- ✅ Type-safe with enums
- ✅ Less code to maintain

---

### 🔴 **Example 2: CreateEntryDialog Duplicating Category Config**

**Location:** `components/content-editor/CreateEntryDialog.tsx` (lines 17-25)

**The Problem:**
```typescript
// ❌ BAD: Another hardcoded category mapping
const categoryConfig: Record<string, { name: string; icon: React.ReactNode; collection: string }> = {
  characters: { name: "Character", icon: <User className="w-5 h-5" />, collection: "characters" },
  regions: { name: "Region", icon: <MapPin className="w-5 h-5" />, collection: "regions" },
  objects: { name: "Object/Item", icon: <Package className="w-5 h-5" />, collection: "objects" },
  stories: { name: "Book/Story", icon: <BookOpen className="w-5 h-5" />, collection: "stories" },
  spells: { name: "Spell", icon: <Sparkles className="w-5 h-5" />, collection: "spells" },
  runes: { name: "Rune", icon: <Gem className="w-5 h-5" />, collection: "runes" },
  effects: { name: "Effect", icon: <Zap className="w-5 h-5" />, collection: "effects" },
};
```

**Why This Is Bad:**
- ❌ **Third place** defining the same category data
- ❌ **Different icon sizes** (`w-5 h-5` vs `w-4 h-4`) - inconsistency
- ❌ **String keys** instead of enums
- ❌ **Missing creatures** - incomplete mapping

**The Fix:**
```typescript
// ✅ GOOD: Use entry-config
import { getAllEntryTypes, getCollectionForEntryType } from "@lib/content-editor/entry-config";
import { CodexCategory } from "@lib/content-editor/constants";

function getCategoryConfig(category: CodexCategory) {
  const entryType = CATEGORY_TO_ENTRY_TYPE[category];
  const config = getEntryConfig(entryType);
  return {
    name: config.displayName,
    icon: config.icon, // Consistent size from config
    collection: getCollectionForEntryType(entryType),
  };
}
```

---

### 🔴 **Example 3: Removed - Component No Longer Exists**

**Note:** ContentGridView was removed as it was unused. Icon mappings should always use `entry-config.tsx` helpers.

**The Problem:**
```typescript
// ❌ BAD: Yet another icon mapping
const categoryIcons: Record<string, typeof FileText> = {
  characters: User,
  locations: MapPin,
  objects: Package,
  lore: BookOpen,
  spells: Sparkles,
  runes: Gem,
  effects: Zap,
};
```

**Why This Is Bad:**
- ❌ **Fourth place** defining icons
- ❌ **Inconsistent**: Uses `locations` instead of `regions`
- ❌ **Missing**: No `creatures` entry
- ❌ **Type mismatch**: `typeof FileText` doesn't match actual icon types

**The Fix:**
```typescript
// ✅ GOOD: Derive from entry-config
import { getEntryConfig, getCategoryForEntryType } from "@lib/content-editor/entry-config";

function getCategoryIcon(category: CodexCategory) {
  const entryType = CATEGORY_TO_ENTRY_TYPE[category];
  const config = getEntryConfig(entryType);
  return config.icon;
}
```

---

### 🟡 **Example 4: Duplicated Form Section Definitions**

**Location:** Multiple form files

**The Problem:**
```typescript
// ❌ BAD: CharacterForm.tsx (line 33)
type FormSection = "basic" | "description" | "resources" | "runes" | "elements" | "attributes";

// ❌ BAD: SpellForm.tsx (line 140)
type FormSection = "basic" | "properties";

// ❌ BAD: ObjectForm.tsx (similar pattern)
type FormSection = "basic" | "properties";
```

**Why This Is Bad:**
- ❌ **No consistency** between forms
- ❌ **String literals** instead of enums
- ❌ **Can't share** section logic between forms
- ❌ **Hard to refactor** - change requires updating multiple files

**The Fix:**
```typescript
// ✅ GOOD: Centralized form section config
// lib/forms/form-section-config.ts
export enum FormSectionType {
  Basic = "basic",
  Description = "description",
  Properties = "properties",
  Resources = "resources",
  Runes = "runes",
  Elements = "elements",
  Attributes = "attributes",
}

export interface FormSectionConfig {
  id: FormSectionType;
  label: string;
  icon: ReactNode;
  order: number;
}

export const CHARACTER_FORM_SECTIONS: FormSectionConfig[] = [
  { id: FormSectionType.Basic, label: "Basic Info", icon: <User />, order: 1 },
  { id: FormSectionType.Description, label: "Description", icon: <FileText />, order: 2 },
  // ...
];
```

---

### 🟡 **Example 5: Duplicated ID Validation Logic**

**Location:** `CharacterForm.tsx` (lines 76-150), `SpellForm.tsx` (lines 47-108)

**The Problem:**
```typescript
// ❌ BAD: CharacterForm.tsx - 75 lines of ID validation
async function checkIdUniqueness(
  id: string,
  projectId?: string,
  excludeId?: number
): Promise<{ isUnique: boolean; error?: string }> {
  // ... 75 lines of logic
}

// ❌ BAD: SpellForm.tsx - Nearly identical 60 lines
async function checkIdUniqueness(
  id: string,
  projectId?: string,
  excludeId?: number
): Promise<{ isUnique: boolean; error?: string }> {
  // ... 60 lines of nearly identical logic
}
```

**Why This Is Bad:**
- ❌ **Massive duplication** - same logic in multiple files
- ❌ **Bug risk** - fix in one place, forget the others
- ❌ **Inconsistent behavior** - slight differences between forms
- ❌ **Hard to test** - need to test same logic multiple times

**The Fix:**
```typescript
// ✅ GOOD: Shared validation utility
// lib/validation/id-validation.ts
export async function checkIdUniqueness(
  collection: string,
  idField: string, // "slug" for characters, "spellId" for spells
  id: string,
  projectId?: string,
  excludeId?: number
): Promise<{ isUnique: boolean; error?: string }> {
  // Single implementation used by all forms
}
```

---

### 🟡 **Example 6: Duplicated nameToId Function**

**Location:** `CharacterForm.tsx` (lines 68-73), `SpellForm.tsx` (lines 39-44)

**The Problem:**
```typescript
// ❌ BAD: CharacterForm.tsx
function nameToId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

// ❌ BAD: SpellForm.tsx - EXACT SAME FUNCTION
function nameToId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
```

**Why This Is Bad:**
- ❌ **Exact duplication** - same function in multiple files
- ❌ **Change requires updates** in multiple places
- ❌ **No single source** of truth for ID generation rules

**The Fix:**
```typescript
// ✅ GOOD: Shared utility
// lib/utils/id-generation.ts
export function nameToId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
```

---

## Where Else Should We Use Configs?

Based on the codebase audit, here are prime candidates:

### 🔴 **High Priority**

#### 1. **Codex Sidebar Categories** ✅ (Fix in progress)
**Location:** `components/content-editor/CodexSidebar.tsx`

**Status:** Currently duplicating `entry-config.tsx` - should use `getAllEntryTypes()`

#### 2. **CreateEntryDialog Category Config** 
**Location:** `components/content-editor/CreateEntryDialog.tsx`

**Status:** Third place defining categories - should use `entry-config.tsx`

#### 3. **Removed - Component No Longer Exists**
**Note:** ContentGridView was removed as it was unused. All components now use `entry-config.tsx` helpers.

#### 4. **Form Section Definitions**
**Location:** All form components

**Status:** Each form defines its own sections - should centralize

#### 5. **ID Validation Logic**
**Location:** `CharacterForm.tsx`, `SpellForm.tsx`, etc.

**Status:** Duplicated across forms - should be shared utility

#### 6. **nameToId Function**
**Location:** Multiple form files

**Status:** Exact duplication - should be shared utility

#### 3. **Form Field Configurations**
**Location:** All form components (`CharacterForm.tsx`, `SpellForm.tsx`, etc.)

**Current Problem:**
- Field labels scattered throughout forms
- Validation rules duplicated
- Field order hardcoded

**Recommended Solution:**
```typescript
// lib/forms/character-form-config.ts
export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "textarea";
  required?: boolean;
  validation?: ValidationRule[];
  order: number;
}

export const CHARACTER_FORM_FIELDS: Record<string, FieldConfig> = {
  name: {
    name: "name",
    label: "Character Name",
    type: "text",
    required: true,
    order: 1,
  },
  // ... more fields
};
```

### 🟡 **Medium Priority**

#### 4. **Status Types**
**Location:** Multiple files using `"draft" | "published"`

**Recommended:**
```typescript
// lib/content-editor/status-config.ts
export enum ContentStatus {
  Draft = "draft",
  Published = "published",
  Archived = "archived",
}

export const STATUS_CONFIGS: Record<ContentStatus, StatusConfig> = {
  [ContentStatus.Draft]: {
    id: ContentStatus.Draft,
    label: "Draft",
    color: "gray",
    icon: <Edit className="w-4 h-4" />,
  },
  // ...
};
```

#### 5. **Color Themes**
**Location:** `components/homepage/HomepageEditor.tsx`

**Current:**
```typescript
const COLOR_OPTIONS = [
  { label: 'Default', value: '' },
  { label: 'Ember', value: 'ember-glow' },
  // ...
];
```

**Recommended:**
```typescript
// lib/theme/color-config.ts
export const THEME_COLORS: Record<string, ColorConfig> = {
  default: { label: "Default", value: "", className: "" },
  ember: { label: "Ember", value: "ember-glow", className: "text-ember-glow" },
  // ...
};
```

#### 6. **API Route Mappings**
**Location:** `app/api/payload/[...slug]/route.ts`

**Current:**
- Collection names hardcoded in route handlers
- Error messages duplicated

**Recommended:**
```typescript
// lib/api/route-config.ts
export const API_ROUTE_CONFIGS: Record<string, RouteConfig> = {
  characters: {
    collection: Collections.Characters,
    allowedMethods: ["GET", "POST", "PATCH", "DELETE"],
    requiresAuth: true,
  },
  // ...
};
```

### 🟢 **Low Priority (Nice to Have)**

#### 7. **Icon Mappings**
**Location:** Multiple files importing icons individually

**Recommended:**
```typescript
// lib/icons/icon-config.tsx
export const ICON_CONFIGS = {
  user: { component: User, defaultSize: "w-4 h-4" },
  mapPin: { component: MapPin, defaultSize: "w-4 h-4" },
  // ...
};
```

#### 8. **Validation Rules**
**Location:** Form validation scattered across components

**Recommended:**
```typescript
// lib/validation/rules-config.ts
export const VALIDATION_RULES = {
  required: (value: unknown) => !!value || "This field is required",
  minLength: (min: number) => (value: string) => 
    value.length >= min || `Must be at least ${min} characters`,
  // ...
};
```

---

## Implementation Strategy

### Phase 1: High-Impact, Low-Effort
1. ✅ **Entry Config** (Already done!)
2. **Codex Sidebar** - Use `entry-config` instead of duplicating
3. **Content Editor Tabs** - Create `tab-config.tsx`

### Phase 2: Medium-Impact
4. **Form Field Configs** - Start with most complex forms
5. **Status Types** - Centralize all status enums

### Phase 3: Polish
6. **Color Themes** - If theming becomes more complex
7. **Icon Mappings** - If icon usage becomes inconsistent

---

## Pattern Template

When creating a new config file, use this structure:

```typescript
// lib/[domain]/[name]-config.tsx

// 1. Define enums
export enum MyType {
  Option1 = "option1",
  Option2 = "option2",
}

// 2. Define config interface
export interface MyConfig {
  id: MyType;
  name: string;
  displayName: string;
  icon?: ReactNode;
  // ... other properties
}

// 3. Create config object
export const MY_CONFIGS: Record<MyType, MyConfig> = {
  [MyType.Option1]: {
    id: MyType.Option1,
    name: "Option 1",
    displayName: "Option One",
    // ...
  },
  // ...
};

// 4. Helper functions
export function getMyConfig(type: MyType): MyConfig {
  return MY_CONFIGS[type];
}

export function getAllMyTypes(filter?: (config: MyConfig) => boolean): MyConfig[] {
  const configs = Object.values(MY_CONFIGS);
  return filter ? configs.filter(filter) : configs;
}
```

---

## When NOT to Use Configs

❌ **Don't create configs for:**
- One-off values used in a single component
- Values that change frequently (use state/props)
- Simple constants that don't need structure
- Data that comes from an API (use types/interfaces instead)

✅ **DO create configs for:**
- Mappings used in multiple places
- Values with associated metadata (icons, labels, etc.)
- Enums that need helper functions
- Complex relationships between types

---

## Summary

The `entry-config.tsx` pattern is a powerful way to:
- **Eliminate duplication**
- **Improve type safety**
- **Make code more maintainable**
- **Enable easy extension**

Apply this pattern wherever you see:
- Hardcoded mappings
- Duplicated arrays
- String literals used as types
- Scattered related constants

The goal is **one source of truth** for each domain concept.

