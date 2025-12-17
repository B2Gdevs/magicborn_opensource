# Data-Centric Map & Region System - Implementation Plan

## 🎯 Vision

Move from a complex visual map editor with real-time canvas tooling to a **data-centric approach** similar to NovelCrafter, where maps and regions are managed through forms and nested data structures. The visual map editor becomes a **work-in-progress feature** for future visual aid, while the core system focuses on:

- **Form-based editing** of maps, regions, and placements
- **Data-driven hierarchy** with the same concepts (regions, cells, coordinates, inheritance)
- **Runtime map generation** with auto-placement of landmarks on default backgrounds
- **Unreal Engine integration** with proper coordinate calculations and 3D space considerations

---

## 📊 What Stays the Same

### Core Data Model
- **Hierarchy**: World Map → Regions → Nested Maps → More Regions
- **Coordinate System**: Cell-based coordinates, pixel-to-Unreal calculations
- **Inheritance**: Regions override parent, nested maps inherit from regions
- **Environment Properties**: Biome, Climate, Danger Level, Creatures
- **Placements**: Landmarks, props, spawn points with coordinate data
- **Calculations**: All coordinate conversions, cell calculations, Unreal mappings

### Data Structures
- `MapDefinition` - Maps with coordinate configs
- `MapRegion` - Regions with cell boundaries (minX, minY, width, height)
- `MapPlacement` - Placements with coordinates and precision levels
- All existing database schemas and relationships

---

## 🔄 What Changes

### From Visual Editor to Forms

**Before (Current):**
- Visual canvas with drag-to-select cells
- Real-time cell selection feedback
- Interactive map editing with zoom/pan
- Visual region highlighting
- Click-and-drag placement tools

**After (Data-Centric):**
- **Form-based region creation**: Enter cell coordinates directly (minX, minY, width, height)
- **Form-based map creation**: Enter map properties, coordinate configs
- **Form-based placement**: Enter coordinates manually or via coordinate calculator
- **Hierarchical tree view**: Navigate maps → regions → nested maps → placements
- **Data tables**: View and edit all regions/placements in tabular format

### Map Visualization

**Before:**
- Interactive canvas with full editing capabilities
- Real-time visual feedback
- Complex tooling for selection and placement

**After:**
- **Read-only map view**: Display map with regions/placements overlaid
- **Auto-generated visualization**: Landmarks auto-placed on default map background at runtime
- **Simple preview**: Show map structure without editing capabilities
- **Work-in-progress editor**: Visual editor exists but marked as experimental/roadmap

---

## 🏗️ New Architecture

### 1. Data Management Layer

**Forms & CRUD Operations:**
- `MapForm` - Create/edit maps (name, coordinate config, image path)
- `RegionForm` - Create/edit regions (name, cell bounds, environment properties)
- `PlacementForm` - Create/edit placements (type, coordinates, precision level)
- `EnvironmentForm` - Create/edit environment templates

**Data Tables:**
- `MapsTable` - List all maps with hierarchy navigation
- `RegionsTable` - List regions for selected map with edit/delete
- `PlacementsTable` - List placements for selected map/region with edit/delete

**Hierarchy Navigation:**
- Tree view showing: World Map → Regions → Nested Maps → Regions → ...
- Click to navigate and edit
- Breadcrumb navigation for deep nesting

### 2. Coordinate Calculator

**Standalone Tool:**
- Input: Cell coordinates, pixel coordinates, or Unreal coordinates
- Output: Converted coordinates in all formats
- Show: Cell size in Unreal units, area calculations
- Use: When creating regions/placements, calculate proper coordinates

**Integration:**
- Embedded in RegionForm and PlacementForm
- Real-time calculation as user enters coordinates
- Validation: Warn if coordinates are out of bounds

### 3. Runtime Map Generation

**Auto-Placement System:**
- **Default Map Background**: Generic background image (or procedurally generated)
- **Landmark Auto-Placement**: All landmarks with coordinates auto-placed on map
- **Region Visualization**: Regions drawn as colored overlays based on cell bounds
- **Coordinate-Based Rendering**: Use stored coordinates to position everything

**Visualization Logic:**
```typescript
// Pseudo-code for runtime map generation
function generateMapVisualization(map: MapDefinition) {
  const background = getDefaultBackground(map.coordinateConfig);
  const regions = getRegionsForMap(map.id);
  const placements = getPlacementsForMap(map.id);
  
  // Draw regions as colored rectangles based on cell bounds
  regions.forEach(region => {
    const rect = calculateRectFromCells(region.minX, region.minY, region.width, region.height);
    drawRegionOverlay(rect, region.color, region.metadata);
  });
  
  // Draw landmarks/icons at their coordinates
  placements.forEach(placement => {
    const position = convertCoordinatesToPixels(placement.coordinates, map.coordinateConfig);
    drawLandmarkIcon(position, placement.type, placement.metadata);
  });
  
  return { background, overlays, landmarks };
}
```

### 4. Unreal Engine Integration

**Export Format:**
- JSON export with all coordinate data
- Cell-to-Unreal unit mappings
- Region boundaries in Unreal coordinates
- Placement positions in Unreal coordinates
- Environment properties per region

**Coordinate Calculations:**
- All existing coordinate conversion logic remains
- Cell size calculations for Unreal space
- Proper scaling for 3D space considerations
- Support for Z-axis (height) in placements

---

## 📐 Hierarchical 64-Cell System

### Core Principle: Fixed 64-Cell Grid Per Region

**Every region is divided into exactly 64 cells (8×8 grid).** When a child region is created, it uses a subset of those 64 cells, and those cells are then subdivided into another 64 cells for any child of that region.

### How It Works

```
World Map (Level 0)
├─ Total Cells: Variable (based on image size / baseCellSize)
├─ Region: "Frozen Loom" (uses cells 0-63, which is 8×8 = 64 cells)
│  └─ Nested Map (Level 1) - "Frozen Loom" becomes base region
│     ├─ Total Cells: 64 (8×8 grid)
│     ├─ Each cell = 1/64th of parent region's area
│     ├─ Region: "Ice Cave" (uses cells 0-63 of this map = 8×8 = 64 cells)
│     │  └─ Nested Map (Level 2) - "Ice Cave" becomes base region
│     │     ├─ Total Cells: 64 (8×8 grid)
│     │     ├─ Each cell = 1/64th of "Ice Cave" region's area
│     │     └─ Region: "Inner Sanctum" (uses cells 0-63 = 8×8 = 64 cells)
│     │        └─ Nested Map (Level 3) - Even more granular!
│     │           └─ Total Cells: 64 (8×8 grid)
│     │              └─ Each cell = 1/64th of "Inner Sanctum" region's area
```

### Cell Coordinate System

**For each map level:**
- Cells are numbered 0-63 (8×8 grid)
- Cell coordinates: `(cellX, cellY)` where both are 0-7
- Region bounds: `minX: 0-7, minY: 0-7, width: 1-8, height: 1-8`
- All regions must fit within the 8×8 grid

**Example:**
- World Map region uses cells (0,0) to (7,7) = 64 cells total
- Nested map has 64 cells (0-7, 0-7)
- Child region uses cells (2,2) to (5,5) = 16 cells (4×4)
- That child region's nested map has 64 cells, each representing 1/64th of the 16-cell area

### Unreal Coordinate Calculation

**Formula for cell size in Unreal meters:**
```
Cell Size (meters) = (Parent Region Size in Meters) / 8
```

**Example Calculation:**
1. World Map: 12km × 12km (12000m × 12000m)
2. Region "Frozen Loom": Uses 64 cells = 1500m × 1500m area (1/8th of world)
3. Nested Map: 64 cells, each = 1500m / 8 = 187.5m × 187.5m
4. Region "Ice Cave": Uses 64 cells = 187.5m × 187.5m area
5. Nested Map: 64 cells, each = 187.5m / 8 = 23.4m × 23.4m
6. And so on...

**Key Point:** Each nesting level increases granularity by 8× (8 cells per side = 64 total cells).

---

## 🎨 Complete UI/UX Flow Breakdown

### Reusable Components (Already in Codebase)

**Forms & Modals:**
- `components/ui/Modal.tsx` - Reusable modal component (already used in CharacterEditor, CreatureEditor, etc.)
- Form components pattern: `CharacterForm`, `CreatureForm`, etc. (can be adapted for Map/Region forms)

**Navigation & Layout:**
- Sidebar pattern from `DocumentationViewer.tsx` and `BookReader.tsx`
- Tab pattern from `EnvironmentEditor.tsx` (already has "maps" | "environments" tabs)
- Tree navigation pattern from `DocumentationViewer.tsx` (expandable categories)

**UI Components:**
- `components/ui/SearchableCombobox.tsx` - For dropdowns
- `components/ui/ImageUpload.tsx` - For file uploads (can be adapted for landmark icons)
- `components/ui/Tooltip.tsx` - For tooltips

---

### Main Interface Layout (Default State)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Environment Editor - Data-Centric Mode                    [Export] [Help] │
├──────────────┬──────────────────────────────────────────────────────────────┤
│              │                                                              │
│  TABS        │  MAIN CONTENT AREA                                           │
│  [Maps]      │                                                              │
│  [Environments]│  ┌──────────────────────────────────────────────────────┐ │
│              │  │  MAP PREVIEW (Read-Only)                                │ │
│  HIERARCHY   │  │  ┌──────────────────────────────────────────────────┐  │ │
│  TREE        │  │  │                                                  │  │ │
│              │  │  │  [Default Background or Uploaded Map Image]       │  │ │
│  📁 World    │  │  │                                                  │  │ │
│    📁 Frozen │  │  │  [Region Overlays - Colored Rectangles]          │  │ │
│      📁 Ice  │  │  │  [Landmark Icons - Auto-placed]                  │  │ │
│    📁 Town   │  │  │                                                  │  │ │
│              │  │  └──────────────────────────────────────────────────┘  │ │
│  [+ New Map] │  │                                                          │ │
│              │  │  Toggles: [☑ Regions] [☑ Landmarks] [☑ Grid] [☑ 3D]    │ │
│              │  └──────────────────────────────────────────────────────┘ │
│              │                                                              │
├──────────────┴──────────────────────────────────────────────────────────────┤
│  COORDINATE CALCULATOR (Collapsible Panel - Always Visible)                │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ Input: Start X[__] Y[__] Size: W[__]×H[__] cells                  │  │
│  │ Output: Unreal: X[____] Y[____] Size: [____]m × [____]m             │  │
│  │ Validation: ✅ Within bounds | ⚠️ Overlaps region | ❌ Out of bounds  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key Layout Points:**
- **Left Sidebar**: Tabs at top, Hierarchy Tree below
- **Main Area**: Map Preview (default view)
- **Bottom Panel**: Coordinate Calculator (always visible, collapsible)
- **No "OR" states**: This is the default layout

---

### UI States & Flows

#### State 1: Default View (Map Preview)

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Environment Editor                    [Export] [Help]                       │
├──────────────┬──────────────────────────────────────────────────────────────┤
│  [Maps]      │                                                              │
│  [Environments]│  ┌──────────────────────────────────────────────────────┐ │
│              │  │  Map: "World Map"                    [Edit] [Delete]  │ │
│  📁 World    │  │  ┌──────────────────────────────────────────────────┐ │ │
│    📁 Frozen │  │  │                                                  │ │ │
│      📁 Ice  │  │  │  [Map Background Image]                          │ │ │
│    📁 Town   │  │  │  [Region Overlays]                               │ │ │
│              │  │  │  [Landmark Icons]                                │ │ │
│  [+ New Map] │  │  └──────────────────────────────────────────────────┘ │ │
│              │  │  Toggles: [☑ Regions] [☑ Landmarks] [☑ Grid] [☑ 3D] │ │
│              │  └──────────────────────────────────────────────────────┘ │
├──────────────┴──────────────────────────────────────────────────────────────┤
│  Calculator: [Collapsed] [Expand ▼]                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

**User Actions:**
- Click map in tree → Map preview updates
- Click region in tree → Region highlighted on map
- Click "+ New Map" → Opens create map modal
- Click region context menu → Options: Edit, Delete, Create Nested Map

---

#### State 2: Creating Region (Modal Opens)

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Environment Editor                    [Export] [Help]                       │
├──────────────┬──────────────────────────────────────────────────────────────┤
│  [Maps]      │                                                              │
│  [Environments]│  ┌──────────────────────────────────────────────────────┐ │
│              │  │  Map Preview (dimmed, still visible)                   │ │
│  📁 World    │  │                                                          │ │
│    📁 Frozen │  └──────────────────────────────────────────────────────┘ │
│              │                                                              │
│  [+ New Map] │                                                              │
│              │                                                              │
├──────────────┴──────────────────────────────────────────────────────────────┤
│  Calculator: [Expanded]                                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  MODAL OVERLAY (on top of everything)                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Create New Region                                    [X] Close      │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │  Name: [Frozen Loom________________]                                 │  │
│  │                                                                       │  │
│  │  Cell Selection (8×8 grid):                                          │  │
│  │  Start: X [0▼] Y [0▼]  Size: W [8] H [8] cells                      │  │
│  │  [Visual Grid Helper - Clickable 8×8 grid]                          │  │
│  │                                                                       │  │
│  │  Environment Properties:                                             │  │
│  │  Biome: [Mountain▼]  Climate: [Cold▼]  Danger: [3▼]                  │  │
│  │  Creatures: [Ice Wolf] [+ Add]                                       │  │
│  │                                                                       │  │
│  │  Landmark Icon:                                                      │  │
│  │  [📎 Drag & Drop or Click to Upload]                                 │  │
│  │  Preview: [🖼️ Icon Preview]                                         │  │
│  │                                                                       │  │
│  │  Coordinate Calculator (embedded):                                   │  │
│  │  Unreal Size: 1500m × 1500m  Cell Size: 187.5m × 187.5m              │  │
│  │  ✅ Within bounds                                                    │  │
│  │                                                                       │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │  [Cancel]                    [Preview on Map]  [Save]                 │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

**User Flow:**
1. User clicks "+ New Region" in tree or context menu
2. Modal opens (using existing `Modal` component)
3. Form appears in modal (using form pattern from CharacterEditor/CreatureEditor)
4. User fills form, calculator updates in real-time
5. User clicks "Preview on Map" → Map preview updates (modal stays open)
6. User clicks "Save" → Region created, modal closes, tree updates

---

#### State 3: Editing Region (Side Panel OR Modal)

**Option A: Side Panel (Preferred for Quick Edits)**

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Environment Editor                    [Export] [Help]                       │
├──────────────┬──────────────┬───────────────────────────────────────────────┤
│  [Maps]      │              │                                               │
│  [Environments]│  SIDE      │  MAIN CONTENT                                 │
│              │  PANEL      │                                               │
│  📁 World    │  (300px)     │  ┌─────────────────────────────────────────┐ │
│    📁 Frozen │              │  │  Map Preview                              │ │
│      📁 Ice  │  Edit Region │  │  (Region highlighted)                   │ │
│    📁 Town   │  ───────────│  │                                          │ │
│              │              │  │  [Map with region overlay]               │ │
│  [+ New Map] │  Name: [...] │  │                                          │ │
│              │  Cell: [...] │  │                                          │ │
│              │  Env: [...]  │  │                                          │ │
│              │              │  └─────────────────────────────────────────┘ │
│              │  [Save]      │                                               │
│              │  [Cancel]    │                                               │
├──────────────┴──────────────┴───────────────────────────────────────────────┤
│  Calculator: [Expanded]                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Option B: Modal (For Complex Edits)**

Same as State 2, but with "Edit Region" title and pre-filled data.

**User Flow:**
1. User clicks region in tree → Region selected
2. User clicks "Edit" in context menu OR double-clicks region
3. **Side Panel opens** (slides in from right) OR **Modal opens**
4. Form pre-filled with region data
5. User edits, sees real-time updates
6. User clicks "Save" → Region updated, panel/modal closes

---

#### State 4: Viewing Data Table

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Environment Editor                    [Export] [Help]                       │
├──────────────┬──────────────────────────────────────────────────────────────┤
│  [Maps]      │                                                              │
│  [Environments]│  ┌──────────────────────────────────────────────────────┐ │
│              │  │  Regions for "World Map"              [+ New Region]   │ │
│  📁 World    │  │  ┌──────┬──────────┬──────────┬──────────┬──────────┐ │ │
│    📁 Frozen │  │  │ Name │ Bounds   │ Size     │ Env      │ Actions  │ │ │
│      📁 Ice  │  │  ├──────┼──────────┼──────────┼──────────┼──────────┤ │ │
│    📁 Town   │  │  │ Ice  │ (0,0)    │ 187.5m × │ Mountain │ [Edit]   │ │ │
│              │  │  │ Cave │ 8×8      │ 187.5m   │ Cold 3   │ [Delete] │ │ │
│  [+ New Map] │  │  │      │          │          │          │ [View]   │ │ │
│              │  │  ├──────┼──────────┼──────────┼──────────┼──────────┤ │ │
│              │  │  │ Warm │ (2,2)    │ 93.75m × │ Interior │ [Edit]   │ │ │
│              │  │  │ Inn  │ 4×4      │ 93.75m   │ Warm 0   │ [Delete] │ │ │
│              │  │  └──────┴──────────┴──────────┴──────────┴──────────┘ │ │
│              │  └──────────────────────────────────────────────────────┘ │
├──────────────┴──────────────────────────────────────────────────────────────┤
│  Calculator: [Collapsed]                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

**User Flow:**
1. User clicks map in tree → Map selected
2. User clicks "View Regions" tab OR "Regions" button
3. Data table appears showing all regions for that map
4. User clicks "Edit" in table row → Side panel or modal opens
5. User clicks "View" → Map preview updates, highlights region

---

#### State 5: 3D Scale View Active

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Environment Editor                    [Export] [Help]                       │
├──────────────┬──────────────────────────────────────────────────────────────┤
│  [Maps]      │                                                              │
│  [Environments]│  ┌──────────────────────────────────────────────────────┐ │
│              │  │  Map: "Frozen Loom"              [2D View] [3D View]  │ │
│  📁 World    │  │  ┌──────────────────────────────────────────────────┐ │ │
│    📁 Frozen │  │  │                                                  │ │ │
│      📁 Ice  │  │  │  [3D Scale Visualization]                        │ │ │
│    📁 Town   │  │  │  - Terrain based on biome                        │ │ │
│              │  │  │  - Region bounds as 3D box                       │ │ │
│  [+ New Map] │  │  │  - Landmarks as 3D markers                       │ │ │
│              │  │  │  - Camera auto-positioned for scale               │ │ │
│              │  │  └──────────────────────────────────────────────────┘ │ │
│              │  │  Scale: 187.5m × 187.5m (Cave Entrance View)          │ │
│              │  └──────────────────────────────────────────────────────┘ │
├──────────────┴──────────────────────────────────────────────────────────────┤
│  Calculator: [Expanded]                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

**User Flow:**
1. User clicks "3D View" toggle
2. 3D visualization appears (if implemented)
3. Shows terrain, region bounds, landmarks in 3D
4. Camera positioned based on hierarchy level (world → region → nested)
5. User can see scale progression visually

---

### Complete User Flows

#### Flow 1: Creating a New Region (Step-by-Step)

**Step 1: Initial State**
- User is viewing "World Map" in map preview
- Hierarchy tree shows: 📁 World Map
- User clicks "+ New Region" button (in tree or toolbar)

**Step 2: Modal Opens**
- Modal appears (using `Modal` component)
- Form loads (using form pattern from CharacterEditor)
- Map preview dims but remains visible
- Coordinate calculator expands automatically

**Step 3: User Fills Form**
- User enters name: "Frozen Loom"
- User selects cells using visual grid helper:
  - Clicks cell (0,0) as start
  - Drags to cell (7,7) OR enters width=8, height=8
  - Grid helper shows selected area highlighted
- Calculator updates in real-time:
  - Shows: "8 cells × 8 cells"
  - Shows: "1500m × 1500m in Unreal"
  - Shows: "✅ Within bounds"
- User selects environment properties:
  - Biome: Mountain
  - Climate: Cold
  - Danger: 3
- User uploads landmark icon:
  - Drags icon file onto upload area
  - Preview appears immediately
  - Icon validated (format, size)

**Step 4: Preview on Map**
- User clicks "Preview on Map" button
- Modal stays open
- Map preview updates:
  - Region overlay appears as colored rectangle
  - Landmark icon appears at calculated position
  - User can verify position and size
- User can adjust form and preview again

**Step 5: Save**
- User clicks "Save" button
- Form validates:
  - ✅ All required fields filled
  - ✅ Cell bounds valid (0-7 range)
  - ✅ Within parent map bounds
- Region created in database
- Modal closes
- Hierarchy tree updates: 📁 World Map → 📁 Frozen Loom
- Map preview updates with new region
- Success message appears

---

#### Flow 2: Editing an Existing Region

**Step 1: Select Region**
- User clicks "Frozen Loom" in hierarchy tree
- Region highlighted on map preview
- Context menu appears (or user double-clicks)

**Step 2: Open Edit Form**
- User clicks "Edit" in context menu
- **Option A: Side Panel opens** (slides in from right, 300px wide)
  - Form appears in side panel
  - Map preview remains visible (narrowed)
  - User can see region on map while editing
- **Option B: Modal opens** (for complex edits)
  - Same as create flow, but with "Edit Region" title
  - Form pre-filled with existing data

**Step 3: Edit Data**
- User changes cell bounds: (0,0) 8×8 → (2,2) 4×4
- Calculator updates: "4 cells × 4 cells = 750m × 750m"
- Validation shows: "⚠️ Overlaps with 'Ice Cave' region"
- User adjusts to avoid overlap
- User changes environment: Cold → Warm
- User uploads new icon

**Step 4: Save Changes**
- User clicks "Save"
- Region updated in database
- Side panel/modal closes
- Map preview updates with new bounds
- Hierarchy tree updates if name changed

---

#### Flow 3: Creating Nested Map from Region

**Step 1: Select Region**
- User clicks "Frozen Loom" region in tree
- Region highlighted

**Step 2: Create Nested Map**
- User clicks "Create Nested Map" in context menu
- Modal opens with nested map form

**Step 3: Configure Nested Map**
- Form shows:
  - Name: "Frozen Loom Map" (pre-filled)
  - Inherited properties (read-only):
    - Biome: Mountain (from parent region)
    - Climate: Cold (from parent region)
    - Danger Level: 3 (from parent region)
  - Unreal Size: 1500m × 1500m (auto-calculated)
  - Background Image: [Upload optional]
  - Note: "This map will have 64 cells (8×8 grid)"

**Step 4: Create**
- User clicks "Create Map"
- Nested map created
- Hierarchy tree updates:
  - 📁 World Map
    - 📁 Frozen Loom
      - 📁 Frozen Loom Map (new)
- User can now create regions on nested map

---

#### Flow 4: Navigating Hierarchy

**Step 1: Expand Tree**
- User clicks "World Map" in tree
- Tree expands showing regions:
  - 📁 World Map
    - 📁 Frozen Loom
    - 📁 Town
    - 📁 Mire of Echoes

**Step 2: Navigate to Nested Map**
- User clicks "Frozen Loom" region
- User clicks "Frozen Loom Map" (nested map)
- Map preview updates to show nested map
- Breadcrumb appears: World Map > Frozen Loom > Frozen Loom Map
- Tree shows regions for nested map

**Step 3: Navigate Back**
- User clicks "← Back" in breadcrumb OR clicks parent in tree
- Returns to parent map
- Map preview updates
- Breadcrumb updates

---

#### Flow 5: Viewing Data Table

**Step 1: Switch to Table View**
- User clicks map in tree
- User clicks "Regions" tab (next to "Preview" tab)
- Main content switches to data table view

**Step 2: View Table**
- Table shows all regions for selected map
- Columns: Name, Bounds, Size, Environment, Actions
- User can sort by any column
- User can filter/search

**Step 3: Quick Edit from Table**
- User clicks "Edit" in table row
- Side panel opens (or modal)
- Form pre-filled with region data
- User edits and saves
- Table updates immediately

**Step 4: View on Map**
- User clicks "View" in table row
- Switches back to Preview tab
- Map preview highlights selected region
- User can see region on map

---

#### Flow 6: Using Coordinate Calculator

**Step 1: Calculator Always Visible**
- Calculator panel at bottom (collapsed by default)
- User clicks "Expand" to open

**Step 2: Enter Cell Coordinates**
- User enters in calculator:
  - Start X: 3
  - Start Y: 4
  - Width: 2 cells
  - Height: 2 cells

**Step 3: See Real-Time Output**
- Calculator shows:
  - "2 cells × 2 cells"
  - Unreal Position: X: 562.5m, Y: 750m
  - Unreal Size: 375m × 375m
  - Cell Size: 187.5m × 187.5m
  - Validation: ✅ Within bounds

**Step 4: Copy to Form**
- User clicks "Copy to Form" button
- If form is open, coordinates copied
- If no form open, coordinates saved to clipboard
- User can paste into form

---

### Form Contexts (When Forms Appear)

**1. Modal (Create/Complex Edit)**
- Used for: Creating new items, complex edits
- Component: `Modal` (existing)
- Pattern: Same as CharacterEditor/CreatureEditor
- Example: Creating new region, creating nested map

**2. Side Panel (Quick Edit)**
- Used for: Quick edits, simple changes
- Component: New `SidePanel` component (similar to DocumentationViewer sidebar)
- Pattern: Slides in from right, 300px wide
- Example: Editing region name, adjusting cell bounds

**3. Main Area (Full Edit Mode)**
- Used for: Extended editing sessions
- Component: Form replaces map preview
- Pattern: Toggle between Preview and Edit tabs
- Example: Detailed map configuration

**4. Inline (Data Table)**
- Used for: Quick edits in table
- Component: Inline form in table row
- Pattern: Expand row to show form
- Example: Quick name change, quick bounds adjustment
   │                                         │
   │  Coordinate Calculator:                 │
   │  ┌───────────────────────────────────┐ │
   │  │ Unreal Size: 1500m × 1500m       │ │
   │  │ Cell Size: 187.5m × 187.5m       │ │
   │  │ ✅ Within parent map bounds       │ │
   │  └───────────────────────────────────┘ │
   │                                         │
   │  Environment Properties:                │
   │  Biome: [Mountain▼]                     │
   │  Climate: [Cold▼]                       │
   │  Danger Level: [3▼] (0-5)               │
   │  Creatures: [Ice Wolf] [+ Add]         │
   │                                         │
   │  Landmark Icon:                         │
   │  ┌───────────────────────────────────┐ │
   │  │ [📎 Drag & Drop Icon Here]         │ │
   │  │ or [Click to Upload]               │ │
   │  │ Preview: [🖼️ Icon Preview]        │ │
   │  └───────────────────────────────────┘ │
   │                                         │
   │  [Save] [Cancel] [Preview on Map]      │
   └─────────────────────────────────────────┘
   ```

4. **Use Coordinate Calculator**
   - As user enters cell bounds, calculator shows:
     - Unreal unit size
     - Cell size in meters
     - Validation status (within bounds, overlaps, etc.)

5. **Upload Landmark Icon**
   - User drags icon file onto upload area OR clicks to browse
   - Preview appears immediately
   - File validated (size, format)
   - Icon stored and associated with region

6. **Validate & Preview**
   - User clicks "Preview on Map" button
   - Map preview updates to show new region as overlay
   - User can verify position and size visually

7. **Save**
   - User clicks "Save"
   - Region created and appears in hierarchy tree
   - Map preview updates with new region

#### Flow 2: Editing an Existing Region

**Step-by-Step:**

1. **Select Region**
   - User clicks region in hierarchy tree OR clicks region overlay on map preview
   - Region highlighted in tree and on map

2. **Open Edit Form**
   - User clicks "Edit" button (in tree context menu or map overlay)
   - Form appears with current region data pre-filled

3. **Modify Data**
   - User changes cell bounds, environment properties, or uploads new icon
   - Coordinate calculator updates in real-time
   - Validation shows warnings if bounds change

4. **Preview Changes**
   - User clicks "Preview on Map"
   - Map preview shows updated region overlay
   - User verifies changes look correct

5. **Save Changes**
   - User clicks "Save"
   - Region updated in database
   - Map preview and hierarchy tree update

#### Flow 3: Creating a Nested Map from Region

**Step-by-Step:**

1. **Select Region**
   - User clicks region in hierarchy tree
   - Region highlighted

2. **Create Nested Map**
   - User clicks "Create Nested Map" button (in tree context menu)
   - Nested map form appears

3. **Configure Nested Map**
   ```
   ┌─────────────────────────────────────────┐
   │  Create Nested Map from "Frozen Loom"   │
   ├─────────────────────────────────────────┤
   │  Name: [Frozen Loom Map________]       │
   │                                         │
   │  Inherited from Region:                 │
   │  ✅ Biome: Mountain                     │
   │  ✅ Climate: Cold                       │
   │  ✅ Danger Level: 3                     │
   │  ✅ Creatures: Ice Wolf, Frost Giant    │
   │                                         │
   │  Map Configuration:                     │
   │  Unreal Size: [1500]m × [1500]m         │
   │  (Auto-calculated from parent region)   │
   │                                         │
   │  Background Image (Optional):            │
   │  [📎 Drag & Drop Map Image]             │
   │  or [Click to Upload]                   │
   │  Preview: [🖼️ Image Preview]            │
   │                                         │
   │  Note: This map will have 64 cells      │
   │  (8×8 grid). Each cell = 187.5m × 187.5m│
   │                                         │
   │  [Create Map] [Cancel]                  │
   └─────────────────────────────────────────┘
   ```

4. **Upload Background (Optional)**
   - User can upload a map image for visual reference
   - Image is stretched to fit coordinate config
   - Used only for preview/visual aid

5. **Create Map**
   - User clicks "Create Map"
   - Nested map created with 64 cells (8×8 grid)
   - Appears in hierarchy tree under parent region
   - User can now create regions on this nested map

#### Flow 4: Viewing Map Preview

**Step-by-Step:**

1. **Select Map**
   - User clicks map in hierarchy tree
   - Map preview appears in main content area

2. **Map Preview Display**
   ```
   ┌─────────────────────────────────────────┐
   │  Map: "Frozen Loom Map"                  │
   │  [Zoom In] [Zoom Out] [Fit] [Reset]     │
   ├─────────────────────────────────────────┤
   │  ┌───────────────────────────────────┐ │
   │  │                                    │ │
   │  │  [Background Image or Default]     │ │
   │  │                                    │ │
   │  │  ┌─────┐      ┌─────┐            │ │
   │  │  │[Icon]│      │[Icon]│  ← Landmarks│ │
   │  │  └─────┘      └─────┘            │ │
   │  │                                    │ │
   │  │  ┌──────────────────────────┐    │ │
   │  │  │ Region Overlay (colored) │    │ │
   │  │  └──────────────────────────┘    │ │
   │  │                                    │ │
   │  └───────────────────────────────────┘ │
   │                                         │
   │  Controls:                             │
   │  ☑ Show Regions  ☑ Show Landmarks      │
   │  ☑ Show Grid     ☑ Show Coordinates    │
   │                                         │
   │  Hover Info:                            │
   │  Cell: (3, 4) | Unreal: (562.5, 750)m  │
   └─────────────────────────────────────────┘
   ```

3. **Interact with Preview**
   - **Hover**: Shows cell coordinates and Unreal coordinates
   - **Click Region Overlay**: Selects region, shows details panel
   - **Click Landmark**: Shows landmark details
   - **Zoom/Pan**: Read-only navigation (no editing)

4. **Verify Data**
   - User can see all regions as colored overlays
   - User can see all landmarks at their coordinates
   - User can verify everything looks correct before exporting

#### Flow 5: Using Coordinate Calculator

**Step-by-Step:**

1. **Open Calculator**
   - Calculator panel always visible at bottom (or can be toggled)
   - Or embedded in forms

2. **Enter Cell Selection (User-Friendly)**
   ```
   ┌─────────────────────────────────────────┐
   │  Coordinate Calculator                  │
   ├─────────────────────────────────────────┤
   │  Cell Selection:                         │
   │  Start: X [3]  Y [4]  (0-7 range)      │
   │  Size:  Width [2] cells  Height [2] cells│
   │  (Displays: "2 cells × 2 cells")        │
   │                                         │
   │  Calculated Output (Unreal Units):       │
   │  Position: X: 562.5m  Y: 750m          │
   │  Size: 375m × 375m                      │
   │  Area: 140,625 m²                       │
   │                                         │
   │  Cell Details:                          │
   │  Cell Size: 187.5m × 187.5m            │
   │  Total Cells: 4 (2×2 grid)             │
   │                                         │
   │  Validation:                             │
   │  ✅ Within parent map bounds             │
   │  ⚠️ Overlaps with "Ice Cave" region     │
   │                                         │
   │  Stored Data (for reference):            │
   │  { minX: 3, minY: 4, width: 2, height: 2 }│
   │                                         │
   │  [Copy to Form] [Clear]                 │
   └─────────────────────────────────────────┘
   ```

3. **See Real-Time Calculations**
   - As user types, calculator updates immediately
   - Shows Unreal coordinates, cell size, area
   - Shows validation status
   - Displays user-friendly "X cells × Y cells" format
   - Shows stored data format for reference

4. **Copy to Form**
   - User clicks "Copy to Form" button
   - Coordinates copied to active form
   - User can then save

**Key Point:** User sees friendly "8 cells × 8 cells" but system stores minimal data: `{ minX, minY, width, height }`

#### Flow 6: Uploading Landmark Icon

**Step-by-Step:**

1. **In Region/Placement Form**
   - User sees "Landmark Icon" section

2. **Drag & Drop**
   ```
   ┌─────────────────────────────────────────┐
   │  Landmark Icon                          │
   ├─────────────────────────────────────────┤
   │  ┌───────────────────────────────────┐ │
   │  │                                    │ │
   │  │  📎 Drag & Drop Icon Here         │ │
   │  │                                    │ │
   │  │  or                                │ │
   │  │                                    │ │
   │  │  [Click to Upload]                │ │
   │  │                                    │ │
   │  └───────────────────────────────────┘ │
   │                                         │
   │  Requirements:                          │
   │  • Format: PNG, JPG, SVG               │
   │  • Max Size: 512×512px                 │
   │  • Recommended: 64×64px or 128×128px   │
   │                                         │
   │  Preview: (shown after upload)          │
   │  ┌─────┐                               │
   │  │ 🖼️  │  [Remove] [Replace]           │
   │  └─────┘                               │
   └─────────────────────────────────────────┘
   ```

3. **Upload Process**
   - User drags file onto drop zone OR clicks to browse
   - File validated (format, size)
   - Preview appears immediately
   - File uploaded to server
   - Icon path stored in database

4. **Preview on Map**
   - Icon appears on map preview at region/placement coordinates
   - User can verify it looks correct

### Data Table Interactions

#### Viewing Regions Table

```
┌─────────────────────────────────────────────────────────────────┐
│  Regions for "Frozen Loom Map"                    [+ New Region] │
├──────┬──────────┬──────────────┬──────────┬──────────┬─────────┤
│ Name │ Bounds   │ Size (Unreal)│ Env      │ Icon     │ Actions │
├──────┼──────────┼──────────────┼──────────┼──────────┼─────────┤
│ Ice  │ (0,0)    │ 187.5m ×     │ Mountain │ 🖼️       │ [Edit]  │
│ Cave │ 8×8      │ 187.5m      │ Cold 3   │          │ [Delete]│
│      │          │              │          │          │ [View]  │
├──────┼──────────┼──────────────┼──────────┼──────────┼─────────┤
│ Warm │ (2,2)    │ 93.75m ×     │ Interior │ 🖼️       │ [Edit]  │
│ Inn  │ 4×4      │ 93.75m      │ Warm 0   │          │ [Delete]│
│      │          │              │          │          │ [View]  │
└──────┴──────────┴──────────────┴──────────┴──────────┴─────────┘

Actions:
- [Edit]: Opens edit form
- [Delete]: Confirms and deletes region
- [View]: Shows region on map preview (highlights it)
```

#### Quick Edit from Table
- User clicks "Edit" in table row
- Form appears with data pre-filled
- User makes changes and saves
- Table updates immediately

### 3D Scale View (Exploratory Feature)

#### Concept: Visual Scale Reference for Unreal Space

**Goal:** Help users understand the scale of regions in 3D Unreal space by showing a 3D view that automatically adjusts based on hierarchy level.

**How It Works:**

1. **Top Level (World Map)**
   - Shows entire world from high altitude
   - View: Satellite/terrain view showing entire 12km × 12km world
   - Scale: Very zoomed out, showing mountains, terrain features
   - Purpose: User sees the full world context

2. **First Region (e.g., "Frozen Loom")**
   - Zooms into the region area
   - View: High-altitude view of mountains/terrain
   - Scale: Shows 1.5km × 1.5km area (region size)
   - Purpose: User sees this is a large mountain range area

3. **Nested Region (e.g., "Ice Cave")**
   - Zooms further into the region
   - View: Closer view, maybe showing cave entrance, terrain details
   - Scale: Shows 187.5m × 187.5m area
   - Purpose: User sees this is a smaller area, more detailed

4. **Deeper Nesting (e.g., "Inner Sanctum")**
   - Zooms even closer
   - View: Ground-level or campsite-level view
   - Scale: Shows 23.4m × 23.4m area
   - Purpose: User sees this is a very small, intimate space

**Visual Progression:**
```
World Map → Satellite view (12km scale)
  ↓ Create Region
Region → Mountain range view (1.5km scale)
  ↓ Create Nested Map & Region
Nested Region → Cave entrance view (187m scale)
  ↓ Create Nested Map & Region
Deep Region → Campsite view (23m scale)
```

#### Technical Considerations

**Technology Options:**

1. **Three.js with React Three Fiber** (Recommended)
   - **Pros:**
     - Industry standard for 3D in React
     - Good performance
     - Easy to integrate with React
     - Can render terrain, objects, regions
     - Can use Unreal units directly
   - **Cons:**
     - Additional dependency (~500KB)
     - Learning curve for 3D concepts
     - More complex than 2D preview
   - **Install:** `npm install @react-three/fiber @react-three/drei three`

2. **CSS 3D Transforms** (Simpler Alternative)
   - **Pros:**
     - No additional dependencies
     - Simpler implementation
     - Good for basic scale visualization
   - **Cons:**
     - Limited 3D capabilities
     - Less realistic than Three.js
     - Harder to show terrain/landscape

3. **2D Scale Indicator** (Simplest)
   - **Pros:**
     - No 3D complexity
     - Easy to implement
     - Clear scale reference
   - **Cons:**
     - Less immersive
     - Doesn't show 3D space as clearly

**Recommended Approach: Three.js with React Three Fiber**

**Why:**
- Can render terrain/landscape based on biome
- Can show regions as 3D boxes/areas
- Can use Unreal units directly (no conversion)
- Can show scale progression naturally
- Professional 3D visualization

**Implementation Complexity:**
- **Medium-High:** Requires 3D rendering knowledge
- **Time Estimate:** 2-3 weeks for basic implementation
- **Maintenance:** Moderate (3D scenes need optimization)

**Data Requirements:**
- Region bounds (already stored)
- Biome type (for terrain generation)
- Unreal coordinates (already calculated)
- No additional data storage needed

**Component Structure:**
```typescript
// components/environment/ScaleView3D.tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Terrain } from '@react-three/drei';

export function ScaleView3D({ region, parentSize }: ScaleView3DProps) {
  // Calculate scale based on region size
  const scale = calculateScaleFromRegion(region, parentSize);
  
  // Generate terrain based on biome
  const terrain = generateTerrain(region.metadata.biome);
  
  return (
    <Canvas camera={{ position: [0, scale * 2, scale * 2] }}>
      <ambientLight />
      <directionalLight position={[10, 10, 5]} />
      
      {/* Terrain */}
      <Terrain geometry={terrain} />
      
      {/* Region Bounds (3D box) */}
      <RegionBounds 
        bounds={region.cellBounds}
        color={region.color}
        size={scale}
      />
      
      {/* Landmarks */}
      {region.landmarks.map(landmark => (
        <LandmarkMarker 
          position={landmark.coordinates}
          icon={landmark.icon}
        />
      ))}
      
      <OrbitControls />
    </Canvas>
  );
}
```

**Integration:**
- Show 3D view alongside 2D preview
- Auto-update when region changes
- Smooth transitions between hierarchy levels
- Optional feature (can be disabled if too complex)

**Status:** Exploratory - Evaluate feasibility and complexity before full implementation

**The "Puzzle" Concept:**
- Users are piecing together the map with 3D landscape in mind
- Each region is a piece that fits into the larger puzzle
- 3D scale view helps users understand how pieces fit together
- Visual progression from world → region → nested region shows the puzzle coming together
- Understanding scale is crucial for proper Unreal placement

---

### Preview System Details

#### How Preview Works

1. **Map Background**
   - Uses uploaded map image if available
   - OR uses default procedural background
   - Stretched to fit coordinate config

2. **Region Overlays**
   - Each region drawn as colored rectangle
   - Position calculated from cell bounds
   - Color from region's unique color
   - Semi-transparent overlay
   - Shows region name on hover

3. **Landmark Icons**
   - Each landmark icon positioned at coordinates
   - Icon from uploaded file
   - Scaled appropriately for map zoom level
   - Shows landmark name on hover

4. **Grid Overlay (Optional)**
   - Shows 8×8 cell grid
   - Helps user see cell boundaries
   - Can be toggled on/off

5. **Coordinate Display (Optional)**
   - Shows cell coordinates on hover
   - Shows Unreal coordinates on hover
   - Helps user verify positioning

#### Preview Toggles

- **Toggle Regions**: Show/hide region overlays
- **Toggle Landmarks**: Show/hide landmark icons
- **Toggle Grid**: Show/hide cell grid
- **Toggle Coordinates**: Show/hide coordinate info on hover
- **Toggle 3D Scale View**: Show/hide 3D scale visualization (if implemented)

### How Users Verify Data is Correct

#### Verification Workflow

**1. Visual Verification via Preview**
- User creates/edits region or placement
- Clicks "Preview on Map" button
- Map preview updates to show new item
- User visually verifies:
  - ✅ Region is in correct position
  - ✅ Region size looks correct
  - ✅ Landmark icon appears at right location
  - ✅ No unexpected overlaps
  - ✅ Everything aligns with expectations

**2. Coordinate Verification**
- User hovers over map preview
- Sees cell coordinates (e.g., "Cell: (3, 4)")
- Sees Unreal coordinates (e.g., "Unreal: (562.5, 750)m")
- Verifies coordinates match expectations
- Can compare with coordinate calculator output

**3. Data Table Verification**
- User views regions/placements in data table
- Sees all data in tabular format:
  - Cell bounds
  - Unreal size
  - Environment properties
  - Icon status
- Can quickly scan to verify all data is present

**4. Validation Status**
- System shows validation status in real-time:
  - ✅ Green checkmark: All validations pass
  - ⚠️ Yellow warning: Overlaps or minor issues
  - ❌ Red error: Out of bounds or invalid data
- User can see issues immediately and fix them

**5. Export Validation**
- Before exporting, system runs full validation
- Shows validation report:
  - All regions and their bounds
  - All landmarks and their positions
  - Any issues (overlaps, out of bounds, etc.)
- Export button only enabled if all validations pass
- User can review report and fix issues before export

#### Quick Verification Checklist

**After creating/editing a region:**
- [ ] Preview shows region in correct position
- [ ] Region size looks correct on map
- [ ] Landmark icon appears (if uploaded)
- [ ] Cell coordinates are 0-7 (valid range)
- [ ] Unreal coordinates are reasonable
- [ ] No validation errors shown
- [ ] Environment properties are correct

**Before exporting:**
- [ ] All regions visible on preview
- [ ] All landmarks visible on preview
- [ ] No validation errors
- [ ] Export validation report shows all green
- [ ] Coordinate calculations look correct
- [ ] All landmark icons uploaded

#### Real-Time Feedback

**As user works:**
- Coordinate calculator updates in real-time
- Validation status updates as user types
- Preview updates when "Preview on Map" clicked
- Form shows warnings/errors immediately
- User never has to guess if data is correct

**Visual Indicators:**
- ✅ Green: Valid, ready to save
- ⚠️ Yellow: Warning (overlaps, but valid)
- ❌ Red: Error (must fix before saving)
- 🔵 Blue: Selected/active item

### Cell Selection UX vs Data Storage

#### User-Friendly Presentation

**What User Sees:**
- "Start Cell: X [3] Y [4]"
- "Size: Width [2] cells × Height [2] cells"
- Visual grid helper showing 8×8 cells
- Clear indication of cell count (e.g., "2 cells × 2 cells = 4 total cells")

**Why This Works:**
- Easy to understand: "I want 8 cells wide and 8 cells tall"
- Visual feedback: See the grid, click to select
- Intuitive: Think in terms of cell dimensions, not coordinates

#### Minimal Data Storage

**What Gets Stored:**
```typescript
{
  minX: 0,      // Start X coordinate (0-7)
  minY: 0,      // Start Y coordinate (0-7)
  width: 8,     // Width in cells (1-8)
  height: 8     // Height in cells (1-8)
}
```

**Why This Works:**
- Minimal data: Only 4 numbers needed
- Easy to calculate: All other values derived from these
- Efficient: No need to store all 64 cell coordinates
- Flexible: Can represent any rectangular region

#### Coordinate Calculations

**From Stored Data to Display:**
```typescript
// User sees: "8 cells × 8 cells"
// Stored: { minX: 0, minY: 0, width: 8, height: 8 }

// Calculate corners:
const topLeft = { x: minX, y: minY };
const topRight = { x: minX + width - 1, y: minY };
const bottomLeft = { x: minX, y: minY + height - 1 };
const bottomRight = { x: minX + width - 1, y: minY + height - 1 };

// Calculate Unreal coordinates:
const cellSize = parentRegionSize / 8;
const unrealMinX = minX * cellSize;
const unrealMinY = minY * cellSize;
const unrealWidth = width * cellSize;
const unrealHeight = height * cellSize;
```

**From User Input to Storage:**
```typescript
// User enters: Start X=3, Start Y=4, Width=2, Height=2
// Stored: { minX: 3, minY: 4, width: 2, height: 2 }

// User can also select by clicking corners:
// Click top-left at (3, 4), drag to bottom-right at (4, 5)
// Calculated: minX=3, minY=4, width=2, height=2
```

### Validation & Calculation Aids

#### Real-Time Validation

**As user enters data:**
- ✅ **Within Bounds**: Region fits within parent map (0-7 range)
- ⚠️ **Overlaps**: Region overlaps with another region (warning, not error)
- ❌ **Out of Bounds**: Region extends beyond parent map (error)
- ✅ **Valid Cell Range**: Start coordinates are 0-7 (for 8×8 grid)
- ✅ **Valid Size**: Width and height are 1-8
- ✅ **Valid End**: End coordinates (minX + width - 1) don't exceed 7

#### Calculation Display

**Always visible:**
- Cell size in Unreal meters (calculated from parent region size / 8)
- Region size in Unreal meters (width × cellSize, height × cellSize)
- Total area in square meters
- Number of cells in region (width × height)
- Position in Unreal coordinates (minX × cellSize, minY × cellSize)
- User-friendly display: "8 cells × 8 cells" format

#### Constraints for Unreal Autoplacement

**System ensures:**
- All coordinates are valid Unreal units
- No regions extend beyond parent bounds (0-7 range)
- Cell sizes are properly calculated (parent size / 8)
- Landmark positions are within valid ranges
- All data ready for direct Unreal import
- Minimal data storage (only minX, minY, width, height)

**Validation Report:**
- Shows all regions and their bounds
- Shows all landmarks and their positions
- Highlights any issues (overlaps, out of bounds, etc.)
- Shows stored data format vs user-friendly display
- Export button only enabled if all validations pass

---

## 📋 Implementation Phases

### Phase 1: Data-Centric Forms (Foundation)

**Goal:** Replace visual editor with form-based editing

**Tasks:**
1. **Enhanced MapForm**
   - Add coordinate config inputs (world size, image size)
   - Add background image upload (drag & drop)
   - Add coordinate calculator integration
   - Add validation for coordinate bounds
   - Show 64-cell grid information

2. **RegionForm (New/Enhanced)**
   - Input fields: Start cell (X, Y) and size (width, height in cells)
   - **User-friendly display**: "8 cells × 8 cells" format
   - **Stored as minimal data**: { minX, minY, width, height }
   - Visual 8×8 grid helper for cell selection
   - Environment properties: Biome, Climate, Danger Level, Creatures
   - **Landmark icon upload**: Drag & drop file upload with preview
   - Coordinate calculator: Show Unreal unit equivalents in real-time
   - Validation: Ensure region fits within parent map bounds (0-7 range)
   - Preview button: Show region on map preview

3. **PlacementForm (Enhanced)**
   - Coordinate input: Cell coordinates (0-7 range)
   - Coordinate calculator integration
   - Landmark icon upload (if landmark type)
   - Preview button: Show placement on map preview

4. **Data Tables**
   - MapsTable: List all maps, navigate hierarchy
   - RegionsTable: List regions for map, edit/delete, show icon preview
   - PlacementsTable: List placements, edit/delete

5. **Hierarchy Navigation**
   - Tree view component with expand/collapse
   - Breadcrumb navigation for deep nesting
   - Click to navigate and edit
   - Context menus for quick actions

6. **Coordinate Calculator**
   - Standalone calculator component
   - Real-time calculation as user types
   - Shows cell coordinates, Unreal coordinates, cell size, region size
   - Validation status (within bounds, overlaps, out of bounds)
   - Copy to form functionality

**Deliverables:**
- ✅ All CRUD operations via forms
- ✅ Coordinate calculator tool with real-time updates
- ✅ Data tables for viewing/editing
- ✅ Hierarchy navigation with context menus
- ✅ Landmark icon upload with drag & drop
- ✅ 64-cell grid system implementation

---

### Phase 2: Runtime Map Visualization & Preview System (with 3D Scale View Exploration)

**Goal:** Display maps with auto-placed landmarks and regions for data verification

**Tasks:**
1. **Map Viewer Component**
   - Read-only map display
   - Background: Uploaded map image OR default procedural background
   - Region overlays: Colored semi-transparent rectangles based on cell bounds
   - Landmark icons: Auto-placed at coordinates using uploaded icons
   - Grid overlay: Optional 8×8 cell grid display
   - Coordinate display: Show cell/Unreal coordinates on hover

2. **Auto-Placement Logic**
   - Calculate pixel positions from cell coordinates (0-7 range)
   - Convert cell coordinates to Unreal units
   - Draw regions as colored overlays with region names
   - Draw landmark icons at calculated positions
   - Scale icons appropriately for zoom level
   - Handle nested maps (show parent context in breadcrumb)

3. **Visualization Controls**
   - Toggle region visibility (show/hide overlays)
   - Toggle landmark visibility (show/hide icons)
   - Toggle grid (show/hide 8×8 cell grid)
   - Toggle coordinates (show/hide coordinate info on hover)
   - Zoom controls: Zoom in, zoom out, fit to viewport, reset
   - Pan: Click and drag to move around map (read-only)

4. **Interactive Preview**
   - Click region overlay: Selects region, shows details panel
   - Click landmark icon: Shows landmark details
   - Hover region: Highlights region, shows name and bounds
   - Hover landmark: Shows landmark name and coordinates
   - Hover map: Shows cell coordinates and Unreal coordinates

5. **Preview Integration with Forms**
   - "Preview on Map" button in forms
   - Updates map preview to show new/edited region/placement
   - Highlights the item being edited
   - Allows user to verify data before saving

6. **3D Scale View (Exploratory)**
   - Research Three.js/React Three Fiber integration
   - Prototype 3D scale visualization
   - Test terrain generation based on biome
   - Evaluate performance and complexity
   - Decide if worth full implementation

**Deliverables:**
- ✅ Map viewer with auto-placed content
- ✅ Region visualization with colored overlays
- ✅ Landmark visualization with uploaded icons
- ✅ Interactive preview (click, hover)
- ✅ Preview integration with forms
- ✅ Grid and coordinate display options
- ⚠️ 3D scale view prototype (if feasible)

---

### Phase 3: Map Editor (Work-in-Progress)

**Goal:** Mark visual editor as experimental/roadmap feature

**Tasks:**
1. **Editor Status**
   - Add "Work in Progress" banner to map editor
   - Disable or limit editing capabilities
   - Add roadmap link/documentation

2. **Preserve Existing Code**
   - Keep all map editor components
   - Mark as experimental
   - Add warnings about instability

3. **Future Roadmap**
   - Document planned visual editor features
   - List known issues/limitations
   - Plan for future enhancement

**Deliverables:**
- ✅ Map editor marked as WIP
- ✅ Documentation of roadmap
- ✅ Existing code preserved

---

### Phase 4: Unreal Integration & Validation

**Goal:** Ensure proper Unreal Engine integration with data-centric approach and calculation aids

**Tasks:**
1. **Export Format Updates**
   - Update export to include all coordinate data in Unreal units
   - Include 64-cell grid information per map level
   - Include cell-to-Unreal mappings
   - Include region boundaries in Unreal coordinates
   - Include placement positions in Unreal coordinates
   - Include landmark icon paths and metadata

2. **3D Space Considerations**
   - Support Z-axis (height) in placements
   - Calculate proper 3D coordinates
   - Handle terrain height mapping
   - Ensure all coordinates work in Unreal 3D space

3. **Validation & Calculation Aids**
   - Real-time validation as user enters data
   - Validate coordinate ranges (0-7 for cells)
   - Check for overlapping regions (warning, not error)
   - Verify placement bounds within parent map
   - Validate landmark icon uploads (format, size)
   - Export validation report before export
   - Show calculation aids: cell size, region size, area in Unreal meters

4. **Constraints for Autoplacement**
   - Ensure all coordinates are valid Unreal units
   - Verify no regions extend beyond parent bounds
   - Validate cell sizes are properly calculated
   - Check landmark positions are within valid ranges
   - Ensure all data ready for direct Unreal import
   - Export button only enabled if all validations pass

**Deliverables:**
- ✅ Updated export format with all coordinate data
- ✅ 3D coordinate support (Z-axis)
- ✅ Real-time validation system
- ✅ Calculation aids (cell size, region size, area)
- ✅ Constraints validation for Unreal autoplacement
- ✅ Export validation report

---

## 🎨 UI/UX Design

### Main Interface Layout

```
┌─────────────────────────────────────────────────────────┐
│  Environment Editor - Data-Centric Mode                 │
├──────────────┬──────────────────────────────────────────┤
│              │                                          │
│  Hierarchy   │  Main Content Area                       │
│  Tree View   │                                          │
│              │  - Map Form / Region Form /              │
│  - World Map │    Placement Form                        │
│    - Region  │                                          │
│      - Nested│  - OR -                                  │
│        Map   │                                          │
│    - Region  │  - Map Viewer (read-only)                │
│              │    with auto-placed landmarks            │
│              │                                          │
│              │  - OR -                                 │
│              │                                          │
│              │  - Data Tables (Maps/Regions/Placements) │
│              │                                          │
├──────────────┴──────────────────────────────────────────┤
│  Coordinate Calculator (always visible or modal)        │
└─────────────────────────────────────────────────────────┘
```

### Form-Based Editing Flow

1. **Select Map/Region** from hierarchy tree
2. **Choose Action**: Create/Edit Map, Create/Edit Region, Create/Edit Placement
3. **Fill Form**: Enter data (coordinates, properties, etc.)
4. **Use Calculator**: Calculate coordinates if needed
5. **Validate**: Check bounds and relationships
6. **Save**: Store in database
7. **View**: See on map viewer (read-only)

### Data Tables

**Maps Table:**
- Columns: Name, Type, World Size, Image Size, Cell Size, Actions
- Actions: Edit, Delete, View, Create Nested Map

**Regions Table:**
- Columns: Name, Cell Bounds (minX, minY, width, height), Environment, Actions
- Actions: Edit, Delete, View, Create Nested Map

**Placements Table:**
- Columns: Name, Type, Coordinates, Precision, Actions
- Actions: Edit, Delete, View

---

## 🔧 Technical Implementation

### Component Reuse Strategy

**Reuse Existing Components:**
- ✅ `components/ui/Modal.tsx` - For create/edit modals (already used in CharacterEditor, CreatureEditor)
- ✅ Form patterns from `CharacterForm`, `CreatureForm` - Adapt for `RegionForm`, `MapForm`
- ✅ Sidebar pattern from `DocumentationViewer.tsx` - For hierarchy tree and side panel
- ✅ Tab pattern from `EnvironmentEditor.tsx` - For Maps/Environments tabs
- ✅ `components/ui/SearchableCombobox.tsx` - For dropdowns (Biome, Climate, etc.)
- ✅ `components/ui/ImageUpload.tsx` - Adapt for landmark icon uploads
- ✅ `components/ui/Tooltip.tsx` - For tooltips
- ✅ Tree navigation pattern from `DocumentationViewer.tsx` - For expandable hierarchy

**Update Existing Components:**
- 🔄 `EnvironmentEditor.tsx` - Add data-centric mode, update tabs
- 🔄 `MapForm.tsx` - Enhance with coordinate calculator integration
- 🔄 `MapCanvas.tsx` - Mark as WIP, add read-only preview mode
- 🔄 `CellSelectionLayer.tsx` - Update for 64-cell grid system

**New Components Needed:**
- 🆕 `MapHierarchyTree.tsx` - Tree view for maps/regions (based on DocumentationViewer pattern)
- 🆕 `RegionForm.tsx` - Region form (based on CharacterForm pattern)
- 🆕 `PlacementForm.tsx` - Placement form
- 🆕 `MapsTable.tsx` - Data table for maps
- 🆕 `RegionsTable.tsx` - Data table for regions
- 🆕 `PlacementsTable.tsx` - Data table for placements
- 🆕 `CoordinateCalculator.tsx` - Standalone calculator component
- 🆕 `MapViewer.tsx` - Read-only map preview (simplified MapCanvas)
- 🆕 `SidePanel.tsx` - Side panel for quick edits (based on DocumentationViewer sidebar)
- 🆕 `ScaleView3D.tsx` - 3D scale visualization (exploratory)

### Component Structure

```
components/environment/
├── data-centric/
│   ├── MapHierarchyTree.tsx      # Tree view (reuse DocumentationViewer pattern)
│   ├── MapForm.tsx                # Enhanced map form (update existing)
│   ├── RegionForm.tsx             # Region form (new, based on CharacterForm)
│   ├── PlacementForm.tsx         # Placement form (new)
│   ├── MapsTable.tsx              # Maps data table (new)
│   ├── RegionsTable.tsx           # Regions data table (new)
│   ├── PlacementsTable.tsx        # Placements data table (new)
│   ├── CoordinateCalculator.tsx   # Standalone calculator (new)
│   └── SidePanel.tsx              # Side panel for quick edits (new, based on sidebar pattern)
│
├── visualization/
│   ├── MapViewer.tsx              # Read-only map viewer (new, simplified MapCanvas)
│   ├── RegionOverlay.tsx          # Region visualization (update existing)
│   ├── LandmarkRenderer.tsx       # Landmark auto-placement (update existing)
│   └── ScaleView3D.tsx            # 3D scale visualization (new, exploratory)
│
├── EnvironmentEditor.tsx          # Main editor (update for data-centric mode)
├── MapForm.tsx                    # Map form (update existing)
├── MapCanvas.tsx                  # Existing canvas (mark as WIP)
└── editor/                        # Existing editor components (mark as WIP)
    ├── CellSelectionLayer.tsx     # Update for 64-cell system
    └── ...
```

### Store Updates

**mapEditorStore.ts:**
- Keep existing state structure (regions, maps, placements)
- Add form state management (which form is open, edit mode)
- Add hierarchy navigation state (selected map, selected region, breadcrumb)
- Add view state (preview vs table vs 3D view)
- Keep coordinate calculations (all existing logic)
- Keep 64-cell grid calculations
- Remove or disable visual editing actions (mark as deprecated)

### API Updates

**No changes needed:**
- All existing API endpoints work with data-centric approach
- Forms submit to same endpoints (`mapClient.create`, `mapRegionClient.create`, etc.)
- Data tables fetch from same endpoints (`mapClient.list`, `mapRegionClient.list`, etc.)
- Coordinate calculations use existing `coordinateSystem.ts` utilities

### Form Component Pattern

**Reuse Pattern from CharacterEditor:**
```typescript
// RegionForm.tsx (based on CharacterForm.tsx pattern)
export function RegionForm({
  initialValues,
  isEdit = false,
  onSubmit,
  onCancel,
  saving = false,
}: RegionFormProps) {
  // Form logic similar to CharacterForm
  // Uses same validation patterns
  // Uses same submit/cancel handlers
}

// Usage in EnvironmentEditor (same as CharacterEditor)
<Modal
  isOpen={showCreateModal}
  onClose={() => setShowCreateModal(false)}
  title="Create New Region"
  footer={<RegionFormFooter ... />}
>
  <RegionForm
    onSubmit={handleCreate}
    onCancel={() => setShowCreateModal(false)}
    saving={saving}
  />
</Modal>
```

**Side Panel Pattern:**
```typescript
// SidePanel.tsx (based on DocumentationViewer sidebar)
export function SidePanel({ isOpen, onClose, children }: SidePanelProps) {
  return (
    <div className={`${isOpen ? 'w-80' : 'w-0'} transition-all ...`}>
      {isOpen && (
        <div className="h-full overflow-y-auto p-4">
          {children}
        </div>
      )}
    </div>
  );
}
```

---

## 📐 Coordinate System (Enhanced for 64-Cell Hierarchy)

### Core Principle: Unreal Units as Source of Truth

**All coordinates calculate down to Unreal units (meters).** The system uses a hierarchical 64-cell grid where each region is divided into exactly 64 cells (8×8 grid).

### Coordinate Flow

```
User Input (Cell Coordinates 0-7)
  ↓ calculateCellToUnreal()
Unreal Units (stored in database)
  ↓ (direct use - no conversion)
Unreal Engine (Unreal units)
```

### 64-Cell Grid System

**Every map level has exactly 64 cells (8×8 grid):**
- Cell coordinates: `(cellX, cellY)` where both are 0-7
- Region bounds: `minX: 0-7, minY: 0-7, width: 1-8, height: 1-8`
- All regions must fit within the 8×8 grid

**Cell Size Calculation:**
```
Cell Size (meters) = (Parent Region Size in Meters) / 8
```

**Example:**
- World Map: 12km × 12km (12000m × 12000m)
- Region uses 64 cells = 1500m × 1500m area
- Nested Map: 64 cells, each = 1500m / 8 = 187.5m × 187.5m
- Child Region uses 64 cells = 187.5m × 187.5m area
- Next Nested Map: 64 cells, each = 187.5m / 8 = 23.4m × 23.4m

### Coordinate Conversion Functions

**Cell to Unreal:**
```typescript
function cellToUnreal(
  cellX: number,  // 0-7
  cellY: number,  // 0-7
  parentRegionSize: number,  // Size in Unreal meters
  config: CoordinateSystemConfig
): UnrealCoordinates {
  const cellSize = parentRegionSize / 8;
  return {
    x: cellX * cellSize,
    y: cellY * cellSize,
  };
}
```

**Unreal to Cell:**
```typescript
function unrealToCell(
  unrealX: number,
  unrealY: number,
  parentRegionSize: number
): CellCoordinates {
  const cellSize = parentRegionSize / 8;
  return {
    cellX: Math.floor(unrealX / cellSize),
    cellY: Math.floor(unrealY / cellSize),
  };
}
```

### Key Points

- **Fixed 64 cells per map level**: Every nested map has exactly 64 cells (8×8)
- **Hierarchical granularity**: Each nesting level increases precision by 8×
- **Unreal units stored**: All coordinates stored as Unreal units in database
- **Direct Unreal export**: No conversion needed for Unreal Engine import
- **Validation**: System ensures all cell coordinates are 0-7 and regions fit within bounds

### Coordinate Calculator Integration

**Calculator shows:**
- Cell coordinates (0-7 range)
- Unreal unit coordinates (meters)
- Cell size in Unreal meters
- Region size in Unreal meters
- Validation status (within bounds, overlaps, etc.)

**Real-time updates:**
- As user enters cell bounds, calculator updates immediately
- Shows all coordinate formats simultaneously
- Validates against parent map bounds

---

## 🎯 Benefits of Data-Centric Approach

### Simplicity
- ✅ No complex canvas tooling
- ✅ Direct data entry via forms
- ✅ Clear hierarchy navigation
- ✅ Easier to understand and maintain

### Reliability
- ✅ Less visual complexity = fewer bugs
- ✅ Form validation ensures data integrity
- ✅ Coordinate calculator prevents errors
- ✅ Data tables show all content clearly

### Scalability
- ✅ Easy to add new fields to forms
- ✅ Data tables handle large datasets
- ✅ Hierarchy navigation scales to deep nesting
- ✅ Export/import works with pure data

### Unreal Integration
- ✅ All coordinate data available for export
- ✅ Proper calculations for 3D space
- ✅ Runtime map generation from data
- ✅ No dependency on visual editor

---

## 🚧 Migration Path

### Existing Data
- ✅ All existing maps, regions, placements remain valid
- ✅ Coordinate data already stored correctly
- ✅ No data migration needed
- ✅ Forms can edit existing data

### Existing Code
- ✅ Keep map editor components (marked as WIP)
- ✅ Reuse coordinate calculation logic
- ✅ Reuse data structures and schemas
- ✅ Reuse API endpoints

### User Experience
- ✅ Existing users can continue with forms
- ✅ Visual editor available but marked as experimental
- ✅ Clear documentation of new approach
- ✅ Gradual transition path

---

## 📚 Documentation Updates

### New Documentation
- **DATA_CENTRIC_MAP_PLAN.md** (this document) - Implementation plan
- **DATA_CENTRIC_USER_GUIDE.md** - User guide for form-based editing
- **COORDINATE_CALCULATOR_GUIDE.md** - How to use coordinate calculator
- **RUNTIME_MAP_GENERATION.md** - How runtime map visualization works

### Updated Documentation
- **ARCHITECTURE.md** - Update with data-centric approach
- **ROADMAP.md** - Mark visual editor as future enhancement
- **MAP_EDITOR_USER_GUIDE.md** - Add note about WIP status

---

## ✅ Success Criteria

### Phase 1 Complete When:
- [ ] All CRUD operations work via forms
- [ ] Coordinate calculator functional
- [ ] Data tables display and edit correctly
- [ ] Hierarchy navigation works
- [ ] Can create/edit maps, regions, placements

### Phase 2 Complete When:
- [ ] Map viewer displays maps with regions
- [ ] Landmarks auto-placed correctly
- [ ] Region overlays render properly
- [ ] Read-only navigation works

### Phase 3 Complete When:
- [ ] Map editor marked as WIP
- [ ] Documentation updated
- [ ] Roadmap documented

### Phase 4 Complete When:
- [ ] Export format updated
- [ ] 3D coordinate support added
- [ ] Validation tools functional

---

## 🎯 Long-Term Vision

### Data-Centric as Primary
- Forms and data tables are the primary editing method
- Coordinate calculator for complex calculations
- Runtime map visualization for preview
- Unreal export for game integration

### Visual Editor as Enhancement
- Future roadmap item for visual aid
- Will build on data-centric foundation
- Will use same coordinate system
- Will enhance, not replace, data-centric approach

---

## 📝 Notes

### Why This Approach?
- **NovelCrafter Inspiration**: Similar form-based, data-centric approach
- **Unreal Focus**: 3D space needs proper calculations, not visual approximations
- **Simplicity**: Less tooling = fewer bugs, easier maintenance
- **Scalability**: Data tables and forms scale better than visual editors

### Key Insight
The visual editor was becoming too complex. By focusing on data first, we get:
- ✅ Same powerful hierarchy and calculations
- ✅ Simpler, more reliable editing
- ✅ Better Unreal integration
- ✅ Runtime map generation from data

The visual editor can come later as an enhancement, building on this solid data-centric foundation.

---

## 🔗 Related Documentation

- **MAP_EDITOR_DATA_RELATIONSHIPS.md** - Core data model (unchanged)
- **ARCHITECTURE.md** - Technical design (to be updated)
- **ROADMAP.md** - Development roadmap (to be updated)
- **COORDINATE_SYSTEM_ARCHITECTURE.md** - Coordinate system (unchanged)
- **UNREAL_ENGINE_MAPPING.md** - Unreal integration (to be updated)

---

**Status:** Planning Phase  
**Branch:** `feature/data-centric-map-regions`  
**Last Updated:** [Current Date]

