# Environment Editor - Incremental Build Plan

## 🎯 Philosophy

**Professional Tooling Application Standards:**
- ✅ **Photoshop/Blender/Unity/Unreal Level UX** - Professional, reliable, precise
- ✅ **Working State After Each Task** - Never break existing functionality
- ✅ **Incremental Development** - Small, testable steps
- ✅ **Three.js Ready** - Design for future 3D integration
- ✅ **Maintainable Architecture** - Clean, modular, extensible
- ✅ **Performance First** - Smooth interactions, no lag, efficient rendering
- ✅ **Professional Features** - Keyboard shortcuts, undo/redo, precise controls, status bar

**Design Principles:**
- **Precision** - Every action is precise and predictable
- **Feedback** - Clear visual feedback for all actions
- **Efficiency** - Keyboard shortcuts, multi-select, batch operations
- **Reliability** - Auto-save, validation, error handling
- **Professional UI** - Clean, minimal, tool-focused interface

---

## 🏗️ Build Order (Incremental & Working States)

### **Phase 0: Foundation** ✅ DONE
- [x] Enums (`lib/core/mapEnums.ts`)
- [x] Coordinate system utils (`lib/utils/coordinateSystem.ts`)
- [x] Type definitions (in plan)

**Smoke Test:** Coordinate math functions work correctly

---

### **Phase 1: Data Layer** (Working State: Database Ready)
**Goal:** Data persistence works, can CRUD environments/maps/placements

#### 1.1 Database Schema
- [ ] `lib/data/environments.schema.ts` - Drizzle schema
- [ ] `lib/data/maps.schema.ts` - Drizzle schema  
- [ ] `lib/data/mapPlacements.schema.ts` - Drizzle schema
- [ ] Update `lib/data/spells.db.ts` to include new tables

**Smoke Test:** Tables created, can insert/query basic data

#### 1.2 Repositories
- [ ] `lib/data/environmentsRepository.ts` - CRUD operations
- [ ] `lib/data/mapsRepository.ts` - CRUD operations
- [ ] `lib/data/mapPlacementsRepository.ts` - CRUD operations

**Smoke Test:** Can create environment, create map, create placement, read them back

#### 1.3 API Routes
- [ ] `app/api/game-data/environments/route.ts` - GET, POST, PUT, DELETE
- [ ] `app/api/game-data/maps/route.ts` - GET, POST, PUT, DELETE
- [ ] `app/api/game-data/map-placements/route.ts` - GET, POST, PUT, DELETE
- [ ] Update `app/api/game-data/ids/route.ts` to include environments/maps

**Smoke Test:** API endpoints return correct data, can create/read/update/delete

#### 1.4 API Clients
- [ ] Update `lib/api/clients.ts` with:
  - [ ] `environmentClient` (list, get, create, update, delete)
  - [ ] `mapClient` (list, get, create, update, delete)
  - [ ] `mapPlacementClient` (list, get, create, update, delete)
  - [ ] Update `idClient` to include environments/maps

**Smoke Test:** Clients can fetch and create data

**✅ Working State:** Full data layer complete, can persist environments/maps/placements

---

### **Phase 2: Core Map Canvas** (Working State: Professional Visual Map Editor)
**Goal:** Professional-grade map editor with smooth interactions, keyboard shortcuts, precise controls

#### 2.1 Install Dependencies
- [ ] Install `react-konva` and `konva`
- [ ] Install `@types/konva` (dev)

#### 2.2 Zustand Store (Professional State Management)
- [ ] `lib/store/mapEditorStore.ts`
  - [ ] State: zoom, panX, panY, selectedMap, showGrid, snapToGrid
  - [ ] State: selectedPlacements (multi-select), clipboard, history (undo/redo)
  - [ ] Actions: setZoom, setPan, setSelectedMap, toggleGrid, toggleSnap
  - [ ] Actions: selectPlacement, multiSelect, copy, paste, delete
  - [ ] Actions: undo, redo, clearHistory
  - [ ] History management (undo/redo stack)

**Smoke Test:** Store updates correctly, history works, state persists

#### 2.3 Professional Map Canvas
- [ ] `components/environment/MapCanvas.tsx`
  - [ ] react-konva Stage setup with smooth rendering
  - [ ] Load and display map image (optimized loading)
  - [ ] **Smooth zoom** (mouse wheel with zoom limits, zoom to cursor)
  - [ ] **Smooth pan** (drag with momentum, bounds checking)
  - [ ] **Keyboard shortcuts** (Space+drag = pan, +/- = zoom, G = toggle grid)
  - [ ] **Coordinate snapping** (snap to grid when enabled)
  - [ ] **Viewport bounds** (prevent panning outside map)

**Smoke Test:** Can load map image, smooth zoom/pan, keyboard shortcuts work, snapping works

#### 2.4 Professional Grid Layer
- [ ] `components/environment/GridLayer.tsx`
  - [ ] Draw grid lines (optimized rendering)
  - [ ] Adjust grid size with zoom (smooth transitions)
  - [ ] Show/hide grid toggle (G key)
  - [ ] **Grid snapping** (visual feedback when snapping)
  - [ ] **Sub-grid** (show finer grid at high zoom)
  - [ ] **Grid color/opacity** (professional appearance)

**Smoke Test:** Grid renders smoothly, adjusts with zoom, snapping works, looks professional

#### 2.5 Status Bar (Professional Tooling Feature)
- [ ] `components/environment/StatusBar.tsx`
  - [ ] Show current coordinates (pixel + Unreal)
  - [ ] Show zoom level
  - [ ] Show selected items count
  - [ ] Show precision level
  - [ ] Show map size info
  - [ ] Professional styling (bottom of canvas)

**Smoke Test:** Status bar shows correct info, updates on interaction

**✅ Working State:** Professional visual map editor with smooth interactions, keyboard shortcuts, status bar

---

### **Phase 3: Coordinate System Integration** (Working State: Precise Coordinate System)
**Goal:** Professional coordinate system with precise input, validation, and feedback

#### 3.1 Professional Coordinate Display
- [ ] `components/environment/CoordinateDisplay.tsx` (in StatusBar)
  - [ ] Show pixel coordinates on hover (real-time)
  - [ ] Show Unreal coordinates (real-time)
  - [ ] Show cell coordinates (real-time)
  - [ ] **Precise coordinate input** (click to edit coordinates directly)
  - [ ] **Coordinate validation** (prevent invalid values)
  - [ ] Use coordinate system utils

**Smoke Test:** Hover shows correct coordinates, can input coordinates directly, validation works

#### 3.2 Professional Precision System
- [ ] `components/environment/PrecisionSelector.tsx`
  - [ ] Dropdown with precision levels (professional styling)
  - [ ] Show current precision with icon
  - [ ] Show Unreal unit size for precision (with warnings)
  - [ ] **Keyboard shortcuts** (1-4 keys for precision levels)
  - [ ] **Visual feedback** (highlight when precision changes)
  - [ ] Integration with coordinate system utils

**Smoke Test:** Can select precision, see Unreal size, keyboard shortcuts work, warnings show

**✅ Working State:** Professional coordinate system with precise input and validation

---

### **Phase 4: Professional Placement System** (Working State: Advanced Placement Tools)
**Goal:** Professional placement tools with multi-select, transform, copy/paste

#### 4.1 Professional Placement Layer
- [ ] `components/environment/PlacementLayer.tsx`
  - [ ] Render placements from store (optimized rendering)
  - [ ] Show placement icons/markers (professional styling)
  - [ ] **Selection visualization** (highlight selected, selection box)
  - [ ] **Hover feedback** (show info on hover)
  - [ ] **Transform handles** (when selected, show move handles)
  - [ ] Handle click to select placement (single + multi-select)

**Smoke Test:** Placements render correctly, selection works, hover feedback works

#### 4.2 Professional Placement Tools
- [ ] Update `MapCanvas.tsx` with professional tools
  - [ ] **Placement tool** (click to place, with preview)
  - [ ] **Select tool** (click to select, drag to multi-select)
  - [ ] **Move tool** (drag selected items)
  - [ ] **Delete tool** (Delete key to remove selected)
  - [ ] Calculate cell coordinates from click (with snapping)
  - [ ] Create placement on click (with validation)
  - [ ] Save to database via API client (with undo/redo)

**Smoke Test:** Can place items, select them, move them, delete them, undo/redo works

#### 4.3 Professional Placement Management
- [ ] `components/environment/PlacementList.tsx`
  - [ ] List all placements for current map (with search/filter)
  - [ ] Click to select placement (syncs with canvas)
  - [ ] **Multi-select** (Ctrl+Click, Shift+Click)
  - [ ] **Copy/Paste** (Ctrl+C, Ctrl+V)
  - [ ] **Delete** (Delete key, with confirmation)
  - [ ] **Properties panel** (edit selected placement properties)
  - [ ] Professional styling (like Blender/Unity outliner)

**Smoke Test:** Can see placements, select them, copy/paste, delete, edit properties

**✅ Working State:** Professional placement system with multi-select, transform, copy/paste

---

### **Phase 5: Landmarks & Nested Maps** (Working State: Hierarchical Maps)
**Goal:** Can place landmarks, click to enter nested maps

#### 5.1 Landmark Placement
- [ ] Update placement system to support landmarks
  - [ ] Landmark type selector
  - [ ] Create nested map when landmark placed
  - [ ] Link landmark to nested map

**Smoke Test:** Can place landmark, creates nested map, links correctly

#### 5.2 Map Navigation
- [ ] `components/environment/MapNavigation.tsx`
  - [ ] Breadcrumb navigation (World → Town → Shop)
  - [ ] Back button to parent map
  - [ ] Current map indicator

**Smoke Test:** Can navigate to nested map, see breadcrumb, can go back

#### 5.3 Nested Map Editor
- [ ] Update MapEditor to handle nested maps
  - [ ] Load nested map when landmark clicked
  - [ ] Save nested map changes
  - [ ] Update parent map reference

**Smoke Test:** Click landmark opens nested map, can edit it, changes save

**✅ Working State:** Full hierarchical map system working

---

### **Phase 6: Environment Manager** (Working State: Full Editor)
**Goal:** Can manage environments, create maps, full workflow

#### 6.1 Environment List
- [ ] `components/environment/EnvironmentList.tsx`
  - [ ] List all environments
  - [ ] Create new environment
  - [ ] Select environment
  - [ ] Delete environment

**Smoke Test:** Can create, list, select, delete environments

#### 6.2 Environment Form
- [ ] `components/environment/EnvironmentForm.tsx`
  - [ ] Name, description fields
  - [ ] Image upload (to `game-content/environments/`)
  - [ ] Story association (like characters/creatures)
  - [ ] Metadata fields

**Smoke Test:** Can create/edit environment, upload image, associate stories

#### 6.3 Map Management
- [ ] `components/environment/MapList.tsx`
  - [ ] List maps for selected environment
  - [ ] Create new map
  - [ ] Select map to edit
  - [ ] Delete map

**Smoke Test:** Can create, list, select, delete maps

#### 6.4 Environment Editor Integration
- [ ] `components/environment/EnvironmentEditor.tsx`
  - [ ] Combine EnvironmentList, MapList, MapEditor
  - [ ] Tab system or split view
  - [ ] Full workflow: Environment → Map → Edit Map

**Smoke Test:** Full workflow works: create environment → create map → edit map → place items

**✅ Working State:** Complete environment editor with full workflow

---

### **Phase 7: Content Editor Integration** (Working State: Integrated)
**Goal:** Environment editor integrated into MagicbornContentEditor

#### 7.1 Add Environment Tab
- [ ] Update `components/MagicbornContentEditor.tsx`
  - [ ] Add "Environments" tab
  - [ ] Add EnvironmentEditor component
  - [ ] Test navigation between tabs

**Smoke Test:** Can navigate to Environments tab, editor loads, can navigate back

#### 7.2 Image Upload Integration
- [ ] Update image upload to support environments/maps
  - [ ] Save to `public/game-content/environments/`
  - [ ] Save to `public/game-content/maps/`
  - [ ] Reuse existing ImageUpload component

**Smoke Test:** Can upload images for environments and maps

**✅ Working State:** Environment editor fully integrated into content editor

---

### **Phase 8: Three.js Preparation** (Working State: Export Ready)
**Goal:** Data structure ready for Three.js integration

#### 8.1 Export Utilities (Unreal Units)
- [ ] `lib/utils/mapExport.ts`
  - [ ] Export map with placements to JSON
  - [ ] **All coordinates in Unreal units** (no pixel coordinates in export)
  - [ ] Format for Three.js AND Unreal consumption
  - [ ] Include coordinate system info (for reference)
  - [ ] Include prop/landmark metadata
  - [ ] Include map size in Unreal units

**Smoke Test:** Can export map data, all coordinates in Unreal units, JSON format correct

#### 8.2 Three.js Data Structure (Unreal Units)
- [ ] Design data structure for Three.js scenes
  - [ ] Map placements → 3D objects (using Unreal units directly)
  - [ ] Coordinate system → Unreal units (Three.js uses directly)
  - [ ] Props → 3D models (positioned using Unreal units)
  - [ ] Landmarks → Nested scenes (using Unreal units)
  - [ ] Helper functions for Three.js coordinate compatibility

**Smoke Test:** Export format uses Unreal units, Three.js can use directly without conversion

#### 8.3 Coordinate System Validation
- [ ] Ensure coordinate system utils always output Unreal units
- [ ] Document that Three.js and Unreal use same units (no conversion)
- [ ] Add validation that exports contain only Unreal units

**Smoke Test:** Coordinate system consistently uses Unreal units throughout

**✅ Working State:** Ready for Three.js integration

---

## 🧪 Testing Strategy (Smoke Tests Only)

### Unit Tests (Vitest) - Critical Paths Only
- [ ] `coordinateSystem.test.ts` - Test core math functions
  - [ ] pixelToUnreal conversion
  - [ ] cell calculations
  - [ ] precision size calculations
- [ ] Repository tests - CRUD operations work
- [ ] API route tests - Endpoints return data

### Component Tests (React Testing Library) - Critical Interactions Only
- [ ] MapCanvas renders
- [ ] CoordinateDisplay shows coordinates
- [ ] PrecisionSelector works
- [ ] PlacementList shows placements

**No exhaustive testing - just verify critical paths work**

---

## 🎨 Component Architecture (Three.js Ready)

### Design Principles
1. **Separation of Concerns**
   - Data layer (repositories) → API layer → UI layer
   - Coordinate system is pure utils (no React)
   - Map editor is presentation (no business logic)

2. **Three.js Compatibility**
   - Coordinate system matches Three.js world space
   - Placements export as 3D object positions
   - Props map to 3D models
   - Landmarks map to nested scenes

3. **Extensibility**
   - Easy to add new placement types
   - Easy to add new landmark types
   - Easy to extend coordinate system
   - Easy to add new precision levels

### Component Structure
```
components/environment/
├── EnvironmentEditor.tsx          # Main container
├── EnvironmentList.tsx           # Environment management
├── EnvironmentForm.tsx            # Environment create/edit
├── MapList.tsx                    # Map management
├── MapEditor.tsx                  # Map editing container
├── MapCanvas.tsx                  # Canvas (react-konva)
├── GridLayer.tsx                  # Grid rendering
├── PlacementLayer.tsx             # Placement rendering
├── MapNavigation.tsx              # Breadcrumb navigation
├── MapToolbar.tsx                 # Toolbar (zoom, precision, etc.)
├── PrecisionSelector.tsx          # Precision dropdown
├── CoordinateDisplay.tsx          # Coordinate info
├── PropLibrary.tsx                # Prop browser
└── PlacementList.tsx              # Placement management
```

---

## 🔄 Three.js & Unreal Integration Points

### Coordinate System Architecture
**CRITICAL:** All systems use Unreal units as the source of truth.

```
2D Map Editor (pixels) 
  ↓ [coordinateSystem.ts converts]
Unreal Units (source of truth)
  ↓ [direct use - no conversion]
Three.js Scenes (Unreal units)
  ↓ [direct use - no conversion]
Unreal Engine (Unreal units)
```

**Key Principle:** 
- Map editor converts pixels → Unreal units
- Three.js uses Unreal units directly (no conversion)
- Unreal Engine uses Unreal units directly (no conversion)
- **Same coordinate system across all platforms**

### Data Flow
```
2D Map Editor (pixels) 
  → Coordinate System (pixel → Unreal conversion)
  → Database (stores Unreal units)
  → Export JSON (Unreal units)
  → Three.js Scene (Unreal units - direct use)
  → Unreal Engine (Unreal units - direct use)
```

### Coordinate Mapping
```
Map Editor:
  - User clicks at pixel (500, 300)
  - coordinateSystem.pixelToUnreal() converts to Unreal units
  - Stores in database as Unreal units

Three.js:
  - Reads Unreal units from database/export
  - Uses directly: new THREE.Vector3(unrealX, 0, unrealY)
  - No conversion needed

Unreal Engine:
  - Reads Unreal units from export
  - Uses directly: FVector(unrealX, unrealY, unrealZ)
  - No conversion needed
```

### Placement Mapping
```
Map Placement (stored in Unreal units) → 3D Object Position
- Prop → 3D Model Instance (Three.js: use Unreal units directly)
- Landmark → Nested Scene (Three.js: use Unreal units directly)
- Spawn Point → 3D Spawn Location (Unreal: use Unreal units directly)
```

### Future Three.js Components
- `components/three/MapScene.tsx` - Three.js scene using Unreal units
- `components/three/PlacementRenderer.tsx` - Render placements as 3D objects (Unreal units)
- `components/three/LandmarkScene.tsx` - Nested scene for landmarks (Unreal units)
- `lib/utils/threejsHelpers.ts` - Helper functions for Three.js + Unreal coordinate compatibility

### Export Format (Unreal Units)
```typescript
interface MapExport {
  mapId: string;
  unrealMapSize: { width: number; height: number }; // Unreal units
  placements: Array<{
    id: string;
    type: PlacementType;
    position: { x: number; y: number; z?: number }; // Unreal units
    rotation?: { x: number; y: number; z: number };
    scale?: number;
    // ... other data
  }>;
  coordinateSystem: {
    sourceImageSize: { width: number; height: number }; // Pixels (reference only)
    unrealSize: { width: number; height: number }; // Unreal units (used by Three.js/Unreal)
  };
}
```

**Three.js Usage:**
```typescript
// Read placement from export (already in Unreal units)
const placement = mapExport.placements[0];

// Use directly in Three.js - no conversion
const position = new THREE.Vector3(
  placement.position.x,  // Unreal units
  0,                      // Y is up in Unreal, Z is up in Three.js (may need swap)
  placement.position.y    // Unreal units
);
```

**Unreal Usage:**
```cpp
// Read placement from export (already in Unreal units)
FVector Position(
  Placement.Position.X,  // Unreal units - direct use
  Placement.Position.Y,  // Unreal units - direct use
  Placement.Position.Z   // Unreal units - direct use
);
```

---

## 📋 Task Checklist (Incremental)

### Immediate Next Steps
1. [ ] **Phase 1.1** - Database schemas (environments, maps, placements)
2. [ ] **Phase 1.2** - Repositories (CRUD operations)
3. [ ] **Phase 1.3** - API routes (GET, POST, PUT, DELETE)
4. [ ] **Phase 1.4** - API clients (frontend data access)
5. [ ] **Smoke Test** - Can create environment, map, placement via API

**✅ After Phase 1:** Data layer complete, can persist data

### Then
6. [ ] **Phase 2** - Core map canvas (image, zoom, pan, grid)
7. [ ] **Phase 3** - Coordinate system integration
8. [ ] **Phase 4** - Placement system
9. [ ] **Phase 5** - Landmarks & nested maps
10. [ ] **Phase 6** - Environment manager
11. [ ] **Phase 7** - Content editor integration
12. [ ] **Phase 8** - Three.js preparation

---

## 🎯 Success Criteria

**After Each Phase:**
- ✅ Code works (smoke tests pass)
- ✅ No breaking changes to existing features
- ✅ Can demonstrate working feature
- ✅ Code is clean and maintainable
- ✅ Ready for next phase

**Final Goal:**
- ✅ Full environment editor working
- ✅ Can create environments, maps, place items
- ✅ Hierarchical maps work
- ✅ Data ready for Three.js integration
- ✅ Integrated into MagicbornContentEditor

---

## 🚀 Let's Start: Phase 1.1 - Database Schemas

**Next Task:** Create database schemas for environments, maps, and placements.

**Working State After:** Can create tables, insert test data, query it back.

Ready to proceed?

