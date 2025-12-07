# Selection & Placement System Architecture

## 🎯 Overview

This document explains how **Selection** and **Placement** systems work together to create a data-driven world that translates seamlessly to Unreal Engine. Both systems use the same coordinate system foundation but serve different purposes in the content creation pipeline.

---

## 📐 The Two Systems

### **Selection System** - Defining AREAS/REGIONS
**Purpose:** Select cells/zones on the map to define regions, create nested environments, and set area properties.

**What it does:**
- Select individual cells or groups of cells
- Define regions with properties (biome, climate, environmental modifiers)
- Create nested maps/environments from selected cells
- Mark areas for procedural generation zones

**Data stored:**
- Cell coordinates: `{ cellX: number, cellY: number }`
- Zone coordinates: `{ zoneX: number, zoneY: number, zoneWidth: number, zoneHeight: number }`
- Converted to Unreal units for export

**Example use cases:**
- "Select cells (10,5) to (15,10) → Create nested environment 'Tarro Town'"
- "Select zone (2,1) → Set biome to 'Temperate', climate to 'Warm'"
- "Select cells → Mark as spawn zone for creatures"

---

### **Placement System** - Placing SPECIFIC ITEMS
**Purpose:** Place specific items (props, spawn points, landmarks) at precise positions on the map.

**What it does:**
- Place props (trees, rocks, buildings, furniture)
- Place spawn points (player spawn, NPC spawn, creature spawn)
- Place landmarks (entry points to nested maps)
- Place interactables (chests, doors, triggers)
- Place environmental modifiers (fire in house, cold outside)

**Data stored:**
- Coordinates vary by precision level:
  - **Zone precision:** `{ zoneX, zoneY, zoneWidth, zoneHeight }` - Large areas
  - **Cell precision:** `{ cellX, cellY }` - Grid cells
  - **Pixel precision:** `{ x, y }` - Pixel coordinates
  - **Unreal Direct:** `{ x, y, z }` - Direct Unreal units
- Always converted to Unreal units for export

**Example use cases:**
- "Place health potion at pixel (500, 300) with Unreal Direct precision"
- "Place landmark 'Tarro Town' at cell (10, 5) → Links to nested map"
- "Place spawn point at zone (2, 1) → Procedural spawn within zone"
- "Place fire prop at Unreal (6000, 3000, 100) → Exact position in house"

---

## 🔄 How They Work Together

### **Workflow Example: Creating a Nested Environment**

1. **Selection Phase:**
   ```
   User selects cells (10,5) to (15,10) on world map
   → Selection System stores: { cellX: 10, cellY: 5 } to { cellX: 15, cellY: 10 }
   → Converts to Unreal units: { x: 12000, y: 6000 } to { x: 18000, y: 12000 }
   ```

2. **Create Nested Environment:**
   ```
   User clicks "Create Environment from Selection"
   → Creates new environment "Tarro Town"
   → Creates nested map for "Tarro Town"
   → Stores parent cell coordinates: { cellX: 10, cellY: 5 }
   → Stores Unreal bounds: { minX: 12000, minY: 6000, maxX: 18000, maxY: 12000 }
   ```

3. **Placement Phase:**
   ```
   User opens nested map "Tarro Town"
   → Uses Placement System to place items:
     - Shop landmark at cell (5, 3)
     - Fire prop at Unreal (15000, 9000, 100) - inside house
     - Spawn point at zone (1, 1)
   → All placements stored with Unreal coordinates
   ```

4. **Export to Unreal:**
   ```
   Unreal Engine receives:
   - Region data: "Tarro Town" at Unreal (12000, 6000) to (18000, 12000)
   - Placement data: 
     - Shop landmark at Unreal (15000, 9000, 0)
     - Fire prop at Unreal (15000, 9000, 100)
     - Spawn zone at Unreal (12000, 6000) to (13200, 7200)
   → Procedural generation spawns content based on this data
   ```

---

## 🎮 Data-Driven Approach for Unreal Engine

### **Core Principle: Unreal Units = Source of Truth**

All data is stored and exported in **Unreal units** (1 unit = 1 cm in Unreal).

```
2D Map Image (pixels)
  ↓ [Selection/Placement System converts]
Unreal Units (stored in database)
  ↓ [Direct use - no conversion]
Unreal Engine (procedural generation)
```

### **Selection Data Structure (for Unreal)**

```typescript
interface CellSelection {
  // Cell coordinates (for display/editing)
  cells: Array<{ cellX: number; cellY: number }>;
  
  // Unreal bounds (for export)
  unrealBounds: {
    minX: number;  // Unreal units
    minY: number;  // Unreal units
    maxX: number;  // Unreal units
    maxY: number;  // Unreal units
  };
  
  // Region properties
  biome?: string;
  climate?: string;
  environmentalModifiers?: EnvironmentalModifier[];
  
  // Nested map link (if applicable)
  nestedMapId?: string;
}
```

### **Placement Data Structure (for Unreal)**

```typescript
interface MapPlacement {
  // Placement type
  type: PlacementType; // prop, spawnPoint, landmark, etc.
  itemId: string; // Reference to item definition
  
  // Coordinates (converted to Unreal units)
  coordinates: UnrealCoordinates; // Always in Unreal units for export
  precisionLevel: PrecisionLevel; // How precise the placement is
  
  // For landmarks
  isLandmark: boolean;
  nestedMapId?: string; // Link to nested map
  
  // Item-specific data
  metadata: {
    sizeInUnreal?: { width: number; height: number }; // For props
    spawnRadius?: number; // For spawn points
    // ... other item-specific data
  };
}
```

---

## 🎯 Precision Levels & When to Use Them

### **Zone Precision** (Low Precision - Large Areas)
**Use for:**
- Spawn zones (player spawn, creature spawn areas)
- Large environmental effects (weather zones, mana regeneration zones)
- Encounter areas (combat zones, exploration zones)

**Example:**
```
Placement: Spawn point at zone (2, 1)
→ Unreal bounds: (24000, 12000) to (36000, 24000) Unreal units
→ Procedural generation: Spawn player randomly within this zone
```

**When to use:**
- Item size > zone size in Unreal units
- You want procedural variation (random spawn within zone)
- Large areas that don't need exact placement

---

### **Cell Precision** (Medium Precision - Grid Cells)
**Use for:**
- Buildings, large props
- Landmarks (towns, dungeons, shops)
- Large interactive objects

**Example:**
```
Placement: Building at cell (50, 30)
→ Unreal position: (60000, 36000) Unreal units (center of cell)
→ Building size: 1200 x 1200 Unreal units (cell size)
```

**When to use:**
- Item size ≈ cell size in Unreal units
- You need approximate placement (within cell)
- Large objects that don't need pixel-perfect placement

---

### **Pixel Precision** (High Precision - Individual Pixels)
**Use for:**
- Medium-sized props (trees, rocks, furniture)
- Approximate item locations
- When cell precision is too large

**Example:**
```
Placement: Tree at pixel (500, 300)
→ Unreal position: (6000, 3600) Unreal units
→ Warning: "This placement covers 12m x 12m - may be imprecise for small items"
```

**When to use:**
- Item size < cell size but > pixel size in Unreal units
- You need better precision than cell but don't need exact placement
- Medium-sized items

---

### **Unreal Direct** (Maximum Precision - Direct Coordinates)
**Use for:**
- Small items (health potions, keys, small props)
- Critical placements (exact positions)
- Items that need precise positioning

**Example:**
```
Placement: Health potion at Unreal Direct (6000, 3000, 100)
→ Unreal position: (6000, 3000, 100) Unreal units (exact)
→ No conversion needed - direct coordinates
```

**When to use:**
- Item size < pixel size in Unreal units
- You need exact placement (no approximation)
- Critical items (keys, quest items, precise spawn points)

---

## 🏗️ Procedural Generation in Unreal Engine

### **How Unreal Uses Selection & Placement Data**

1. **Region Data (from Selection):**
   ```
   Unreal receives: "Tarro Town" region at Unreal (12000, 6000) to (18000, 12000)
   → Unreal creates region actor
   → Applies biome/climate properties
   → Sets environmental modifiers
   ```

2. **Placement Data (from Placement System):**
   ```
   Unreal receives placements with Unreal coordinates:
   - Spawn point at zone (2, 1) → Spawns player randomly within zone
   - Building at cell (50, 30) → Spawns building at cell center
   - Tree at pixel (500, 300) → Spawns tree at pixel position
   - Health potion at Unreal (6000, 3000, 100) → Spawns at exact position
   ```

3. **Procedural Spawning:**
   ```
   For each placement:
   - If precision = Zone: Spawn randomly within zone bounds
   - If precision = Cell: Spawn at cell center (or random within cell)
   - If precision = Pixel: Spawn at pixel position
   - If precision = Unreal Direct: Spawn at exact Unreal coordinates
   ```

---

## 🎨 Real-World Example: Cold Outside, Warm Inside

### **Scenario:**
- World map: Cold biome, winter climate
- Selected cells (10,5) to (12,7): House interior
- House has fire, so it's warm inside

### **Implementation:**

1. **Selection System:**
   ```
   Select cells (10,5) to (12,7) on world map
   → Create nested map "House Interior"
   → Set biome: "Indoor"
   → Set climate: "Warm" (overrides parent cold climate)
   → Store parent cell coordinates: { cellX: 10, cellY: 5 }
   ```

2. **Placement System:**
   ```
   On "House Interior" map:
   → Place fire prop at Unreal (15000, 9000, 100)
   → Place environmental modifier: "Warm" at zone (1, 1)
   → Place furniture props at various cells
   ```

3. **Export to Unreal:**
   ```
   Unreal receives:
   - Region: "House Interior" at Unreal (12000, 6000) to (14400, 8400)
   - Climate override: "Warm" (overrides parent "Cold")
   - Fire prop at Unreal (15000, 9000, 100)
   - Environmental modifier: "Warm" zone
   ```

4. **Unreal Behavior:**
   ```
   - Player enters house region → Climate changes to "Warm"
   - Fire prop spawns at exact position
   - Environmental modifier applies "Warm" effects
   - Player exits house → Climate returns to "Cold"
   ```

---

## 🔧 Implementation Requirements

### **Selection System Needs:**
1. **Cell Selection Tool**
   - Click to select individual cells
   - Drag to select cell ranges
   - Multi-select (Ctrl+Click, Shift+Click)
   - Visual highlight of selected cells

2. **Cell Selection State**
   ```typescript
   interface CellSelectionState {
     selectedCells: Array<{ cellX: number; cellY: number }>;
     selectionMode: "cell" | "placement";
     unrealBounds?: { minX, minY, maxX, maxY };
   }
   ```

3. **Selection Actions**
   - `selectCell(cellX, cellY)`
   - `selectCellRange(startCell, endCell)`
   - `clearSelection()`
   - `createEnvironmentFromSelection()`
   - `setRegionProperties(properties)`

### **Placement System Needs:**
1. **PlacementLayer Component**
   - Render placements as icons/markers
   - Show selection highlights
   - Hover tooltips
   - Transform handles

2. **Placement Tools**
   - Placement tool (P key) - Click to place
   - Select tool (V key) - Click to select
   - Move tool (M key) - Drag to move
   - Precision selector (1-4 keys)

3. **Placement State**
   ```typescript
   interface PlacementState {
     placements: MapPlacement[];
     selectedPlacementIds: string[];
     activeTool: "select" | "place" | "move";
     precisionLevel: PrecisionLevel;
   }
   ```

4. **Placement Actions**
   - `placeItem(type, coordinates, precision)`
   - `selectPlacement(id)`
   - `movePlacement(id, newCoordinates)`
   - `deletePlacement(id)`
   - `convertToUnrealCoordinates(placement)`

---

## 📊 Data Flow Diagram

```
User Action (2D Map Editor)
  ↓
Selection System OR Placement System
  ↓
Coordinate Conversion (pixel → Unreal units)
  ↓
Database Storage (Unreal units)
  ↓
Export to JSON (Unreal units)
  ↓
Unreal Engine Import
  ↓
Procedural Generation
  ↓
Spawn Content in Unreal World
```

---

## ✅ Success Criteria

**Selection System:**
- ✅ Can select cells/zones on map
- ✅ Selected cells visually highlighted
- ✅ Can create nested environments from selection
- ✅ Selection data converts to Unreal units
- ✅ Region properties (biome, climate) stored correctly

**Placement System:**
- ✅ Can place items with different precision levels
- ✅ Placements render on canvas
- ✅ Can select, move, delete placements
- ✅ All placements convert to Unreal units
- ✅ Precision warnings show when appropriate
- ✅ Export contains Unreal coordinates only

**Integration:**
- ✅ Selections create nested maps
- ✅ Placements go on nested maps
- ✅ Both systems use same coordinate system
- ✅ Export format ready for Unreal Engine
- ✅ Procedural generation can use exported data

---

## 🚀 Next Steps

1. **Implement Cell Selection System** (foundation)
2. **Implement Placement System** (core feature)
3. **Integrate Selection → Nested Maps** (workflow)
4. **Add Precision Warnings** (UX)
5. **Create Export Format** (Unreal integration)

