# Environment Editor: Development Roadmap

## ✅ Completed Features

### Phase 1: Data Layer ✅
- Database schemas (environments, maps, map-placements, map-regions)
- Repositories with full CRUD operations
- API routes (GET, POST, PUT, DELETE)
- API clients for frontend access
- Smoke tests passing

### Phase 2: Core Canvas ✅
- Zustand store with history/undo-redo
- MapCanvas with smooth zoom/pan
- Grid layer with sub-grid support
- Status bar with real-time coordinates
- Keyboard shortcuts (G, S, +/-, Ctrl+Z, etc.)
- Context menus (Radix UI)
- Map creation form with presets
- Environment Manager UI (create/edit environments)
- Map Manager UI (create/edit maps)

### Phase 3: Cell Selection & Regions ✅
- Cell selection tool (click and drag)
- Cell selection layer (visual feedback)
- Region system (persistent cell selections)
- Unique colors per region
- Region creation with environment properties
- Region list and navigation
- Selection persistence after drag

### Phase 4: Visual Enhancements ✅
- Color-coded mode indicators
- Completion tracking (Elden Ring comparison)
- Tooltips on all tools
- Help button with user guide link
- Status bar enhancements

---

## 🎯 Next Steps (Priority Order)

### **Step 1: Region Environment Properties Form** (High Priority)
**Why:** Regions need to override world environment with specific properties (biome, climate, danger level, creatures).

**What to build:**
1. **Environment Properties Form**
   - Biome selector (Mountain, Forest, Swamp, Interior, etc.)
   - Climate selector (Cold, Warm, Temperate, Humid, etc.)
   - Danger Level slider (0-5)
   - Creatures multi-select
   - Show "Override World Environment" messaging

2. **Integration**
   - Add to region creation dialog
   - Add to region editing
   - Display inherited vs overridden properties

**Files to create/modify:**
- `components/environment/RegionForm.tsx` (new)
- `components/environment/CellSelectionFeedback.tsx` (modify)

---

### **Step 2: Nested Map Creation from Region** (High Priority)
**Why:** Users need to create nested maps from regions that inherit environment properties.

**What to build:**
1. **Nested Map Creation Flow**
   - Click "Create Nested Map" button
   - Show inherited properties from region
   - Allow override (if needed)
   - Create map and link to region

2. **Visual Feedback**
   - Show "Inherits from Region: Frozen Loom" message
   - Display inherited properties list
   - Highlight what's inherited vs overridden

**Files to create/modify:**
- `components/environment/CellSelectionFeedback.tsx` (modify)
- `components/environment/MapForm.tsx` (modify - add nested map mode)

---

### **Step 3: Placement System** (High Priority)
**Why:** Users need to place items (props, landmarks, spawn points) on maps.

**What to build:**
1. **Placement Dialog**
   - Click on map → Dialog appears
   - Select placement type (Prop, Landmark, Spawn Point, etc.)
   - Choose precision level (Zone, Cell, Pixel, Unreal Direct)
   - Set properties (rotation, scale, etc.)

2. **Placement Rendering**
   - Render placements on canvas
   - Visual indicators (icons, markers)
   - Selection and editing

3. **Landmark System**
   - Landmarks link to nested maps
   - Visual distinction (different icons)
   - Click landmark → Navigate to nested map

**Files to create/modify:**
- `components/environment/PlacementDialog.tsx` (new)
- `components/environment/PlacementLayer.tsx` (new)
- `components/environment/MapCanvas.tsx` (modify)

---

### **Step 4: Visual Hierarchy Indicators** (Medium Priority)
**Why:** Users need to understand map hierarchy and navigate between levels.

**What to build:**
1. **Breadcrumb Trail**
   - Show: World Map > Frozen Loom Map > Warm Inn Map
   - Click breadcrumb → Navigate to that map

2. **Map Hierarchy Display**
   - Tree view of maps
   - Show parent-child relationships
   - Quick navigation

3. **Region Context**
   - Show which map region belongs to
   - Show parent region (if nested)

**Files to create/modify:**
- `components/environment/BreadcrumbTrail.tsx` (new)
- `components/environment/MapHierarchy.tsx` (new)
- `components/environment/EnvironmentEditor.tsx` (modify)

---

### **Step 5: Environment Properties Display** (Medium Priority)
**Why:** Users need to see current environment properties and what's inherited vs overridden.

**What to build:**
1. **Environment Properties Panel**
   - Show current properties
   - Distinguish inherited vs overridden
   - Color-code or icon indicators

2. **Property Inheritance Visualization**
   - Show inheritance chain
   - Highlight overrides
   - Show what would apply at each level

**Files to create/modify:**
- `components/environment/EnvironmentPropertiesPanel.tsx` (new)
- `components/environment/StatusBar.tsx` (modify)

---

### **Step 6: API Integration for Regions** (Medium Priority)
**Why:** Regions need to be saved to database and loaded from API.

**What to build:**
1. **Region API Routes**
   - GET /api/game-data/map-regions (list by mapId)
   - POST /api/game-data/map-regions (create)
   - PUT /api/game-data/map-regions (update)
   - DELETE /api/game-data/map-regions (delete)

2. **Region API Client**
   - Add to `lib/api/clients.ts`
   - Methods: list, get, create, update, delete

3. **Store Integration**
   - Update `loadRegions` to call API
   - Save regions on create/update
   - Load regions when map changes

**Files to create/modify:**
- `app/api/game-data/map-regions/route.ts` (new)
- `lib/api/clients.ts` (modify)
- `lib/store/mapEditorStore.ts` (modify)

---

## 📋 Future Enhancements

### **Advanced Features:**
- Multi-region selection and operations
- Region merging/splitting
- Region templates
- Bulk region operations
- Region validation and warnings
- Export/import regions
- Region versioning

### **Placement Features:**
- Placement templates
- Bulk placement operations
- Placement validation
- Placement search/filter
- Placement layers
- Placement animation

### **Visual Features:**
- 3D preview (Three.js)
- Map minimap
- Layer toggles
- Custom themes
- Export images

---

## 🎯 Current Focus

**Immediate priorities:**
1. Region environment properties form
2. Nested map creation from region
3. Placement system

**Next sprint:**
4. Visual hierarchy indicators
5. Environment properties display
6. API integration for regions

---

This roadmap is updated as features are completed. Check off items as they're done!

