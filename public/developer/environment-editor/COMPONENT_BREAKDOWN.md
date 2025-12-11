# Environment Editor: Component Breakdown

## 🎯 Overview

This document explains each component in the Environment Editor, what it does, how it works, and how to extend it.

---

## 📁 Component Structure

```
components/environment/
├── EnvironmentEditor.tsx          # Main editor component
├── MapCanvas.tsx                  # Canvas with zoom/pan/grid
├── GridLayer.tsx                  # Grid overlay rendering
├── CellSelectionLayer.tsx         # Selected cells/regions rendering
├── CellSelectionFeedback.tsx      # Selection feedback panel
├── StatusBar.tsx                  # Bottom status bar
├── MapCompletionIndicator.tsx    # Completion tracking
├── MapForm.tsx                    # Map creation/editing form
└── EnvironmentForm.tsx            # Environment creation/editing form
```

---

## 🧩 Component Details

### **1. EnvironmentEditor.tsx**

**Purpose:** Main container component that orchestrates the entire editor.

**Responsibilities:**
- Manages editor state (maps, environments, active section)
- Handles API calls (load, create, update, delete)
- Renders toolbar with tools and keyboard shortcuts
- Manages modals (create/edit maps, environments)
- Integrates all sub-components

**Key Features:**
- Two sections: "Environments" and "Maps"
- Map selector dropdown
- Toolbar with mode toggles (Cell Selection vs Placement)
- Keyboard shortcuts (`react-hotkeys-hook`)
- Context menu (`@radix-ui/react-context-menu`)
- Error boundaries

**State Management:**
- Uses `useMapEditorStore` (Zustand) for map editor state
- Local state for environments/maps lists
- Local state for modals

**How to Extend:**
```typescript
// Add new section
const [activeSection, setActiveSection] = useState<"environments" | "maps" | "new-section">("maps");

// Add new tool to toolbar
<Tooltip content="New Tool">
  <button onClick={handleNewTool}>
    <NewToolIcon />
  </button>
</Tooltip>

// Add new keyboard shortcut
useHotkeys("n", () => {
  // Handle new action
}, { enableOnFormTags: true });
```

**Dependencies:**
- `@/lib/store/mapEditorStore` - Zustand store
- `@/lib/api/clients` - API clients
- `react-hotkeys-hook` - Keyboard shortcuts
- `@radix-ui/react-context-menu` - Context menus

---

### **2. MapCanvas.tsx**

**Purpose:** Main canvas component that renders the map image and handles interactions.

**Responsibilities:**
- Renders map image with zoom/pan
- Handles mouse events (click, drag, wheel)
- Manages viewport (zoom, pan, bounds)
- Coordinates with selection and placement systems
- Passes coordinates to StatusBar

**Key Features:**
- Smooth zoom (mouse wheel, zoom to cursor)
- Smooth pan (Space+drag, middle mouse button)
- Coordinate conversion (pixel → Unreal → cell)
- Click handling (cell selection vs placement)
- Drag selection for cells
- Region click detection

**State Management:**
- Uses `useMapEditorStore` for map state, zoom, pan, selection
- Local state for mouse coordinates

**How to Extend:**
```typescript
// Add new interaction mode
const handleCustomInteraction = useCallback((e: any) => {
  if (customMode) {
    // Handle custom interaction
  }
}, [customMode]);

// Add new layer
<CustomLayer zoom={zoom} />

// Add new tool handler
if (activeTool === "custom") {
  // Handle custom tool
}
```

**Dependencies:**
- `react-konva` - Canvas library
- `@/lib/utils/coordinateSystem` - Coordinate conversion
- `@/lib/store/mapEditorStore` - State management

---

### **3. GridLayer.tsx**

**Purpose:** Renders the grid overlay on the canvas.

**Responsibilities:**
- Draws grid lines based on zoom level
- Shows sub-grid at high zoom
- Adjusts grid density with zoom
- Configurable styling

**Key Features:**
- Dynamic grid size (adjusts with zoom)
- Sub-grid at high zoom levels
- Styling options (color, opacity, line width)
- Performance optimized (only renders visible grid)

**Props:**
```typescript
interface GridLayerProps {
  zoom: number;
  config: CoordinateSystemConfig;
  showGrid: boolean;
  gridSize?: number;
}
```

**How to Extend:**
```typescript
// Add grid snapping visualization
{snapToGrid && (
  <Line
    // Draw snap indicator
  />
)}

// Add zone boundaries
{showZones && (
  <Rect
    // Draw zone boundaries
  />
)}
```

**Dependencies:**
- `react-konva` - Canvas rendering
- `@/lib/utils/coordinateSystem` - Coordinate calculations

---

### **4. CellSelectionLayer.tsx**

**Purpose:** Renders selected cells and persistent regions with unique colors.

**Responsibilities:**
- Renders temporary cell selections (blue highlight)
- Renders persistent regions (unique colors)
- Highlights region boundaries
- Shows selected region (more opaque)

**Key Features:**
- Temporary selection (blue, only when actively selecting)
- Persistent regions (unique colors per region)
- Boundary highlighting (darker borders)
- Selected region highlighting (more opaque)

**State Management:**
- Uses `useMapEditorStore` for selections and regions

**How to Extend:**
```typescript
// Add region labels
{regions.map(region => (
  <Text
    x={bounds.centerX}
    y={bounds.centerY}
    text={region.name}
  />
))}

// Add hover effects
<Rect
  onMouseEnter={() => setHoveredRegion(region.id)}
  fill={hoveredRegion === region.id ? highlightColor : region.color}
/>

// Add region editing handles
{selectedRegion && (
  <Circle
    // Resize handles
  />
)}
```

**Dependencies:**
- `react-konva` - Canvas rendering
- `@/lib/data/mapRegions` - Region utilities
- `@/lib/utils/coordinateSystem` - Coordinate conversion

---

### **5. CellSelectionFeedback.tsx**

**Purpose:** Provides real-time feedback and validation for cell selections.

**Responsibilities:**
- Shows selection statistics (cell count, area, bounds)
- Validates selection for nested map creation
- Shows recommendations and warnings
- Provides region creation UI
- Lists existing regions

**Key Features:**
- Real-time validation
- Recommendations based on selection size
- Region list (when no active selection)
- Region creation dialog
- Nested map creation button

**State Management:**
- Uses `useMapEditorStore` for selections and regions
- Local state for dialog (showCreateDialog, regionName)

**How to Extend:**
```typescript
// Add region editing
{selectedRegion && (
  <button onClick={handleEditRegion}>
    Edit Region Properties
  </button>
)}

// Add region deletion
<button onClick={handleDeleteRegion}>
  Delete Region
</button>

// Add bulk operations
<button onClick={handleMergeRegions}>
  Merge Selected Regions
</button>
```

**Dependencies:**
- `@/lib/utils/cellSelectionValidation` - Validation logic
- `@/lib/data/mapRegions` - Region utilities
- `@/lib/store/mapEditorStore` - State management

---

### **6. StatusBar.tsx**

**Purpose:** Displays real-time map information at the bottom of the editor.

**Responsibilities:**
- Shows mouse coordinates (pixel, Unreal, cell)
- Shows current mode (Cell Selection vs Placement)
- Shows zoom level
- Shows selection counts
- Shows grid/snap status

**Key Features:**
- Real-time coordinate updates
- Mode indicators with color coding
- Selection counts (cells, regions, placements)
- Grid/snap status

**Props:**
```typescript
interface StatusBarProps {
  mouseCoords?: PixelCoordinates | null;
}
```

**How to Extend:**
```typescript
// Add FPS counter
<div>FPS: {fps}</div>

// Add memory usage
<div>Memory: {memoryUsage}MB</div>

// Add active tool
<div>Tool: {activeTool}</div>

// Add selection area
<div>Area: {selectedArea}km²</div>
```

**Dependencies:**
- `@/lib/utils/coordinateSystem` - Coordinate conversion
- `@/lib/store/mapEditorStore` - State management

---

### **7. MapCompletionIndicator.tsx**

**Purpose:** Shows map completion percentage compared to Elden Ring.

**Responsibilities:**
- Calculates completion percentage
- Compares to Elden Ring (for world maps)
- Shows region count
- Displays progress bar

**Key Features:**
- Completion calculation
- Elden Ring comparison
- Visual progress bar
- Region summary

**How to Extend:**
```typescript
// Add nested map completion
{showNestedCompletion && (
  <div>
    Nested Maps: {nestedMapCompletion}%
  </div>
)}

// Add time estimates
<div>
  Estimated completion: {estimatedTime} hours
</div>

// Add completion goals
<div>
  Goal: {completionGoal}% by {targetDate}
</div>
```

**Dependencies:**
- `@/lib/utils/mapCompletion` - Completion calculations
- `@/lib/store/mapEditorStore` - State management

---

### **8. MapForm.tsx**

**Purpose:** Form for creating and editing map definitions.

**Responsibilities:**
- Map ID input with validation
- Name, description fields
- Environment selector
- Map type presets (World, Town, Dungeon, etc.)
- Image upload with dimension analysis
- Coordinate config display
- Map statistics (cells, zones, sizes)

**Key Features:**
- ID validation (uniqueness check)
- Map type presets with recommended sizes
- Image dimension analysis
- Real-time statistics
- Fixed footer buttons

**How to Extend:**
```typescript
// Add parent map selector (for nested maps)
{isNested && (
  <select>
    <option>Select parent map...</option>
  </select>
)}

// Add coordinate config editor
<CoordinateConfigEditor
  value={coordinateConfig}
  onChange={setCoordinateConfig}
/>

// Add environmental modifiers
<EnvironmentalModifiersEditor
  modifiers={environmentalModifiers}
  onChange={setEnvironmentalModifiers}
/>
```

**Dependencies:**
- `@/components/ui/IdInput` - ID input component
- `@/components/ui/ImageUpload` - Image upload component
- `@/components/ui/Modal` - Modal component
- `@/lib/utils/coordinateSystem` - Coordinate calculations

---

### **9. EnvironmentForm.tsx**

**Purpose:** Form for creating and editing environment definitions.

**Responsibilities:**
- Environment ID input with validation
- Name, description fields
- Image upload
- Story associations
- Metadata fields (biome, climate, danger level)

**Key Features:**
- ID validation
- Image upload
- Story associations
- Metadata fields

**How to Extend:**
```typescript
// Add map associations
<MapSelector
  selectedMaps={mapIds}
  onChange={setMapIds}
/>

// Add environmental modifiers
<EnvironmentalModifiersEditor
  modifiers={ambientEffects}
  onChange={setAmbientEffects}
/>

// Add story editor integration
<StorySelector
  selectedStories={storyIds}
  onChange={setStoryIds}
/>
```

**Dependencies:**
- `@/components/ui/IdInput` - ID input component
- `@/components/ui/ImageUpload` - Image upload component
- `@/components/ui/Modal` - Modal component

---

## 🔄 Data Flow

### **Creating a Region:**

```
User Action: Select cells → Create region
  ↓
CellSelectionFeedback.tsx: Shows dialog
  ↓
User fills: Name, environment properties
  ↓
CellSelectionFeedback.tsx: Calls addRegion()
  ↓
mapEditorStore: Adds region to state
  ↓
CellSelectionLayer.tsx: Renders region with unique color
  ↓
CellSelectionFeedback.tsx: Shows region in list
```

### **Creating a Nested Map:**

```
User Action: Click "Create Nested Map"
  ↓
CellSelectionFeedback.tsx: Opens MapForm modal
  ↓
User fills: Name, type, image
  ↓
MapForm.tsx: Calls mapClient.create()
  ↓
API: Creates map, links to region
  ↓
EnvironmentEditor.tsx: Refreshes maps list
  ↓
mapEditorStore: Updates region.nestedMapId
  ↓
CellSelectionFeedback.tsx: Shows "Edit Nested Map" button
```

---

## 🎨 Styling & Theming

All components use the design system:
- Colors: `bg-deep`, `text-text-primary`, `border-border`, `ember-glow`
- Spacing: Consistent padding/margins
- Typography: Standard text sizes
- Icons: `lucide-react`

**How to Extend:**
```typescript
// Add custom theme
const customTheme = {
  regionColors: {
    default: "hsl(200, 70%, 50%)",
    selected: "hsl(200, 70%, 70%)",
  },
};

// Use in component
<Rect fill={customTheme.regionColors.default} />
```

---

## 🧪 Testing

### **Component Testing:**
```typescript
// Example: Test CellSelectionLayer
describe("CellSelectionLayer", () => {
  it("renders regions with unique colors", () => {
    // Test implementation
  });
  
  it("highlights selected region", () => {
    // Test implementation
  });
});
```

### **Integration Testing:**
```typescript
// Example: Test region creation flow
describe("Region Creation", () => {
  it("creates region and renders on canvas", async () => {
    // Test implementation
  });
});
```

---

## 📚 Related Documentation

- **Data Relationships:** `MAP_EDITOR_DATA_RELATIONSHIPS.md`
- **User Guide:** `MAP_EDITOR_USER_GUIDE.md`
- **Architecture:** `environment-editor-plan.md`
- **Coordinate System:** `coordinate-system-notes.md`

---

## ✅ Extension Checklist

When adding new features:

- [ ] Update component documentation
- [ ] Add TypeScript types
- [ ] Update state management (if needed)
- [ ] Add keyboard shortcuts (if applicable)
- [ ] Update user guide
- [ ] Add tests
- [ ] Update this document

---

This breakdown helps understand each component's role and how to extend the Environment Editor.


