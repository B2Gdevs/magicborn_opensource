# Config & Settings Refactoring Plan

## Overview

This document outlines the plan for refactoring the configuration and settings system to support:
- **Code defaults** (always work, no DB required)
- **DB overrides** (per-project customization)
- **Server-generated unique IDs** (no name-based generation)
- **Admin-configurable entry type display names**
- **Per-project homepage content**

---

## Architecture Decision

### Code Defaults + DB Overrides Pattern

**Philosophy:**
- Code configs = defaults (always work, no DB required)
- DB overrides = per-project customization (optional)
- Helper functions: check DB first, fallback to code

**Example:**
```typescript
// Code default (entry-config.tsx)
displayName: "Region"
collection: "locations"

// DB override (Projects.entryTypeConfigs)
{
  region: {
    displayName: "Location"  // Override for this project
  }
}

// Helper function
getDisplayName(EntryType.Region, projectId)
// → Checks DB first, returns "Location" if set, else "Region"
```

---

## Phase 1: ID Generation & Validation (High Priority)

### Problem
Currently all forms auto-generate IDs from names using `nameToId()`. User wants server-generated unique IDs instead.

### Solution: Option A - Server-Side Generated UUIDs

**Changes Required:**

1. **Remove Auto-Generation from Forms**
   - Remove from `BasicInfoSection.tsx` (lines 91-102)
   - Remove from all 8 form files (CharacterForm, SpellForm, etc.)
   - Remove from `IdInput.tsx` (lines 124-130)

2. **Make ID Fields Read-Only**
   - Hide ID field for new entries (server generates)
   - Show ID field as read-only for edit mode
   - Update `BasicInfoSection.tsx` to handle this

3. **Update Payload Collections**
   - Make `slug`/`spellId`/`effectType` fields **optional**
   - Keep for SEO/friendly URLs (optional)
   - Configure Payload to auto-generate IDs

4. **Update API Routes**
   - Handle server-generated IDs
   - Don't require ID field in POST requests

**Files to Modify:**
- `components/ui/BasicInfoSection.tsx`
- `components/ui/IdInput.tsx`
- All 8 form files
- All Payload collection configs

---

## Phase 2: Admin-Configurable Settings (High Priority)

### 2.1 Projects Collection Updates

**Add Fields to Projects Collection:**

```typescript
// lib/payload/collections/Projects.ts
{
  name: 'entryTypeConfigs',
  type: 'json',
  label: 'Entry Type Display Names',
  admin: {
    description: 'Override display names for entry types (e.g., "Region" → "Location"). Leave empty to use defaults.',
  },
  // Structure: { [EntryType]: { displayName?: string } }
},
{
  name: 'homepageConfig',
  type: 'group',
  label: 'Project Homepage Settings',
  admin: {
    description: 'Override global homepage settings for this project',
  },
  fields: [
    {
      name: 'heroContent',
      type: 'array',
      // Same structure as SiteConfig.heroContent
    },
    {
      name: 'heroVideos',
      type: 'array',
      // Project-specific hero videos
    },
  ],
},
```

### 2.2 Entry Config Helpers

**Update `lib/content-editor/entry-config.tsx`:**

```typescript
// Server-side helper
export async function getDisplayName(
  entryType: EntryType,
  projectId?: string
): Promise<string> {
  if (projectId) {
    const project = await getProject(projectId);
    const override = project?.entryTypeConfigs?.[entryType]?.displayName;
    if (override) return override;
  }
  return ENTRY_CONFIGS[entryType].displayName; // Fallback to code
}

// Client-side hook
export function useEntryDisplayName(entryType: EntryType, projectId?: string) {
  const [displayName, setDisplayName] = useState(
    ENTRY_CONFIGS[entryType].displayName
  );
  
  useEffect(() => {
    if (projectId) {
      fetch(`/api/payload/projects/${projectId}`)
        .then(res => res.json())
        .then(project => {
          const override = project?.entryTypeConfigs?.[entryType]?.displayName;
          setDisplayName(override || ENTRY_CONFIGS[entryType].displayName);
        });
    }
  }, [entryType, projectId]);
  
  return displayName;
}
```

### 2.3 SiteConfig Project Selection

**Add to SiteConfig Global:**

```typescript
// lib/payload/globals/SiteConfig.ts
{
  name: 'activeProject',
  type: 'relationship',
  relationTo: Collections.Projects,
  admin: {
    description: 'Select which project\'s content to display on homepage',
  },
  required: false,
},
```

**Update Homepage to Use Selected Project:**

```typescript
// app/page.tsx
const siteConfig = await getSiteConfig();
const activeProject = siteConfig?.activeProject;
const projectHomepageConfig = activeProject?.homepageConfig;

// Use project config if available, fallback to global SiteConfig
const heroContent = projectHomepageConfig?.heroContent || siteConfig?.heroContent;
```

---

## Phase 3: Settings UI (High Priority)

### 3.1 Codex Settings Section

**Add to Settings Page:**

```typescript
// app/content-editor/[projectId]/settings/page.tsx

type SettingsSection = "general" | "codex" | "homepage" | "game-systems" | "ai-stack" | "developer" | "danger";

const navigationItems = [
  { id: "general", ... },
  { id: "codex", label: "Codex Settings", icon: BookOpen }, // ← New
  { id: "homepage", label: "Homepage Settings", icon: Home }, // ← New
  // ... rest
];
```

**Create Components:**
- `components/settings/CodexSettingsEditor.tsx`
- `components/settings/HomepageSettingsEditor.tsx`

### 3.2 Codex Settings Editor

**Features:**
- Form fields for each entry type display name
- Show current value (from code or DB)
- Save to `Projects.entryTypeConfigs`
- Validation and error handling

### 3.3 Homepage Settings Editor

**Features:**
- Hero content editor (similar to global SiteConfig)
- Hero video selector
- Save to `Projects.homepageConfig`
- Preview functionality

---

## Phase 4: Developer Experience (Medium Priority)

### 4.1 Documentation

**Update `docs/CONFIG_PATTERN_GUIDE.md`:**
- Add section on code defaults + DB overrides pattern
- Document when to use code vs DB configs
- Add examples of helper function usage

### 4.2 Developer Guidelines

**Key Rules:**
1. **Always use `collection` for database operations**
   ```typescript
   const collection = getCollectionForEntryType(EntryType.Region); // "locations"
   await fetch(`/api/payload/${collection}/...`);
   ```

2. **Always use `displayName` for UI**
   ```typescript
   const label = getDisplayName(EntryType.Region, projectId); // "Region" or "Location"
   ```

3. **Related data uses collection name**
   ```typescript
   // In Character schema
   location: { relationTo: Collections.Locations } // ← Always use collection name
   ```

### 4.3 Type Safety

- Add TypeScript types for all config structures
- Create type guards for config validation
- Add runtime validation for admin configs

---

## Phase 5: Additional Cleanup (Low Priority)

### 5.1 Form Section Configs
- Create `form-section-config.tsx`
- Migrate all forms to use centralized configs
- Make form sections admin-configurable (future)

### 5.2 Status Type Configs
- Create `status-config.tsx`
- Update all components to use status configs
- Make status types admin-configurable (future)

---

## Implementation Checklist

### Phase 1: ID Generation
- [ ] Remove auto-generation from BasicInfoSection.tsx
- [ ] Remove auto-generation from all 8 form files
- [ ] Remove auto-generation from IdInput.tsx
- [ ] Make slug/spellId/effectType optional in all collections
- [ ] Make ID fields read-only in forms
- [ ] Configure Payload for server-generated IDs
- [ ] Test ID generation across all entry types

### Phase 2: Admin Config
- [ ] Add entryTypeConfigs field to Projects collection
- [ ] Add homepageConfig field to Projects collection
- [ ] Create getDisplayName() helper function
- [ ] Create useEntryDisplayName() React hook
- [ ] Update all components to use new helpers
- [ ] Add activeProject field to SiteConfig
- [ ] Update homepage to use selected project

### Phase 3: Settings UI
- [ ] Add "Codex Settings" section to settings page
- [ ] Add "Homepage Settings" section to settings page
- [ ] Create CodexSettingsEditor component
- [ ] Create HomepageSettingsEditor component
- [ ] Implement save/load functionality
- [ ] Add validation and error handling

### Phase 4: Developer Experience
- [ ] Update CONFIG_PATTERN_GUIDE.md
- [ ] Add developer guidelines
- [ ] Add TypeScript types
- [ ] Add runtime validation

---

## Benefits

1. **Single Source of Truth**
   - Code configs provide defaults
   - DB overrides allow customization
   - No duplication

2. **Developer Experience**
   - Clear separation: collection (DB) vs displayName (UI)
   - Type-safe helpers prevent mistakes
   - Documentation guides usage

3. **Admin Flexibility**
   - Per-project customization
   - No code changes needed for rebranding
   - Easy localization support

4. **Maintainability**
   - Code defaults always work
   - DB overrides are optional
   - Easy to extend

---

## Notes

- **No new Settings collection needed** - using existing Projects collection
- **SiteConfig remains global** - but can select which project's content to display
- **Backward compatible** - existing code continues to work
- **Incremental implementation** - can do phases independently

---

## Roadmap

See `lib/roadmaps/config-settings-roadmap.ts` for detailed roadmap with phases and priorities.

