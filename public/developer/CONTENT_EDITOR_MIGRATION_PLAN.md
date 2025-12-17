# Content Editor Migration Plan - NovelCrafter-Style Layout

## 🎯 Vision

Transform the Magicborn Content Editor into a **generic Content Editor** with a NovelCrafter-inspired layout focused on narrative and content management. All existing data structures remain intact. Magicborn-specific features (runes, spells, combat stats) are **optional** and can be enabled/disabled via a project setting, allowing any story to potentially become a Magicborn-style game/story.

---

## 📊 Current State

### Current Structure
- **MagicbornContentEditor.tsx**: Tab-based navigation (Files, Spells, Effects, Runes, Characters, Creatures, Environments)
- Each editor is a separate component with its own layout
- No unified content management system
- Magicborn-specific content mixed with generic content

### Current Editors
- `CharacterEditor.tsx` - Character management
- `CreatureEditor.tsx` - Creature management
- `SpellEditor.tsx` - Spell management (Magicborn-specific)
- `RuneEditor.tsx` - Rune management (Magicborn-specific)
- `EffectEditor.tsx` - Effect management
- `EnvironmentEditor.tsx` - Map/region management
- `FileManager.tsx` - File management

---

## 🎨 New Design: NovelCrafter-Style Layout

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Content Editor - [Project Name]                    [Settings] [Export] [Help]│
├──────────────┬──────────────────────────────────────────────────────────────┤
│              │                                                              │
│  LEFT        │  TOP NAVIGATION                                              │
│  SIDEBAR     │  [Plan] [Write] [Chat] [Review]                             │
│  (Codex)     │                                                              │
│              │  VIEW OPTIONS: [Grid] [Matrix] [Outline]                     │
│  Search:     │                                                              │
│  [________]  │  FILTER: [Search scenes...]                    [View]       │
│              │                                                              │
│  Filters:    │  MAIN CONTENT AREA                                           │
│  [All]       │  ┌────────────────────────────────────────────────────────┐ │
│  [Book 1]    │  │                                                          │ │
│  [Series]    │  │  [Content Grid/List View]                                │ │
│              │  │                                                          │ │
│  [+ New]     │  │  [Cards/Items organized by category]                     │ │
│              │  │                                                          │ │
│  CATEGORIES  │  │                                                          │ │
│              │  │                                                          │ │
│  📁 Characters│  │                                                          │ │
│    📄 Character 1│  │                                                          │ │
│    📄 Character 2│  │                                                          │ │
│              │  │                                                          │ │
│  📁 Locations│  │                                                          │ │
│    📄 Location 1│  │                                                          │ │
│              │  │                                                          │ │
│  📁 Objects  │  │                                                          │ │
│              │  │                                                          │ │
│  📁 Lore     │  │                                                          │ │
│              │  │                                                          │ │
│  📁 Spells   │  │  (Only shown when Magicborn Mode is ON)                  │ │
│    📄 Spell 1│  │                                                          │ │
│  📁 Runes    │  │                                                          │ │
│    📄 Rune 1 │  │                                                          │ │
│  📁 Effects  │  │                                                          │ │
│              │  │                                                          │ │
│  [Settings]  │  │  (Links to /content-editor/settings)                      │ │
│  [Prompts]   │  │                                                          │ │
│  [Export]    │  │                                                          │ │
│  [Saved]     │  │                                                          │ │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

### Key Features

**Left Sidebar (Codex):**
- Search all entries
- Filters (All, Book, Series, etc.)
- "+ New Entry" button
- Expandable categories:
  - Characters (always visible)
  - Locations (always visible)
  - Objects/Items (always visible)
  - Lore (always visible)
  - Spells (only when Magicborn Mode ON)
  - Runes (only when Magicborn Mode ON)
  - Effects (only when Magicborn Mode ON)
- Navigation links at bottom:
  - Settings (links to `/content-editor/settings`)
  - Prompts
  - Export
  - Saved

**Top Navigation:**
- Main tabs: Plan, Write, Chat, Review
- View options: Grid, Matrix, Outline
- Filter/search input
- View button

**Main Content Area:**
- Grid/List view of content
- Cards showing content items
- Organized by category
- Tags and metadata visible

---

## 🏗️ Architecture: Generic Core with Magicborn Mode

### Core Content Editor (Generic - Always Available)

**Core Content Types:**
- Characters
- Locations
- Objects/Items
- Lore
- Stories/Narrative
- Scenes
- Chapters
- Environments/Maps

**Core Features:**
- Search and filter
- Category organization
- Tag system
- Metadata management
- **Versioning system** (draft, review, published)
- **Preview system** (content preview, page preview, version preview)
- Export/import
- Multi-view support (Grid, Matrix, Outline)

### Magicborn Mode (Optional - Project Setting)

**Magicborn-Specific Content Types (Shown when Magicborn Mode is ON):**
- Spells (with rune requirements, evolution, etc.)
- Runes (with familiarity, combat stats, etc.)
- Effects (with spell interactions, etc.)
- Combat Stats (for characters/creatures)

**Magicborn-Specific Features:**
- Spell crafting system
- Rune familiarity system
- Combat stats editor
- Spell evolution system
- Rune-based spell requirements
- Game-specific relationships

**Magicborn Mode Toggle:**
- Project setting: "Enable Magicborn Game Systems"
- When ON: All Magicborn features visible and functional
- When OFF: Magicborn features hidden, focus on generic narrative
- Data preserved: All Magicborn data remains in database, just hidden
- Can toggle anytime: Switch between modes without data loss

---

## 🔧 Route & Settings

### Route Rename
- **Current:** `/development` → `app/development/page.tsx`
- **New:** `/content-editor` → `app/content-editor/page.tsx`
- **Update:** All navigation links, references, and routes
- **Files to Update:**
  - `app/development/page.tsx` → `app/content-editor/page.tsx`
  - `app/development/loading.tsx` → `app/content-editor/loading.tsx` (if exists)
  - `components/SidebarNav.tsx` - Update navigation link
  - All other references to `/development` route

### Settings Page

**Route:** `/content-editor/settings`

**Purpose:** Project-level settings and configuration

**Settings Sections:**

1. **Project Information**
   - Project Name
   - Project Description
   - Project Icon/Image (optional)
   - Created Date
   - Last Modified Date

2. **Game Systems (Magicborn Mode)**
   - Toggle: "Enable Magicborn Game Systems"
   - Description: "When enabled, Spells, Runes, Effects, and Combat Stats become available. All data is preserved when toggling this setting."
   - Status indicator: Shows current mode (ON/OFF)
   - Warning: "Disabling will hide Magicborn features but preserve all data"

3. **Data Management**
   - Export Project (JSON/CSV)
   - Import Project
   - Backup Settings
   - Data Statistics (entry counts, etc.)

4. **Preferences**
   - Default View (Grid/Matrix/Outline)
   - Auto-save interval
   - Theme preferences
   - Notification settings

5. **Advanced**
   - API Keys (if needed)
   - Integration settings
   - Developer options

**Access Points:**
- Link in Content Editor header: "Settings" button
- Link in Codex sidebar: "Settings" at bottom
- Direct route: `/content-editor/settings`

---

## 📋 Migration Strategy

### Phase 1: Core Content Editor Foundation

**Goal:** Create the base Content Editor with NovelCrafter-style layout, versioning, and preview systems

**Tasks:**
1. **Create Core Content Editor Component**
   - `ContentEditor.tsx` - Main editor component
   - Left sidebar (Codex) with search, filters, categories
   - Top navigation (Plan, Write, Chat, Review)
   - Main content area (Grid/Matrix/Outline views)
   - Project settings panel (Magicborn Mode toggle)

2. **Create Core Content Types**
   - `CharacterContent.tsx` - Character content type
   - `LocationContent.tsx` - Location content type
   - `ObjectContent.tsx` - Object/Item content type
   - `LoreContent.tsx` - Lore content type
   - `StoryContent.tsx` - Story/Narrative content type
   - `EnvironmentContent.tsx` - Environment/Map content type

3. **Create Core Components**
   - `CodexSidebar.tsx` - Left sidebar with categories (dynamic based on mode)
   - `ContentGridView.tsx` - Grid view of content
   - `ContentMatrixView.tsx` - Matrix view
   - `ContentOutlineView.tsx` - Outline view
   - `ContentCard.tsx` - Individual content card
   - `ContentForm.tsx` - Generic content form
   - `ProjectSettings.tsx` - Project settings (Magicborn Mode toggle)

4. **Create Magicborn Mode System**
   - `MagicbornModeProvider.tsx` - Context provider for Magicborn mode
   - `useMagicbornMode.ts` - Hook to check if Magicborn mode is enabled
   - Conditional rendering based on mode
   - Data preservation (all data remains, just visibility changes)

5. **Create Settings Page**
   - `app/content-editor/settings/page.tsx` - Settings page route
   - `ProjectSettings.tsx` - Settings component
   - Magicborn Mode toggle
   - Project name, description
   - Export/import settings
   - Other project preferences

6. **Route Migration**
   - Create `app/content-editor/page.tsx` (new route)
   - Update `SidebarNav.tsx` to use `/content-editor`
   - Update all navigation links
   - Keep `/development` as redirect (temporary) or remove

**Deliverables:**
- ✅ Core Content Editor with NovelCrafter layout
- ✅ Basic content types (Characters, Locations, Objects, Lore, Environments)
- ✅ Magicborn Mode toggle system
- ✅ Search and filter functionality
- ✅ Settings page (`/content-editor/settings`)
- ✅ Route renamed from `/development` to `/content-editor`
- ✅ All navigation links updated
- ✅ Versioning system (create, list, restore, compare versions)
- ✅ Preview system (content preview, page preview, version preview)

---

### Phase 2: Migrate Existing Editors

**Goal:** Migrate existing editors to new Content Editor structure

**Migration Path:**

#### 2.1 Characters → Core Content Type
- **Current:** `CharacterEditor.tsx` with separate layout
- **New:** Character content type in Content Editor
- **Changes:**
  - Move character form to `CharacterContent.tsx`
  - Integrate with Codex sidebar
  - Use Content Editor's grid/matrix views
  - Keep existing character data structure

#### 2.2 Creatures → Core Content Type
- **Current:** `CreatureEditor.tsx` with separate layout
- **New:** Creature content type (or Location sub-type)
- **Changes:**
  - Move creature form to `CreatureContent.tsx`
  - Integrate with Codex sidebar
  - Use Content Editor's views
  - Keep existing creature data structure

#### 2.3 Environments → Core Content Type
- **Current:** `EnvironmentEditor.tsx` with complex map editor
- **New:** Location content type with environment data
- **Changes:**
  - Keep environment data structure
  - Integrate with Content Editor
  - Map editor becomes a detail view (not main editor)
  - Use data-centric approach from DATA_CENTRIC_MAP_PLAN.md

#### 2.4 Effects → Magicborn Content Type
- **Current:** `EffectEditor.tsx` with separate layout
- **New:** Effect content type in Content Editor (Magicborn Mode only)
- **Changes:**
  - Move effect form to `EffectContent.tsx`
  - Integrate with Codex sidebar (only shown when Magicborn Mode ON)
  - Use Content Editor's views
  - Keep existing effect data structure (no changes)
  - All Magicborn-specific fields remain

#### 2.5 Spells → Magicborn Content Type
- **Current:** `SpellEditor.tsx` with separate layout
- **New:** Spell content type in Content Editor (Magicborn Mode only)
- **Changes:**
  - Move spell form to `SpellContent.tsx`
  - Integrate with Codex sidebar (only shown when Magicborn Mode ON)
  - Use Content Editor's views
  - Keep existing spell data structure (no changes)
  - All Magicborn-specific fields remain (rune requirements, evolution, etc.)

#### 2.6 Runes → Magicborn Content Type
- **Current:** `RuneEditor.tsx` with separate layout
- **New:** Rune content type in Content Editor (Magicborn Mode only)
- **Changes:**
  - Move rune form to `RuneContent.tsx`
  - Integrate with Codex sidebar (only shown when Magicborn Mode ON)
  - Use Content Editor's views
  - Keep existing rune data structure (no changes)
  - All Magicborn-specific fields remain (familiarity, combat stats, etc.)

**Deliverables:**
- ✅ All existing editors migrated
- ✅ Core content types working
- ✅ Magicborn content types working (Spells, Runes, Effects)
- ✅ Magicborn Mode toggle functional
- ✅ All data preserved
- ✅ Conditional visibility based on mode

---

### Phase 3: Developer Tools & Website Management

**Goal:** Create Developer Tools section for quick site modifications

**Tasks:**
1. **Create Developer Tools Section**
   - Route: `/developer-tools` or `/content-editor/developer`
   - Site configuration interface
   - Hero video selector
   - Favicon upload/selector
   - Site metadata editor

2. **Website Content Versioning**
   - Version hero video changes
   - Version favicon changes
   - Version site metadata changes
   - Preview website with different versions

3. **Quick Preview**
   - Preview website with current settings
   - Preview website with draft changes
   - Side-by-side comparison

**Deliverables:**
- ✅ Developer Tools section
- ✅ Hero video management
- ✅ Favicon management
- ✅ Site metadata editor
- ✅ Website preview functionality
- ✅ Website content versioning

---

### Phase 4: Magicborn Mode Enhancement

**Goal:** Full Magicborn Mode integration with all features

**Tasks:**
1. **Magicborn Mode Settings**
   - Project-level setting: "Enable Magicborn Game Systems"
   - User-level preference: "Show Magicborn features"
   - Toggle in project settings panel
   - Persist setting in project config

2. **Conditional UI Rendering**
   - Hide/show Magicborn categories in Codex sidebar
   - Hide/show Magicborn fields in forms
   - Hide/show Magicborn-specific buttons/actions
   - Show/hide Magicborn navigation tabs

3. **Data Preservation**
   - All Magicborn data remains in database
   - Data accessible when mode is toggled back on
   - No data loss when switching modes
   - Export includes all data (regardless of mode)

4. **Magicborn-Specific Features**
   - Spell crafting system (only when mode ON)
   - Rune familiarity system (only when mode ON)
   - Combat stats editor (only when mode ON)
   - Spell evolution system (only when mode ON)
   - All existing Magicborn logic preserved

**Deliverables:**
- ✅ Full Magicborn Mode toggle system
- ✅ Conditional UI rendering
- ✅ Data preservation across mode changes
- ✅ All Magicborn features working when enabled
- ✅ Clean generic experience when disabled

---

## 🔌 Magicborn Mode System Design

### Project Settings

```typescript
// lib/project/ProjectSettings.ts

export interface ProjectSettings {
  id: string;
  name: string;
  magicbornMode: boolean; // Toggle for Magicborn features
  // ... other project settings
}

export function useProjectSettings() {
  const [settings, setSettings] = useState<ProjectSettings | null>(null);
  
  const toggleMagicbornMode = async (enabled: boolean) => {
    await updateProjectSettings({ magicbornMode: enabled });
    setSettings(prev => prev ? { ...prev, magicbornMode: enabled } : null);
  };
  
  return { settings, toggleMagicbornMode };
}
```

### Magicborn Mode Provider

```typescript
// components/providers/MagicbornModeProvider.tsx

interface MagicbornModeContextType {
  isMagicbornMode: boolean;
  toggleMagicbornMode: (enabled: boolean) => void;
}

export const MagicbornModeContext = createContext<MagicbornModeContextType | null>(null);

export function MagicbornModeProvider({ children }: { children: ReactNode }) {
  const { settings, toggleMagicbornMode } = useProjectSettings();
  const isMagicbornMode = settings?.magicbornMode ?? false;
  
  return (
    <MagicbornModeContext.Provider value={{ isMagicbornMode, toggleMagicbornMode }}>
      {children}
    </MagicbornModeContext.Provider>
  );
}

export function useMagicbornMode() {
  const context = useContext(MagicbornModeContext);
  if (!context) throw new Error('useMagicbornMode must be used within MagicbornModeProvider');
  return context;
}
```

### Settings Page Layout

```typescript
// app/content-editor/settings/page.tsx

export default function SettingsPage() {
  return (
    <div className="h-full">
      <SettingsPageContent />
    </div>
  );
}

// components/project/SettingsPage.tsx

function SettingsPageContent() {
  const { settings, updateSettings } = useProjectSettings();
  
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Project Settings</h1>
      
      {/* Project Info */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Project Information</h2>
        <input name="projectName" placeholder="Project Name" />
        <textarea name="description" placeholder="Description" />
      </section>
      
      {/* Magicborn Mode */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Game Systems</h2>
        <label>
          <input 
            type="checkbox" 
            checked={settings.magicbornMode}
            onChange={(e) => updateSettings({ magicbornMode: e.target.checked })}
          />
          Enable Magicborn Game Systems
        </label>
        <p className="text-sm text-text-secondary">
          When enabled, Spells, Runes, Effects, and Combat Stats become available.
          All data is preserved when toggling this setting.
        </p>
      </section>
      
      {/* Export/Import */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Data Management</h2>
        <button>Export Project</button>
        <button>Import Project</button>
      </section>
    </div>
  );
}
```

### Conditional Rendering in Content Editor

```typescript
// components/content-editor/ContentEditor.tsx

function ContentEditor() {
  const { isMagicbornMode } = useMagicbornMode();
  
  // Core categories (always visible)
  const coreCategories = [
    { id: 'characters', name: 'Characters', icon: <User /> },
    { id: 'locations', name: 'Locations', icon: <MapPin /> },
    { id: 'objects', name: 'Objects', icon: <Package /> },
    { id: 'lore', name: 'Lore', icon: <Book /> },
  ];
  
  // Magicborn categories (only when mode is ON)
  const magicbornCategories = isMagicbornMode ? [
    { id: 'spells', name: 'Spells', icon: <Sparkles /> },
    { id: 'runes', name: 'Runes', icon: <Gem /> },
    { id: 'effects', name: 'Effects', icon: <Zap /> },
  ] : [];
  
  const allCategories = [...coreCategories, ...magicbornCategories];
  
  return (
    <div>
      <CodexSidebar categories={allCategories} />
      {/* Settings link in header */}
      <Link href="/content-editor/settings">Settings</Link>
      {/* ... rest of editor */}
    </div>
  );
}
```

### Conditional Fields in Forms

```typescript
// components/content-types/CharacterContent.tsx

function CharacterForm({ data }: CharacterFormProps) {
  const { isMagicbornMode } = useMagicbornMode();
  
  return (
    <form>
      {/* Core fields (always visible) */}
      <input name="name" />
      <textarea name="description" />
      
      {/* Magicborn fields (only when mode is ON) */}
      {isMagicbornMode && (
        <>
          <CombatStatsEditor />
          <RuneFamiliarityEditor />
        </>
      )}
    </form>
  );
}
```

---

## 📐 Component Structure

```
components/
├── content-editor/
│   ├── ContentEditor.tsx              # Main editor component
│   ├── CodexSidebar.tsx               # Left sidebar with categories
│   ├── ContentNavigation.tsx          # Top navigation (Plan, Write, etc.)
│   ├── ContentGridView.tsx            # Grid view
│   ├── ContentMatrixView.tsx          # Matrix view
│   ├── ContentOutlineView.tsx         # Outline view
│   ├── ContentCard.tsx                # Content card component
│   ├── ContentForm.tsx                # Generic content form
│   └── ContentDetail.tsx              # Content detail view
│
├── content-types/
│   ├── CharacterContent.tsx           # Character content type
│   ├── LocationContent.tsx            # Location content type
│   ├── ObjectContent.tsx              # Object/Item content type
│   ├── LoreContent.tsx                # Lore content type
│   └── StoryContent.tsx               # Story/Narrative content type
│
├── providers/
│   └── MagicbornModeProvider.tsx      # Magicborn mode context provider
│
├── project/
│   ├── ProjectSettings.tsx            # Project settings component
│   ├── SettingsPage.tsx               # Settings page component
│   └── useProjectSettings.ts          # Hook for project settings
│
├── versioning/
│   ├── VersionHistory.tsx             # Version history panel
│   ├── VersionComparison.tsx          # Version diff/comparison
│   ├── VersionSelector.tsx             # Version selector dropdown
│   └── useContentVersions.ts          # Hook for version operations
│
├── preview/
│   ├── PreviewPanel.tsx               # Preview panel component
│   ├── ContentPreview.tsx             # Content preview renderer
│   ├── PagePreview.tsx                # Page preview renderer
│   └── usePreview.tsx                 # Hook for preview functionality
│
├── developer-tools/
│   ├── DeveloperToolsPage.tsx         # Developer tools main page
│   ├── SiteConfiguration.tsx          # Site config editor
│   ├── HeroVideoSelector.tsx          # Hero video selector
│   ├── FaviconManager.tsx             # Favicon upload/selector
│   └── SiteMetadataEditor.tsx         # Site metadata editor
│
└── app/
    └── content-editor/
        ├── page.tsx                   # Main Content Editor page (renamed from development)
        ├── settings/
        │   └── page.tsx                # Settings page route
        └── developer/
            └── page.tsx                # Developer tools route (optional)
│
└── [existing components]/
    ├── CharacterEditor.tsx            # Deprecated (migrated to content-types)
    ├── SpellEditor.tsx                # Deprecated (migrated to extensions)
    └── ...
```

---

## 🔄 Migration Steps

### Step 1: Route Migration
1. Create `app/content-editor/page.tsx` (new route)
2. Create `app/content-editor/settings/page.tsx` (settings route)
3. Update `SidebarNav.tsx` to use `/content-editor` instead of `/development`
4. Update all navigation links and references
5. Test route changes

### Step 2: Create Core Content Editor
1. Create `ContentEditor.tsx` with NovelCrafter layout
2. Create `CodexSidebar.tsx` with search, filters, categories
3. Create content view components (Grid, Matrix, Outline)
4. Create basic content types (Character, Location, Object, Lore)

### Step 3: Create Versioning System
1. Create `ContentVersion` data structure
2. Create version database tables/schema
3. Create version API endpoints (create, list, restore, compare)
4. Create `VersionHistory.tsx` component
5. Create `VersionComparison.tsx` component
6. Integrate versioning into content forms (auto-save versions)

### Step 4: Create Preview System
1. Create `PreviewPanel.tsx` component
2. Create content preview renderers (CharacterPreview, LocationPreview, etc.)
3. Create page preview renderer
4. Add preview buttons to forms
5. Add live preview toggle
6. Integrate with versioning (preview specific versions)

### Step 5: Create Settings Page
1. Create `SettingsPage.tsx` component
2. Create `ProjectSettings.tsx` component
3. Add Magicborn Mode toggle
4. Add project name, description fields
5. Add export/import settings
6. Link from Content Editor header/sidebar

### Step 6: Create Developer Tools Section
1. Create `app/content-editor/developer/page.tsx` (or `/developer-tools`)
2. Create `SiteConfiguration.tsx` component
3. Create `HeroVideoSelector.tsx` (uses existing video config)
4. Create `FaviconManager.tsx` component
5. Create `SiteMetadataEditor.tsx` component
6. Add website preview functionality
7. Integrate versioning for website content

### Step 7: Create Magicborn Mode System
1. Create `MagicbornModeProvider.tsx`
2. Create `useMagicbornMode.ts` hook
3. Integrate with `ProjectSettings.tsx`
4. Add Magicborn Mode toggle to settings page
5. Implement conditional rendering utilities

### Step 8: Migrate Characters
1. Move character data to content editor
2. Update character form to use Content Editor
3. Test character CRUD operations
4. Remove old `CharacterEditor.tsx`

### Step 9: Migrate Creatures
1. Move creature data to content editor
2. Update creature form to use Content Editor
3. Test creature CRUD operations
4. Remove old `CreatureEditor.tsx`

### Step 10: Migrate Environments
1. Move environment data to content editor
2. Keep map editor as detail view
3. Integrate with Content Editor
4. Update `EnvironmentEditor.tsx` to use Content Editor

### Step 11: Migrate Magicborn Content Types
1. Migrate Spells to Content Editor (Magicborn Mode only)
2. Migrate Runes to Content Editor (Magicborn Mode only)
3. Migrate Effects to Content Editor (Magicborn Mode only)
4. Test conditional visibility (toggle mode on/off)
5. Test all Magicborn functionality when mode is ON
6. Test generic experience when mode is OFF
7. Remove old editors

### Step 12: Cleanup
1. Remove deprecated components
2. Update imports
3. Update documentation
4. Test all functionality

---

## 🎯 Benefits

### For Users
- ✅ Unified interface for all content
- ✅ Better organization with Codex sidebar
- ✅ Multiple view options (Grid, Matrix, Outline)
- ✅ Better search and filtering
- ✅ Consistent experience across content types

### For Developers
- ✅ Simple mode toggle system
- ✅ Reusable components
- ✅ Clear conditional rendering
- ✅ Easy to add new content types
- ✅ All existing data structures preserved

### For Magicborn-Specific Content
- ✅ All existing fields and validation preserved
- ✅ All existing UI components preserved
- ✅ All existing logic and calculations preserved
- ✅ Toggle visibility via project setting
- ✅ Data always preserved (never deleted)
- ✅ Can enable/disable per project

---

## 📝 Implementation Notes

### Data Migration
- All existing data structures preserved
- No data loss during migration
- Gradual migration (one editor at a time)
- Backward compatibility during transition

### Backward Compatibility
- Old editors remain functional during migration
- Gradual deprecation
- Clear migration path
- Documentation for users

### Testing Strategy
- Test each migration step independently
- Test extension system thoroughly
- Test custom Magicborn logic
- Test all CRUD operations
- Test search and filtering

---

## 🔗 Related Documentation

- **DATA_CENTRIC_MAP_PLAN.md** - Environment editor migration
- **Environment Editor Architecture** - Map/region system
- **Extension System Design** - Detailed extension architecture (to be created)

---

## 📦 Content Versioning System

### Why Versioning is Paramount

**Content versioning is essential for:**
- Tracking changes over time
- Previewing content before publishing
- Rolling back to previous versions
- Collaboration (multiple editors)
- Publishing workflow (draft → review → published)
- Website content management (swap videos, favicon, etc.)

### Versioning Architecture

**Version Storage:**
```typescript
// lib/data/contentVersions.ts

export interface ContentVersion {
  id: string;
  contentId: string; // ID of the content item
  contentType: string; // 'character', 'spell', 'location', etc.
  version: number; // Incremental version number
  data: any; // Full content data snapshot
  createdAt: Date;
  createdBy: string; // User ID or system
  status: 'draft' | 'review' | 'published' | 'archived';
  changeSummary?: string; // What changed in this version
  parentVersionId?: string; // For branching/merging
}

export interface VersionHistory {
  contentId: string;
  versions: ContentVersion[];
  currentVersion: number;
  publishedVersion?: number; // Which version is live
}
```

**Version Operations:**
- **Create Version:** Save snapshot when content is edited
- **List Versions:** Show all versions for a content item
- **View Version:** Preview any version
- **Restore Version:** Revert to a previous version
- **Compare Versions:** Diff between two versions
- **Publish Version:** Mark version as published (for website content)

### Versioning UI

**In Content Editor:**
- Version indicator: "v3 (Published)" or "v5 (Draft)"
- Version history button: Opens version history panel
- Preview button: Preview current draft
- Publish button: Publish current version

**Version History Panel:**
```
┌─────────────────────────────────────────┐
│  Version History: "Character: Janik"    │
├─────────────────────────────────────────┤
│  v5 (Draft) - Just now                   │
│  v4 (Review) - 2 hours ago              │
│  v3 (Published) - 1 day ago            │
│  v2 (Archived) - 3 days ago             │
│  v1 (Archived) - 1 week ago             │
│                                         │
│  [Compare] [Preview] [Restore] [Publish]│
└─────────────────────────────────────────┘
```

---

## 👁️ Preview System

### Preview Architecture

**Preview Modes:**
1. **Content Preview:** Preview individual content items
2. **Page Preview:** Preview how content appears on website
3. **Version Preview:** Preview specific version of content
4. **Live Preview:** Real-time preview as you edit

### Preview Implementation

**Content Preview:**
- Preview button in content form
- Shows content as it would appear
- For characters: Shows character card/profile
- For locations: Shows location details
- For spells: Shows spell card with all details

**Page Preview:**
- Preview entire page with content
- For website: Preview landing page with hero video, favicon, etc.
- Side-by-side: Edit on left, preview on right
- Or modal: Full-screen preview

**Version Preview:**
- Select version from history
- Preview that specific version
- Compare with current version

**Live Preview:**
- Real-time updates as you type
- Auto-refresh preview
- Toggle on/off

### Preview UI

**Preview Panel:**
```
┌─────────────────────────────────────────┐
│  Preview                    [Close] [X] │
├─────────────────────────────────────────┤
│  [Content Preview] [Page Preview]       │
│                                         │
│  [Preview of content/page]             │
│                                         │
│  Version: v5 (Draft)                    │
│  [Publish] [Save as Draft]              │
└─────────────────────────────────────────┘
```

---

## 🌐 Website Content Management

### Architecture Decision: Content Editor vs Developer Tools

**Option A: Content Editor Handles Everything**
- Content Editor manages all content (narrative + website)
- Website assets (videos, favicon) as content types
- Versioning for website content
- Preview website with different content versions

**Option B: Separate Developer Tools Section**
- Content Editor: Narrative/game content only
- Developer Tools: Website configuration (videos, favicon, site settings)
- Clear separation of concerns
- Developer Tools for quick site modifications

**Recommended: Hybrid Approach**
- **Content Editor:** Manages narrative/game content (characters, locations, spells, etc.)
- **Developer Tools:** Quick site configuration (hero videos, favicon, site metadata)
- **Both use versioning:** All changes versioned
- **Both have previews:** Preview content and preview website

### Website Content Types

**In Content Editor (if included):**
- **Pages:** Landing page, about page, etc.
- **Sections:** Hero section, features section, etc.
- **Assets:** Images, videos (referenced by pages)

**In Developer Tools (recommended):**
- **Site Configuration:**
  - Hero Videos (select from available videos)
  - Favicon (upload/select)
  - Site Metadata (title, description, OG tags)
  - Theme Settings
  - Navigation Links
- **Quick Swaps:**
  - Swap hero video
  - Change favicon
  - Update site title
  - Modify navigation

### Developer Tools Section

**Route:** `/developer-tools` or `/content-editor/developer`

**Purpose:** Quick site modifications without full content editor

**Features:**
- Hero Video Selector (choose from available videos)
- Favicon Upload/Selector
- Site Metadata Editor
- Navigation Manager
- Theme Switcher
- Quick Preview
- **Versioning:** All changes versioned (draft → published)
- **Preview:** Preview website with different configurations

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Developer Tools - Site Configuration                  │
├─────────────────────────────────────────────────────────┤
│  Current Version: v3 (Published)  [Version History]   │
│                                                         │
│  Site Configuration                                    │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Hero Video: [Select Video ▼]                     │ │
│  │   Available: [Video 1] [Video 2] [Video 3]     │ │
│  │   Current: "new_tarro_teaser"                    │ │
│  │                                                    │ │
│  │ Favicon: [📎 Upload] or [Select from Library]   │ │
│  │   Current: [🖼️ favicon.ico]                      │ │
│  │                                                    │ │
│  │ Site Title: [Magicborn: Mordred's Legacy]         │ │
│  │ Site Description: [A deterministic...]           │ │
│  │                                                    │ │
│  │ Navigation Links: [Edit Navigation]              │ │
│  │ Theme: [Dark] [Light] [Auto]                     │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  [Preview Site] [Save as Draft] [Publish Changes]      │
│                                                         │
│  Preview Panel (when opened):                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │ [Website Preview with current settings]           │ │
│  │ Version: v4 (Draft)                                │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Versioning for Website Content:**
- Each change creates a new version
- Draft versions: Not live, can preview
- Published version: Live on website
- Can rollback to previous published version
- Can preview any version before publishing

**Workflow:**
1. Developer changes hero video in Developer Tools
2. System creates new version (draft)
3. Developer clicks "Preview Site" → Sees website with new video
4. Developer clicks "Publish Changes" → Version becomes published
5. Website updates with new video
6. Can rollback if needed

---

## 🎮 Magicborn Mode: The Vision

### Any Story → Magicborn Game

**The Goal:** Allow any narrative project to potentially become a Magicborn-style game/story.

**How It Works:**
1. **Start Generic:** User creates a story with characters, locations, lore (no Magicborn features)
2. **Enable Magicborn Mode:** User toggles "Enable Magicborn Game Systems" in project settings
3. **Magicborn Features Appear:** Spells, Runes, Effects, Combat Stats become available
4. **Add Game Systems:** User can now add Magicborn-specific content to their story
5. **Full Integration:** Story becomes a Magicborn-style game with narrative + game systems

**Benefits:**
- ✅ Writers can focus on narrative first
- ✅ Game designers can add systems later
- ✅ No data loss when toggling modes
- ✅ All existing Magicborn systems available when enabled
- ✅ Generic enough for any story, powerful enough for Magicborn games

**Example Workflow:**
1. Writer creates "Epic Fantasy Story" project
2. Adds characters, locations, lore (generic)
3. Decides to make it a game
4. Enables Magicborn Mode
5. Adds spells, runes, combat stats to characters
6. Story is now a Magicborn-style game/story

---

## 📋 Architecture Summary

### Content Editor vs Developer Tools

**Content Editor (`/content-editor`):**
- **Purpose:** Manage narrative/game content
- **Content Types:** Characters, Locations, Objects, Lore, Spells, Runes, Effects, Environments
- **Features:** Versioning, Preview, Search, Filter, Multi-view
- **Use Case:** Writers, game designers, content creators

**Developer Tools (`/developer-tools` or `/content-editor/developer`):**
- **Purpose:** Quick site configuration and modifications
- **Content Types:** Hero videos, favicon, site metadata, navigation, theme
- **Features:** Versioning, Preview, Quick swaps
- **Use Case:** Developers, site administrators

**Both Use Versioning:**
- All changes create versions
- Draft → Review → Published workflow
- Can preview any version
- Can rollback to previous versions

**Both Have Previews:**
- Content Editor: Preview content items, pages
- Developer Tools: Preview website with different configurations

### Versioning Workflow

**For Content:**
1. Edit content → Auto-save creates draft version
2. Preview draft version
3. Mark for review (optional)
4. Publish version → Becomes live

**For Website:**
1. Change hero video/favicon in Developer Tools
2. System creates draft version
3. Preview website with new configuration
4. Publish → Website updates

### Data Flow

```
Content Editor
  ↓ Edit Content
  ↓ Create Version (draft)
  ↓ Preview
  ↓ Publish
  ↓ Live Content

Developer Tools
  ↓ Change Site Config
  ↓ Create Version (draft)
  ↓ Preview Website
  ↓ Publish
  ↓ Live Website
```

---

**Status:** Planning Phase  
**Branch:** `feature/content-editor-migration`  
**Priority:** High  
**Estimated Time:** 8-10 weeks (includes versioning and preview systems)

