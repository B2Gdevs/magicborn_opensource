# Environment Editor - Implementation Plan & Checklist

## 🎯 Overview

Hierarchical map editor for placing towns, dungeons, and landmarks on world maps, with ability to drill down into nested maps (town → shop → home).

---

## 📋 Core Concepts

### Hierarchical Maps
- **World Map** → Place towns, dungeons, landmarks
- **Town Map** → Click into town cell → Edit town map (lower resolution)
- **Shop Map** → Click into shop cell → Edit shop interior
- **Home Map** → Click into home cell → Edit home interior

### Landmarks
- Most placements are **landmarks** that link to nested maps
- Landmarks have types: Town, Dungeon, Shop, Home, Building, Cave, Ruin
- Clicking a landmark opens its nested map editor

---

## 🗂️ Data Structures

### Environment Definition
```typescript
interface EnvironmentDefinition {
  id: string;
  name: string;
  description: string;
  imagePath?: string; // game-content/environments/{id}.png
  mapIds: string[];
  storyIds: string[];
  metadata: {
    biome: string;
    climate: string;
    dangerLevel: number;
  };
}
```

### Map Definition (Hierarchical)
```typescript
interface MapDefinition {
  id: string;
  environmentId: string;
  parentMapId?: string; // If nested map, reference to parent
  parentCellCoordinates?: CellCoordinates; // Where this map is placed on parent
  name: string;
  description: string;
  imagePath?: string; // game-content/maps/{id}.png
  unrealMapSize: { width: number; height: number };
  imageDimensions: { width: number; height: number };
  coordinateConfig: CoordinateSystemConfig;
  sceneIds: string[];
  placements: MapPlacement[];
  connections: MapConnection[];
  environmentalModifiers?: EnvironmentalModifier[];
}
```

### Map Placement (with Landmarks)
```typescript
interface MapPlacement {
  id: string;
  mapId: string;
  type: PlacementType; // Enum
  itemId: string;
  coordinates: PlacementCoordinates; // Varies by precision
  precisionLevel: PrecisionLevel; // Enum
  isLandmark: boolean; // Most placements are landmarks
  landmarkType?: LandmarkType; // If isLandmark = true
  nestedMapId?: string; // If landmark, link to nested map
  metadata: Record<string, any>;
}
```

---

## ✅ Implementation Checklist

### Phase 1: Foundation & Core Math

#### 1.1 Enums & Types
- [ ] Create `lib/core/mapEnums.ts` with all enums
  - [ ] `PlacementType` enum
  - [ ] `PrecisionLevel` enum
  - [ ] `LandmarkType` enum
  - [ ] `SceneType` enum
  - [ ] `PropType` enum
  - [ ] `ModifierType` enum
  - [ ] `ModifierTarget` enum
- [ ] Create `lib/data/environments.ts` with type definitions
- [ ] Create `lib/data/maps.ts` with type definitions
- [ ] Create `lib/data/mapPlacements.ts` with type definitions

#### 1.2 Coordinate System Utils
- [ ] Create `lib/utils/coordinateSystem.ts`
  - [ ] `pixelToUnreal()` function
  - [ ] `unrealToPixel()` function
  - [ ] `pixelToCell()` function
  - [ ] `cellToPixel()` function
  - [ ] `cellToZone()` function
  - [ ] `zoneToCell()` function
  - [ ] `getUnrealSizeForPrecision()` function
  - [ ] `isPrecisionAppropriate()` function
  - [ ] `getDefaultCoordinateConfig()` function
- [ ] Write unit tests for coordinate system (`lib/utils/__tests__/coordinateSystem.test.ts`)
  - [ ] Test pixel to Unreal conversion
  - [ ] Test Unreal to pixel conversion
  - [ ] Test cell calculations
  - [ ] Test zone calculations
  - [ ] Test precision size calculations
  - [ ] Test precision appropriateness checks

#### 1.3 Database Schema
- [ ] Create `lib/data/environments.schema.ts` (Drizzle schema)
- [ ] Create `lib/data/maps.schema.ts` (Drizzle schema)
- [ ] Create `lib/data/mapPlacements.schema.ts` (Drizzle schema)
- [ ] Update `lib/data/spells.db.ts` to include new tables
- [ ] Create repositories:
  - [ ] `lib/data/environmentsRepository.ts`
  - [ ] `lib/data/mapsRepository.ts`
  - [ ] `lib/data/mapPlacementsRepository.ts`

#### 1.4 API Routes
- [ ] Create `app/api/game-data/environments/route.ts` (GET, POST, PUT, DELETE)
- [ ] Create `app/api/game-data/maps/route.ts` (GET, POST, PUT, DELETE)
- [ ] Create `app/api/game-data/map-placements/route.ts` (GET, POST, PUT, DELETE)
- [ ] Update `app/api/game-data/ids/route.ts` to include environments and maps

#### 1.5 API Clients
- [ ] Update `lib/api/clients.ts` with:
  - [ ] `environmentClient` (list, get, create, update, delete)
  - [ ] `mapClient` (list, get, create, update, delete)
  - [ ] `mapPlacementClient` (list, get, create, update, delete)
  - [ ] Update `idClient` to include environments and maps

---

### Phase 2: Map Editor Core

#### 2.1 Install Dependencies
- [ ] Install `react-konva` and `konva`
- [ ] Install `@types/konva` (dev dependency)

#### 2.2 Zustand Store
- [ ] Create `lib/store/mapEditorStore.ts`
  - [ ] State: zoom, panX, panY, selectedCells, precisionLevel, showGrid
  - [ ] Actions: setZoom, setPan, selectCells, setPrecisionLevel, toggleGrid
  - [ ] State: selectedMap, selectedPlacement, placementMode
  - [ ] Actions: setSelectedMap, setSelectedPlacement, setPlacementMode

#### 2.3 Map Canvas Component
- [ ] Create `components/environment/MapCanvas.tsx`
  - [ ] react-konva Stage setup
  - [ ] Zoom/pan handlers (mouse wheel, drag)
  - [ ] Image background rendering
  - [ ] Grid layer integration
  - [ ] Placement layer integration
  - [ ] Selection layer integration
  - [ ] Click handlers for placement

#### 2.4 Grid Layer
- [ ] Create `components/environment/GridLayer.tsx`
  - [ ] Draw grid lines based on zoom
  - [ ] Adjust cell size with zoom
  - [ ] Show different grid densities

#### 2.5 Placement Layer
- [ ] Create `components/environment/PlacementLayer.tsx`
  - [ ] Render all placements
  - [ ] Show item icons/images
  - [ ] Highlight selected items
  - [ ] Show landmark indicators
  - [ ] Handle click to select/edit

#### 2.6 Selection Layer
- [ ] Create `components/environment/SelectionLayer.tsx`
  - [ ] Multi-cell selection (click and drag)
  - [ ] Visual selection rectangle
  - [ ] Selected cells highlighting

---

### Phase 3: UI Components

#### 3.1 Map Toolbar
- [ ] Create `components/environment/MapToolbar.tsx`
  - [ ] Zoom controls (+/- buttons)
  - [ ] Precision selector (dropdown)
  - [ ] Grid toggle
  - [ ] Placement mode selector
  - [ ] Coordinate display

#### 3.2 Precision Selector
- [ ] Create `components/environment/PrecisionSelector.tsx`
  - [ ] Dropdown with precision levels
  - [ ] Show current precision
  - [ ] Show Unreal unit size for current precision
  - [ ] Warning if precision too low for selected item

#### 3.3 Coordinate Display
- [ ] Create `components/environment/CoordinateDisplay.tsx`
  - [ ] Show pixel coordinates on hover
  - [ ] Show Unreal coordinates
  - [ ] Show cell coordinates
  - [ ] Show precision level

#### 3.4 Prop Library
- [ ] Create `components/environment/PropLibrary.tsx`
  - [ ] List/grid of available props
  - [ ] Filter by type/tags
  - [ ] Click to select prop
  - [ ] Show prop preview
  - [ ] Show recommended precision

#### 3.5 Placement List
- [ ] Create `components/environment/PlacementList.tsx`
  - [ ] List all placements on map
  - [ ] Filter/search placements
  - [ ] Click to select placement
  - [ ] Delete placement
  - [ ] Edit placement

---

### Phase 4: Hierarchical Map Navigation

#### 4.1 Map Navigation
- [ ] Add "Enter Map" button for landmarks
- [ ] Create `components/environment/MapNavigation.tsx`
  - [ ] Breadcrumb navigation (World → Town → Shop)
  - [ ] Back button to parent map
  - [ ] Current map indicator

#### 4.2 Nested Map Editor
- [ ] Update MapEditor to handle nested maps
- [ ] Load nested map when landmark clicked
- [ ] Save nested map changes
- [ ] Update parent map when nested map changes

#### 4.3 Landmark Creation
- [ ] Add landmark type selector
- [ ] Create nested map when landmark placed
- [ ] Link landmark to nested map
- [ ] Visual indicator for landmarks (different icon)

---

### Phase 5: Environment Manager

#### 5.1 Environment List
- [ ] Create `components/environment/EnvironmentList.tsx`
  - [ ] List all environments
  - [ ] Create new environment
  - [ ] Edit environment
  - [ ] Delete environment
  - [ ] Select environment

#### 5.2 Environment Form
- [ ] Create `components/environment/EnvironmentForm.tsx`
  - [ ] Name, description fields
  - [ ] Image upload
  - [ ] Story association (like characters/creatures)
  - [ ] Metadata fields

#### 5.3 Environment Editor
- [ ] Create `components/environment/EnvironmentEditor.tsx`
  - [ ] Environment list sidebar
  - [ ] Map list for selected environment
  - [ ] Create/edit maps
  - [ ] Link to map editor

---

### Phase 6: Integration & Polish

#### 6.1 Content Editor Integration
- [ ] Add "Environments" tab to `MagicbornContentEditor.tsx`
- [ ] Add EnvironmentEditor component
- [ ] Test navigation between tabs

#### 6.2 Image Upload
- [ ] Update image upload API to support environments/maps
- [ ] Save images to `public/game-content/environments/`
- [ ] Save images to `public/game-content/maps/`

#### 6.3 Export to JSON
- [ ] Create `lib/utils/mapExport.ts`
  - [ ] Export map with placements to JSON
  - [ ] Format for Unreal import
  - [ ] Include coordinate system info

#### 6.4 Unit Tests
- [ ] Test coordinate system utils (already planned)
- [ ] Test repositories
- [ ] Test API routes
- [ ] Test coordinate conversions with different map sizes

---

## 🧪 Testing Strategy

**See `TESTING_STRATEGY.md` for detailed explanation.**

### Layer 1: Unit Tests (Vitest) - CRITICAL FIRST ⚠️
**Priority: HIGHEST - Start here**

- [ ] Write `lib/utils/__tests__/coordinateSystem.test.ts`
  - [ ] Test `pixelToUnreal()` with various map sizes (12km, 1km, 100m)
  - [ ] Test `unrealToPixel()` conversions
  - [ ] Test `pixelToCell()` at different zoom levels
  - [ ] Test `cellToZone()` and `zoneToCell()` conversions
  - [ ] Test `getUnrealSizeForPrecision()` for all precision levels
  - [ ] Test `isPrecisionAppropriate()` warnings
  - [ ] Test edge cases (boundaries, negative values, zero)
- [ ] Test repositories
  - [ ] Test environment CRUD operations
  - [ ] Test map CRUD operations
  - [ ] Test placement CRUD operations
- [ ] Test API routes
  - [ ] Test environment endpoints (GET, POST, PUT, DELETE)
  - [ ] Test map endpoints
  - [ ] Test placement endpoints

### Layer 2: Component Tests (React Testing Library)
**Priority: MEDIUM - After unit tests**

- [ ] Install React Testing Library
  ```bash
  npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
  ```
- [ ] Update `vitest.config.ts` to support jsdom environment
- [ ] Write component tests:
  - [ ] `PrecisionSelector.test.tsx` - Test dropdown, precision selection
  - [ ] `CoordinateDisplay.test.tsx` - Test coordinate display
  - [ ] `PropLibrary.test.tsx` - Test prop selection
  - [ ] `EnvironmentForm.test.tsx` - Test form interactions

### Layer 3: Visual/Integration Tests (Playwright) - For Canvas
**Priority: HIGH - Install when canvas components are ready**

- [ ] Install Playwright
  ```bash
  npm install --save-dev @playwright/test
  npx playwright install
  ```
- [ ] Configure Playwright for Next.js
- [ ] Write visual/integration tests:
  - [ ] Grid renders correctly on map image
  - [ ] Zoom in/out works (visual verification)
  - [ ] Grid adjusts with zoom level
  - [ ] Click places item at correct cell coordinates
  - [ ] Click precision at different zoom levels (CRITICAL)
  - [ ] Nested map navigation (click landmark → nested map opens)
  - [ ] Full flow: create map → place item → save → reload → verify

**Note:** Canvas/konva CANNOT be tested with React Testing Library. Playwright is the ONLY way to test visual rendering and click precision.

---

## 📁 File Structure

```
lib/
├── core/
│   └── mapEnums.ts (NEW)
├── data/
│   ├── environments.ts (NEW)
│   ├── environments.schema.ts (NEW)
│   ├── environmentsRepository.ts (NEW)
│   ├── maps.ts (NEW)
│   ├── maps.schema.ts (NEW)
│   ├── mapsRepository.ts (NEW)
│   ├── mapPlacements.ts (NEW)
│   ├── mapPlacements.schema.ts (NEW)
│   └── mapPlacementsRepository.ts (NEW)
├── utils/
│   ├── coordinateSystem.ts (NEW)
│   └── __tests__/
│       └── coordinateSystem.test.ts (NEW)
├── store/
│   └── mapEditorStore.ts (NEW)
└── api/
    └── clients.ts (UPDATE)

components/
└── environment/
    ├── EnvironmentEditor.tsx (NEW)
    ├── EnvironmentList.tsx (NEW)
    ├── EnvironmentForm.tsx (NEW)
    ├── MapEditor.tsx (NEW)
    ├── MapCanvas.tsx (NEW)
    ├── GridLayer.tsx (NEW)
    ├── PlacementLayer.tsx (NEW)
    ├── SelectionLayer.tsx (NEW)
    ├── MapToolbar.tsx (NEW)
    ├── PrecisionSelector.tsx (NEW)
    ├── CoordinateDisplay.tsx (NEW)
    ├── PropLibrary.tsx (NEW)
    ├── PlacementList.tsx (NEW)
    └── MapNavigation.tsx (NEW)

app/api/game-data/
├── environments/
│   └── route.ts (NEW)
├── maps/
│   └── route.ts (NEW)
└── map-placements/
    └── route.ts (NEW)

public/game-content/
├── environments/ (EXISTS)
└── maps/ (EXISTS)
```

---

## 🎯 MVP Scope (Phase 1-3)

**Must Have:**
1. ✅ Enums and types
2. ✅ Coordinate system utils with tests
3. ✅ Database schema and repositories
4. ✅ API routes and clients
5. ✅ Basic map canvas with zoom/pan
6. ✅ Grid rendering
7. ✅ Click to place items
8. ✅ Coordinate display
9. ✅ Save to database

**Can Add Later:**
- Hierarchical navigation (Phase 4)
- Landmarks (Phase 4)
- Environment manager (Phase 5)
- Advanced features

---

## 🚀 Getting Started

1. Start with Phase 1.1 (Enums) - Foundation
2. Then Phase 1.2 (Coordinate Utils) - Core math with tests
3. Then Phase 1.3 (Database) - Data layer
4. Then Phase 2 (Map Editor) - UI layer

