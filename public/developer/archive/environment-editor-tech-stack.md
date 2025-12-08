# Environment Editor - Technology Stack & Component Architecture

## 🎯 The 20% That Gives 80% Value

**Core Features (MVP):**
1. ✅ Grid-based canvas with zoom/pan
2. ✅ Click to place items (props, spawn points)
3. ✅ Coordinate system (pixel ↔ Unreal conversion)
4. ✅ Multi-cell selection
5. ✅ Save placements to database
6. ✅ Export to JSON for Unreal

**Can Add Later:**
- Templates
- Advanced prop editor
- Real-time collaboration
- 3D preview

---

## 📦 Recommended Technology Stack

### Core Libraries

#### 1. **react-konva** (Canvas Rendering)
**Why:** 
- React wrapper for Konva.js (2D canvas library)
- Excellent performance for large maps
- Built-in zoom/pan support
- Easy to draw grids, images, shapes
- Handles mouse events well
- Lightweight (~200KB)

**Install:**
```bash
npm install react-konva konva
```

**Use For:**
- Drawing map background image
- Drawing grid lines
- Rendering placed items
- Handling mouse clicks for placement

**Alternative Considered:** 
- Fabric.js - More features but heavier
- Plain Canvas API - More work, less features

---

#### 2. **zustand** (State Management) ✅ Already Installed
**Why:**
- Already in project
- Lightweight
- Perfect for map editor state (zoom, pan, selected items, placements)

**Use For:**
- Map editor state (zoom level, pan position, selected precision)
- Placements data (all placed items)
- Selected items
- Coordinate system settings

---

#### 3. **@dnd-kit/core** (Optional - For Future Drag/Drop)
**Why:**
- Modern, performant drag-and-drop
- Works well with React
- Good for prop library drag-to-place (future feature)

**Install (if needed later):**
```bash
npm install @dnd-kit/core @dnd-kit/utilities
```

**Use For (Future):**
- Dragging props from library to map
- Reordering items in lists

**Note:** For MVP, we can skip this - clicking to place is simpler.

---

#### 4. **framer-motion** ✅ Already Installed
**Why:**
- Already in project
- Smooth animations for UI transitions
- Good for modal animations, panel slides

**Use For:**
- Smooth panel transitions
- Modal animations
- Loading states

---

### Coordinate System (Custom Implementation)

**No library needed** - Simple math:
```typescript
// Pixel to Unreal conversion
function pixelToUnreal(
  pixelX: number,
  pixelY: number,
  imageWidth: number,
  imageHeight: number,
  unrealWidth: number,
  unrealHeight: number
): { x: number, y: number } {
  const scaleX = unrealWidth / imageWidth;
  const scaleY = unrealHeight / imageHeight;
  return {
    x: pixelX * scaleX,
    y: pixelY * scaleY
  };
}
```

---

## 🏗️ Component Architecture

### Main Layout Structure

```
EnvironmentEditor (Main Container)
├── EnvironmentList (Left Sidebar)
│   ├── EnvironmentItem[]
│   └── CreateEnvironmentButton
│
├── MapEditor (Center - Main Canvas)
│   ├── MapCanvas (react-konva Stage)
│   │   ├── MapBackground (Image layer)
│   │   ├── GridLayer (Grid lines)
│   │   ├── PlacementLayer (Placed items)
│   │   └── SelectionLayer (Selected cells)
│   │
│   ├── MapToolbar (Top)
│   │   ├── ZoomControls
│   │   ├── PrecisionSelector
│   │   ├── PlacementModeSelector
│   │   └── GridToggle
│   │
│   └── CoordinateDisplay (Bottom)
│       └── CurrentCoordinateInfo
│
└── PropertiesPanel (Right Sidebar)
    ├── PropLibrary (Browse props)
    ├── SelectedItemProperties (Edit selected)
    └── PlacementList (All placements)
```

---

## 📝 Component Breakdown

### 1. EnvironmentEditor (Main Container)
**File:** `components/environment/EnvironmentEditor.tsx`

**Responsibilities:**
- Manage environment/map selection
- Coordinate between child components
- Handle save/load operations

**State:**
- Selected environment
- Selected map
- Editor mode (view/edit)

---

### 2. MapCanvas (Core Canvas Component)
**File:** `components/environment/MapCanvas.tsx`

**Tech:** react-konva

**Features:**
- Zoom/pan (mouse wheel, drag)
- Grid rendering (adjusts with zoom)
- Image background
- Click to place items
- Multi-cell selection (click and drag)
- Coordinate calculation

**Key Props:**
```typescript
interface MapCanvasProps {
  map: MapDefinition;
  placements: MapPlacement[];
  onPlacementAdd: (placement: MapPlacement) => void;
  onPlacementSelect: (placementId: string) => void;
  precisionLevel: PrecisionLevel;
  selectedItem?: PropDefinition;
}
```

**State (Zustand Store):**
```typescript
interface MapEditorStore {
  zoom: number;
  panX: number;
  panY: number;
  selectedCells: Cell[];
  precisionLevel: PrecisionLevel;
  showGrid: boolean;
  // Actions
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  selectCells: (cells: Cell[]) => void;
}
```

---

### 3. GridLayer (Grid Rendering)
**File:** `components/environment/GridLayer.tsx`

**Tech:** react-konva Line components

**Features:**
- Draws grid lines based on zoom level
- Adjusts cell size with zoom
- Shows different grid densities at different zoom levels

**Logic:**
```typescript
// Calculate cell size based on zoom
const cellSize = baseCellSize / zoom;

// Draw grid lines
for (let x = 0; x < mapWidth; x += cellSize) {
  // Draw vertical line
}
for (let y = 0; y < mapHeight; y += cellSize) {
  // Draw horizontal line
}
```

---

### 4. PlacementLayer (Rendered Items)
**File:** `components/environment/PlacementLayer.tsx`

**Tech:** react-konva Group/Image components

**Features:**
- Renders all placed items
- Shows item icons/images at correct positions
- Highlights selected items
- Shows precision level indicators

---

### 5. CoordinateSystem (Utility)
**File:** `lib/utils/coordinateSystem.ts`

**Functions:**
- `pixelToUnreal()` - Convert pixel to Unreal units
- `unrealToPixel()` - Convert Unreal to pixels
- `getCellFromPixel()` - Get cell coordinates from pixel
- `getPixelFromCell()` - Get pixel from cell coordinates
- `calculatePrecision()` - Determine precision level from zoom

---

### 6. PrecisionSelector (UI Component)
**File:** `components/environment/PrecisionSelector.tsx`

**Features:**
- Dropdown/buttons to select precision level
- Shows current precision
- Shows Unreal unit size for current precision
- Warns if precision is too low for selected item

---

### 7. PropLibrary (Browse Props)
**File:** `components/environment/PropLibrary.tsx`

**Features:**
- List/grid of available props
- Filter by type/tags
- Click to select prop for placement
- Shows prop preview/image
- Shows recommended precision

---

## 🗄️ Database Schema

### Tables Needed:

```typescript
// environments table (already planned)
environments {
  id, name, description, imagePath, storyIds, mapIds, ...
}

// maps table
maps {
  id, environmentId, name, description, imagePath,
  unrealMapSize: { width, height }, // JSON
  imageDimensions: { width, height }, // JSON
  ...
}

// map_placements table
map_placements {
  id, mapId, type, itemId, 
  coordinates: JSON, // Varies by precision level
  precisionLevel, metadata: JSON,
  createdAt, updatedAt
}

// props table (reference data - can add later)
props {
  id, name, description, type, imagePath,
  recommendedPrecision, sizeInUnrealUnits: JSON,
  tags: JSON, ...
}
```

---

## 🚀 Implementation Phases

### Phase 1: MVP (The 20%)
**Goal:** Basic map editor with placement

1. **Setup:**
   - Install react-konva
   - Create Zustand store for map editor
   - Create database schema

2. **Core Components:**
   - MapCanvas with zoom/pan
   - GridLayer (basic grid)
   - CoordinateSystem utilities
   - Click to place items

3. **UI:**
   - Precision selector
   - Coordinate display
   - Basic prop library (hardcoded list for now)

4. **Data:**
   - Save placements to database
   - Load placements on map open
   - Export to JSON

**Time Estimate:** 2-3 days

---

### Phase 2: Polish
**Goal:** Better UX and features

1. Multi-cell selection
2. Precision warnings
3. Placement editing (move, delete)
4. Better grid visualization
5. Map size configuration UI

**Time Estimate:** 1-2 days

---

### Phase 3: Advanced (Future)
**Goal:** Full feature set

1. Templates
2. Prop editor
3. Scene editor
4. Environmental modifiers
5. Import/export

---

## 💡 Key Considerations

### Performance
- **react-konva** is performant out of the box
- **Viewport Culling (Not Needed for MVP):**
  - **What it is:** Only rendering items visible in the current viewport
  - **When needed:** If you have thousands of placed items on a huge map
  - **Why skip for MVP:** 
    - Most maps will have 10-100 items, not thousands
    - react-konva handles moderate amounts of items well
    - Premature optimization - add only if performance becomes an issue
  - **Example:** If zoomed into a small area, don't render items outside that area
  - **For now:** Render all items - react-konva is fast enough
- **Optimizations we WILL use:**
  - Use `React.memo` for placement components (simple, prevents re-renders)
  - Debounce zoom/pan updates (smooth UX)

### Coordinate Precision
- **Always show warnings** when precision is too low
- **Default to safe precision** (cell-level for most items)
- **Allow override** to Unreal Direct for critical placements

### Data-Driven
- **All placements are data** - no hardcoded positions
- **Export format** should be Unreal-friendly JSON
- **Coordinate system** is configurable per map

### User Experience
- **Visual feedback** - show what will be placed before confirming
- **Undo/redo** - essential for map editing (can use Zustand history)
- **Keyboard shortcuts** - zoom (+, -), pan (arrow keys), delete (Del)

---

## 📦 Installation Commands

```bash
# Core canvas library
npm install react-konva konva

# Optional: Drag and drop (for future)
npm install @dnd-kit/core @dnd-kit/utilities

# TypeScript types (if needed)
npm install --save-dev @types/konva
```

---

## 🎨 Example Component Structure

```typescript
// components/environment/MapCanvas.tsx
import { Stage, Layer, Image, Line, Group } from 'react-konva';
import { useMapEditorStore } from '@/lib/store/mapEditorStore';
import { GridLayer } from './GridLayer';
import { PlacementLayer } from './PlacementLayer';

export function MapCanvas({ map, placements, onPlacementAdd }: MapCanvasProps) {
  const { zoom, panX, panY, precisionLevel } = useMapEditorStore();
  
  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      onWheel={handleZoom}
      onDragEnd={handlePan}
    >
      <Layer>
        {/* Background Image */}
        <Image image={mapImage} />
        
        {/* Grid */}
        <GridLayer 
          map={map} 
          zoom={zoom} 
          precisionLevel={precisionLevel} 
        />
        
        {/* Placements */}
        <PlacementLayer 
          placements={placements}
          zoom={zoom}
        />
      </Layer>
    </Stage>
  );
}
```

---

## ✅ Why This Stack?

1. **react-konva** - Industry standard for React canvas, well-documented, performant
2. **Zustand** - Already in project, lightweight, perfect for editor state
3. **Custom coordinate system** - Simple math, full control
4. **Minimal dependencies** - Only add what we need
5. **Data-driven** - Everything saved to database, exportable

---

## 🚫 What We're NOT Using (For Now)

- ❌ Three.js - Overkill for 2D map editor
- ❌ Fabric.js - Heavier than Konva, less React-friendly
- ❌ react-grid-layout - Not suitable for game map editing
- ❌ Redux - Zustand is simpler and already in project
- ❌ Complex drag-and-drop - Click to place is simpler for MVP

---

## 📊 Success Metrics

**MVP is successful if:**
- ✅ Can load map image
- ✅ Can zoom/pan around map
- ✅ Can see grid at different zoom levels
- ✅ Can click to place items
- ✅ Can see coordinates (pixel + Unreal)
- ✅ Can save placements to database
- ✅ Can export to JSON for Unreal

**That's the 20% that gives 80% value!**

