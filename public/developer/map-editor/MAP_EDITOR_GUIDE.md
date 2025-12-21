# Map Editor Complete Guide

## Table of Contents

1. [Overview](#overview)
2. [Map Selection](#map-selection)
3. [Selection Modes](#selection-modes)
   - [Placement Mode](#placement-mode-default)
   - [Cell Selection Mode](#cell-selection-mode)
4. [Region System](#region-system)
   - [Base Region](#base-region)
   - [Child Regions](#child-regions)
   - [Creating Regions](#creating-regions)
   - [Region Highlighting System](#region-highlighting-system)
   - [Region Visibility & Toggling](#region-visibility--toggling)
5. [Coordinate System](#coordinate-system)
   - [Core Principle](#core-principle)
   - [Cell Size Calculation](#cell-size-calculation)
   - [Image Stretching](#image-stretching)
6. [UI Controls](#ui-controls)
   - [Toolbar Buttons](#toolbar-buttons)
   - [Display Visibility Dropdown](#display-visibility-dropdown)
   - [Status Bar](#status-bar)
7. [Code Examples](#code-examples)
   - [Creating a Region](#creating-a-region)
   - [Toggling Region Visibility](#toggling-region-visibility)
   - [Getting Cell Size in Meters](#getting-cell-size-in-meters)
   - [Rendering Regions](#rendering-regions)
   - [Switching Selection Modes](#switching-selection-modes)

---

## Overview

The Map Editor is a hierarchical map editing system where:
- **Images are flexible** - They get stretched to fit coordinate config (visual reference only)
- **Unreal units (meters) are source of truth** - Everything calculates to Unreal units
- **Fixed cell count per map level** - Based on image size and baseCellSize
- **Nested maps get more granular** - Each level has smaller Unreal units per cell

## Map Selection

### Selecting a Map

**How it works:**
1. Use the **Map Selector** combobox in the toolbar (top-left)
2. Select a map from the dropdown
3. The map loads and displays all regions on that map (except the base region)
4. The base region is determined by `map.baseRegionId` - the region that owns this map

**Map Structure:**
- Each map has a `baseRegionId` field that references the region that owns it
- When editing a map, the base region is never shown (it represents the entire map)
- All other regions on the map (where `mapId === selectedMap.id`) are shown

**Code:**
```typescript
// Selecting a map
const mapToLoad = maps.find(m => m.id === mapId);
await setSelectedMap(mapToLoad);

// Base region is found via map.baseRegionId
const baseRegion = regions.find(r => r.id === selectedMap.baseRegionId);
```

---

## ⚠️ Placement System TODO

**Note:** The placement system (for landmarks, spawns, props, interactables) is currently marked as TODO. The UX for associating these items with maps and regions needs to be finalized before implementation.

**Planned Features:**
- Landmarks (entry points to nested maps)
- Spawn points (player, NPC, creature spawn)
- Props (trees, rocks, buildings, furniture)
- Interactables (chests, doors, triggers)

**Current Status:** Selection modes are implemented, but placement functionality is pending UX design.

---

## Selection Modes

The map editor has **two selection modes** that serve different purposes:

### Placement Mode (Default)

**Purpose:** Place specific items (props, spawn points, landmarks) at precise positions.

**What happens:**
- Click on map → Places item at clicked position
- Select existing placements → Shows selection handles
- Move placements → Drag to reposition
- Use precision levels → Zone, Cell, Pixel, or Unreal Direct coordinates

**When to use:**
- ✅ Placing props (trees, rocks, buildings, furniture)
- ✅ Setting spawn points (player, NPC, creature spawn)
- ✅ Creating landmarks (entry points to nested maps)
- ✅ Adding interactables (chests, doors, triggers)

**Code:**
```typescript
// lib/store/mapEditorStore.ts
selectionMode: "placement"  // Default mode

// Switch to placement mode
setSelectionMode("placement");
// Clears cell selection (unless region is selected)
// Enables placement tools
```

**Visual Indicators:**
- Status bar: `Mode: Placement` (orange/ember-glow)
- Toolbar: Mouse pointer icon highlighted in orange
- Selected items: Orange highlight

**UI:**
```typescript
// components/environment/EnvironmentEditor.tsx
<button
  onClick={() => setSelectionMode("placement")}
  className={selectionMode === "placement" ? "highlighted" : ""}
>
  <MousePointer />  // Placement icon
</button>
```

---

### Cell Selection Mode

**Purpose:** Select cells to define regions, create nested maps, and set area properties.

**What happens:**
- Click and drag → Selects cell range (automatically creates a square)
- Click single cell → Selects that cell
- Create region → From selected cells (always creates a square region)
- Assign environment → To selected cells/region

**Important:** All regions are squares. When you select cells, the selection is automatically converted to a square by using the larger dimension (width or height) for both dimensions.

**When to use:**
- ✅ Defining regions with different environments
- ✅ Creating nested maps (towns, dungeons, shops)
- ✅ Setting area properties (biome, climate, danger level)
- ✅ Marking areas for procedural generation

**Code:**
```typescript
// lib/store/mapEditorStore.ts
selectionMode: "cell"  // Cell selection mode

// Switch to cell selection mode
setSelectionMode("cell");
// Clears placement selections
// Enables cell selection

// Select cells (always creates a square when dragging)
selectCell(cellX, cellY, addToSelection = false);
selectCellRange(
  { cellX: startX, cellY: startY },
  { cellX: endX, cellY: endY }
);
// Or use selectCellSquare to force square selection
selectCellSquare(
  { cellX: startX, cellY: startY },
  { cellX: endX, cellY: endY }
);
```

**Visual Indicators:**
- Status bar: `Mode: Cell Selection` (blue)
- Toolbar: Square icon highlighted in blue
- Selected cells: **Blue highlight (temporary selection)** - Shows all selected cells as blue rectangles
- Regions: Colored overlays (persistent)

**Note:** When in cell selection mode, selected cells are highlighted in blue. If you don't see the highlighting, ensure:
- You're in cell selection mode (blue square icon active)
- You have cells selected (check status bar for cell count)
- The map image has loaded

**Keyboard Shortcuts:**
- `Ctrl+A` / `Cmd+A` - Select all cells (in cell selection mode)

**UI:**
```typescript
// components/environment/EnvironmentEditor.tsx
<button
  onClick={() => {
    if (selectionMode === "cell") {
      setSelectionMode("placement");
      clearCellSelection();
    } else {
      setSelectionMode("cell");
    }
  }}
  className={selectionMode === "cell" ? "highlighted" : ""}
>
  <Square />  // Cell selection icon
</button>
```

### Mode Differences Summary

| Feature | Placement Mode | Cell Selection Mode |
|---------|---------------|-------------------|
| **Purpose** | Place items | Define regions |
| **Click action** | Place item | Select cell |
| **Drag action** | Move item | Select cell range |
| **Selection** | Placements (items) | Cells (areas) |
| **Visual** | Orange highlight | Blue highlight |
| **Status bar** | "Placement" (orange) | "Cell Selection" (blue) |
| **Toolbar icon** | Mouse pointer | Square |

---

## Region System

### What is a Region?

A **region** is a **square selection of cells** that defines an area with specific properties:
- **Always a square** - Regions are stored as `minX`, `minY`, `width`, `height` (not individual cell points)
- Environment template (biome, climate, danger level)
- Optional nested map (for more detailed editing)
- Visual color for identification
- Can have child regions (nested regions)

**Storage Format:**
- Regions are stored as squares: `{ minX, minY, width, height }`
- This is more efficient than storing individual cell coordinates
- When selecting cells, the selection is automatically converted to a square (using the larger dimension)

### Region Visibility

**Key Rules:**
1. **Base region is NEVER shown** - Always hidden, represents entire map
2. **Child regions visible by default** - Shown when `showRegions` is true
3. **Can be toggled** - Use Display Visibility Dropdown to show/hide
4. **Selected regions always visible** - Selected regions remain visible even when toggled off

**Toggle Location:**
- Toolbar → Info button (ℹ️) → Display Visibility Dropdown
- Checkbox: "Show Regions"

### Base Region

**The base region is the region that owns the currently selected map.**

**Key Points:**
- **Never visible** - Base region is always hidden (never highlighted)
- **Covers entire map** - Represents the full area being edited
- **Referenced by map** - The map's `baseRegionId` field points to this region
- **When editing a map** - The region with `id === map.baseRegionId` becomes the base region

**Example Flow:**
```
1. World Map
   └─ Region: "tet" (11×11 cells)

2. Create nested map for "tet"
   └─ Map: "tet-map" (nested from "tet" region)

3. Load "tet-map"
   └─ "tet" becomes base region (hidden, covers entire map)
   └─ Create new regions on "tet-map":
      ├─ Region: "shop" (visible, can toggle)
      ├─ Region: "home" (visible, can toggle)
      └─ Region: "dungeon" (visible, can toggle)
```

**Code:**
```typescript
// components/environment/CellSelectionLayer.tsx
// Find the base region - the region referenced by the map's baseRegionId
const baseRegion = useMemo(() => {
  if (!selectedMap || !selectedMap.baseRegionId) return null;
  // Find the region with id matching the map's baseRegionId
  // This is the region that "owns" this map - when we load this map, this region becomes the base
  return regions.find(r => r.id === selectedMap.baseRegionId) || null;
}, [regions, selectedMap]);

// Check if a region is the base region
const isBaseRegion = (region: typeof regions[0]): boolean => {
  return baseRegion?.id === region.id;
};

// NEVER render base region
if (isBaseRegion(region)) {
  return; // Always skip - never render
}
```

### Creating Regions

**How to create a new region:**

1. **Select a map** - Use the map selector combobox to choose which map to edit
2. **Switch to cell selection mode** - Click the square icon in the toolbar (or use the plus icon which auto-switches)
3. **Select cells** - Click and drag on the map to select cells (selection is automatically converted to a square)
4. **Create region** - Click "Create Region from Selection" button that appears
5. **Name and configure** - Enter region name and optional environment properties

**Important:** The selection will automatically be converted to a square (using the larger dimension for both width and height). This ensures all regions are squares, which is more efficient for storage and rendering.

**UI:**
- **Plus icon (➕)** in toolbar - Switches to cell selection mode if a map is selected
- **Create Region from Selection** button - Appears when cells are selected
- **Create World Region** modal - Opens if no map is selected (creates environment + map + region)

**Code:**
```typescript
// User selects cells, then clicks "Create Region from Selection"
// Selection is automatically converted to a square
const bounds = selectedCellBounds; // { minX, minY, maxX, maxY }
const width = bounds.maxX - bounds.minX + 1;
const height = bounds.maxY - bounds.minY + 1;
const size = Math.max(width, height); // Make it square

const regionId = `region-${Date.now()}`;
await addRegion({
  id: regionId,
  mapId: selectedMap.id,
  name: "My Region",
  minX: bounds.minX,
  minY: bounds.minY,
  width: size,
  height: size,
  cells: selectedCells,
  color: generateRegionColor(regionId),
  metadata: { /* environment properties */ },
});
```

---

### Child Regions

**Child regions are visible regions created on top of the base region.**

**When Loading a Nested Map:**
- Parent region becomes base region (hidden)
- Only child regions are shown (can be toggled)
- Example: Load "tet-map" → "tet" becomes base (hidden), "shop"/"home" are children (visible)

**Visibility Rules:**
1. **Base region is NEVER shown** - Always hidden, represents entire map
2. **Child regions visible by default** - Shown when `showRegions` is true
3. **Can be toggled** - Use `toggleRegions()` to show/hide all child regions
4. **Selected regions always visible** - Selected regions remain visible even when toggled off

**Code:**
```typescript
// lib/store/mapEditorStore.ts
visibleRegionIds: Set<string>;  // Set of region IDs that are visible
toggleRegionVisibility: (regionId: string) => void;  // Toggle individual region
setRegionVisibility: (regionId: string, visible: boolean) => void;  // Set visibility

// Toggle a specific region's visibility
toggleRegionVisibility(regionId);

// Set visibility explicitly
setRegionVisibility(regionId, true);  // Show
setRegionVisibility(regionId, false); // Hide

// Check visibility state
const { visibleRegionIds } = useMapEditorStore();
const isVisible = visibleRegionIds.has(regionId);
```

**UI Control:**
- **Location:** Region list in CellSelectionFeedback component
- **Checkboxes:** Each region has its own checkbox
- **Behavior:** 
  - ✅ Checked: Region is visible on map
  - ❌ Unchecked: Region is hidden
  - Per-region control - toggle each region independently

**Implementation:**
```typescript
// components/environment/CellSelectionLayer.tsx
const regionRects = useMemo(() => {
  if (!selectedMap || !baseRegion) return [];
  
  // Only show regions that are children of the base region
  return regions
    .filter((r) => {
      // Must be on the current map
      if (r.mapId !== selectedMap.id) return false;
      
      // NEVER render base region
      if (isBaseRegion(r)) return false;
      
      // Only show children of the base region
      if (r.parentRegionId !== baseRegion.id) return false;
      
      // Only render if visible (checked in visibility controls)
      if (!visibleRegionIds.has(r.id)) return false;
      
      return true;
    })
    .flatMap((region) => {
      // Render region cells with color and opacity...
    });
}, [regions, selectedMap, selectedRegionId, visibleRegionIds, baseRegion]);
```

---

## Region Highlighting System

### Overview

Regions are highlighted using a **color overlay system** where each region gets a unique color that's rendered as semi-transparent rectangles over the map cells.

### How It Works

1. **Color Generation** - Each region gets a unique HSL color from its ID hash
2. **Opacity Calculation** - Different opacity for selected vs normal regions
3. **Boundary Highlighting** - Boundary cells get brighter strokes for clarity
4. **Rendering** - Colors converted to RGBA and rendered as rectangles on each cell

### Visual States

| State | Fill Opacity | Stroke Opacity | Stroke Width |
|-------|-------------|---------------|--------------|
| **Selected region** | 50% | 100% (boundary), 70% (interior) | 2px (boundary), 1px (interior) |
| **Normal region** | 30% | 100% (boundary), 70% (interior) | 2px (boundary), 1px (interior) |
| **Base region** | Never shown | Never shown | N/A |

### Color Usage

Each region's color is used for:
- **Fill** - Semi-transparent overlay on region cells (30-50% opacity)
- **Stroke** - Border around region cells (70-100% opacity, thicker on boundaries)

### Color Generation

Each region gets a **unique color** generated from its ID using a hash function:

```typescript
// lib/data/mapRegions.ts
export function generateRegionColor(regionId: string): string {
  // Generate a consistent color from the ID
  let hash = 0;
  for (let i = 0; i < regionId.length; i++) {
    hash = regionId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate hue (0-360) from hash
  const hue = Math.abs(hash % 360);
  
  // Use high saturation and medium lightness for visibility
  return `hsl(${hue}, 70%, 50%)`;
}
```

**How it works:**
1. **Hash the region ID** - Creates a consistent number from the ID
2. **Generate hue** - Maps hash to 0-360 (HSL hue range)
3. **Fixed saturation/lightness** - Always 70% saturation, 50% lightness for visibility

**Example Colors:**
- Region ID: `"region-1765380377118"` → `hsl(245, 70%, 50%)` (blue-purple)
- Region ID: `"shop-region"` → `hsl(120, 70%, 50%)` (green)
- Region ID: `"dungeon-region"` → `hsl(0, 70%, 50%)` (red)

**Why HSL?**
- Easy to adjust opacity for different states
- Consistent colors for same region ID
- Good color distribution across hue spectrum

### Color Rendering

Regions are rendered with different opacity based on state. Colors are converted from HSL to RGBA for rendering:

```typescript
// lib/data/mapRegions.ts
export function hslToRgba(hsl: string, alpha: number = 1): string {
  // Parse HSL string like "hsl(120, 70%, 50%)"
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  // Convert HSL to RGB, then to RGBA with opacity
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// components/environment/CellSelectionLayer.tsx
const opacity = isSelected ? 0.5 : 0.3;  // Selected: 50%, Normal: 30%
const strokeOpacity = isBoundary ? 1.0 : 0.7;  // Boundary: 100%, Interior: 70%

// Convert HSL to RGBA for rendering
const fill = hslToRgba(region.color, opacity);
const stroke = hslToRgba(region.color, strokeOpacity);
```

**Visual States:**
- **Selected region:** 
  - Fill: 50% opacity (more visible)
  - Stroke: 100% opacity on boundaries, 70% on interior
- **Normal region:** 
  - Fill: 30% opacity (subtle)
  - Stroke: 100% opacity on boundaries, 70% on interior
- **Boundary cells:** Always 100% opacity stroke (highlighted edges for clarity)
- **Interior cells:** 70% opacity stroke (less prominent)

**Rendering Code:**
```typescript
// components/environment/CellSelectionLayer.tsx
regionRects.map((rect, index) => (
  <Rect
    key={`region-${rect.regionId}-${index}`}
    x={rect.x}
    y={rect.y}
    width={rect.width}
    height={rect.height}
    fill={rect.fill}           // RGBA with opacity (30% or 50%)
    stroke={rect.stroke}       // RGBA with opacity (70% or 100%)
    strokeWidth={rect.isBoundary ? 2 : 1}  // Thicker stroke on boundaries
    listening={false}          // Not interactive (handled by canvas click)
  />
))
```

### Toggling Region Display

**How to toggle regions on/off:**

1. **UI Method:**
   - Click Info button (ℹ️) in toolbar
   - Check/uncheck "Show Regions" in dropdown

2. **Code Method:**
   ```typescript
   const { showRegions, toggleRegions } = useMapEditorStore();
   
   // Toggle
   toggleRegions();
   
   // Check state
   if (showRegions) {
     // Regions are visible
   }
   ```

3. **What gets hidden:**
   - ✅ All non-selected child regions
   - ❌ Selected regions (always visible)
   - ❌ Base region (never shown anyway)

**Complete Implementation:**
```typescript
// components/environment/CellSelectionLayer.tsx
const regionRects = useMemo(() => {
  // Step 1: Don't render if visibility is off
  if (!showRegions) return [];
  
  return regions
    // Step 2: Filter to current map
    .filter((r) => r.mapId === selectedMap.id)
    // Step 3: NEVER show base region
    .filter((r) => !isBaseRegion(r))
    // Step 4: Show if selected OR if showRegions is true
    .filter((r) => r.id === selectedRegionId || showRegions)
    // Step 5: Render each region's cells
    .flatMap((region) => {
      const isSelected = region.id === selectedRegionId;
      
      return region.cells
        .filter((cell) => {
          // Filter out cells beyond image bounds
          return cell.cellX < actualMaxCellsX && cell.cellY < actualMaxCellsY;
        })
        .map((cell) => {
          const pixel = cellToPixel(cell, config);
          const isBoundary = isCellOnBoundary(cell, region);
          
          // Calculate opacity based on state
          const opacity = isSelected ? 0.5 : 0.3;
          const strokeOpacity = isBoundary ? 1.0 : 0.7;
          
          return {
            x: pixel.x,
            y: pixel.y,
            width: cellSize,
            height: cellSize,
            fill: hslToRgba(region.color, opacity),
            stroke: hslToRgba(region.color, strokeOpacity),
            regionId: region.id,
            isSelected,
            isBoundary,
          };
        });
    });
}, [regions, selectedMap, selectedRegionId, showRegions, config, cellSize]);
```

---

## Coordinate System

### Core Principle

**Unreal units (meters) are the source of truth.** Images are just visual reference.

### Cell Size Calculation

```typescript
// lib/utils/cellSizeCalculator.ts
export function getCellSizeInUnrealMeters(config: CoordinateSystemConfig): {
  width: number;  // meters
  height: number; // meters
} {
  const unrealUnitsPerPixelX = config.unrealWidth / config.imageWidth;
  const unrealUnitsPerPixelY = config.unrealHeight / config.imageHeight;
  
  return {
    width: config.baseCellSize * unrealUnitsPerPixelX,
    height: config.baseCellSize * unrealUnitsPerPixelY,
  };
}
```

**Example (World Map):**
```typescript
const config = {
  imageWidth: 4096,      // Any size - gets stretched
  imageHeight: 4096,     // Any size - gets stretched
  unrealWidth: 12000,    // 12km - SOURCE OF TRUTH
  unrealHeight: 12000,   // 12km - SOURCE OF TRUTH
  baseCellSize: 16,      // 16 pixels per cell
};

const cellSize = getCellSizeInUnrealMeters(config);
// Returns: { width: 46.875m, height: 46.875m }
```

### Image Stretching

Images are **always stretched** to fit the coordinate configuration:

```typescript
// components/environment/MapCanvas.tsx
<KonvaImage
  image={mapImage}
  x={0}
  y={0}
  width={selectedMap.coordinateConfig.imageWidth}   // Stretched to config
  height={selectedMap.coordinateConfig.imageHeight}  // Stretched to config
/>
```

**Why?**
- Images are just visual reference
- Cell selection is based on `baseCellSize`, not image dimensions
- Unreal units are the source of truth

---

## UI Controls

### Toolbar Buttons

**Cell Selection Mode Toggle:**
```typescript
// components/environment/EnvironmentEditor.tsx
<button
  onClick={() => {
    if (selectionMode === "cell") {
      setSelectionMode("placement");
      clearCellSelection();
    } else {
      setSelectionMode("cell");
    }
  }}
>
  <Square />  // Cell selection icon
</button>
```

**Placement Mode Toggle:**
```typescript
<button onClick={() => setSelectionMode("placement")}>
  <MousePointer />  // Placement icon
</button>
```

**Grid Toggle:**
```typescript
<button onClick={toggleGrid}>
  <Grid />  // Grid icon
</button>
// Keyboard: G key
```

**Snap to Grid Toggle:**
```typescript
<button onClick={toggleSnap}>
  <MousePointer />  // Snap icon
</button>
// Keyboard: S key
// Only visible when grid is on
```

### Display Visibility Dropdown

**Show Regions Toggle:**
```typescript
// components/environment/EnvironmentEditor.tsx
<label className="flex items-center gap-2">
  <input
    type="checkbox"
    checked={showRegions}
    onChange={toggleRegions}
  />
  Show Regions
</label>
```

**What it controls:**
- Shows/hides all child regions (non-selected)
- Selected regions always remain visible
- Base region is never shown (always hidden)

### Status Bar

Shows current state:
- **Position:** Pixel, Unreal, and Cell coordinates
- **Mode:** Placement (orange) or Cell Selection (blue)
- **Zoom:** Current zoom percentage
- **Selection count:** Placements or cells selected
- **Grid status:** ON/OFF, size
- **Snap status:** ON/OFF (when grid is on)

---

## Code Examples

### Creating a Region

```typescript
// components/environment/CellSelectionFeedback.tsx
const handleCreateRegion = async () => {
  const regionId = `region-${Date.now()}`;
  await addRegion({
    id: regionId,
    mapId: selectedMap.id,
    name: "My Region",
    minX: bounds.minX,
    minY: bounds.minY,
    width: size,  // Square region
    height: size,  // Square region
    color: generateRegionColor(regionId),  // Unique color
    environmentId: "world_environment",  // Optional
    metadata: {
      biome: "Forest",
      climate: "Temperate",
      dangerLevel: 2,
    },
  });
  clearCellSelection();
};
```

### Toggling Region Visibility

```typescript
// lib/store/mapEditorStore.ts
toggleRegions: () => {
  set((state) => ({ showRegions: !state.showRegions }));
}

// Usage in component
const { showRegions, toggleRegions } = useMapEditorStore();

<button onClick={toggleRegions}>
  {showRegions ? "Hide Regions" : "Show Regions"}
</button>
```

### Getting Cell Size in Meters

```typescript
import { getCellSizeInUnrealMeters, formatCellSizeInMeters } from "@/lib/utils/cellSizeCalculator";

const config = selectedMap.coordinateConfig;
const cellSize = getCellSizeInUnrealMeters(config);
console.log(`Cell size: ${cellSize.width}m × ${cellSize.height}m`);

const formatted = formatCellSizeInMeters(config);
console.log(formatted);  // "47m" or "2.5m" or "50cm"
```

### Rendering Regions

```typescript
// components/environment/CellSelectionLayer.tsx
const regionRects = useMemo(() => {
  if (!showRegions) return [];  // Hide all if toggled off
  
  return regions
    .filter((r) => r.mapId === selectedMap.id)
    .filter((r) => !isBaseRegion(r))  // Never show base region
    .filter((r) => r.id === selectedRegionId || showRegions)  // Show selected or if toggle on
    .map((region) => {
      // Render region cells...
    });
}, [regions, selectedMap, selectedRegionId, showRegions]);
```

### Switching Selection Modes

```typescript
// Switch to cell selection mode
setSelectionMode("cell");
// Clears placement selections
// Enables cell selection

// Switch to placement mode
setSelectionMode("placement");
// Clears cell selection (unless region is selected)
// Enables placement tools
```

---

## Best Practices

1. **Base region is always hidden** - Never render it, it represents the entire map
2. **Use toggle for child regions** - Allow users to hide/show regions for clarity
3. **Selected regions always visible** - Keep selected region visible even when toggled off
4. **Unreal units are source of truth** - Always calculate from Unreal units, not pixels
5. **Images are visual only** - Don't worry about exact image dimensions, they get stretched
6. **Consistent colors** - Same region ID always generates same color

---

## Related Documentation

- [COORDINATE_SYSTEM_ARCHITECTURE.md](./technical/COORDINATE_SYSTEM_ARCHITECTURE.md) - Detailed coordinate system architecture
- [GRID_SYSTEM.md](./technical/GRID_SYSTEM.md) - Grid system and cell coordinates
- [MAP_SIZING_STANDARDS.md](./technical/MAP_SIZING_STANDARDS.md) - Standard map sizes and configurations


