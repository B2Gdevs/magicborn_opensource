# Map Editor Data Structure Guide

## 🎯 Overview

This document explains how data is structured in the Map Editor system, how environments, maps, and placements relate to each other, and how to maintain this content effectively.

---

## 📊 Data Hierarchy

```
Environment (Top Level)
  ├── Metadata (biome, climate, danger level)
  ├── Map IDs (references to maps in this environment)
  └── Story IDs (associated stories)

Map (Playable Area)
  ├── Environment ID (parent environment)
  ├── Parent Map ID (if nested)
  ├── Parent Cell Coordinates (where this map is on parent)
  ├── Coordinate Config (image size, Unreal size, cell size)
  ├── Image Path (map image file)
  ├── Scene IDs (scenes within this map)
  ├── Connections (links to other maps)
  └── Environmental Modifiers (gameplay effects)

Map Placement (Item on Map)
  ├── Map ID (parent map)
  ├── Type (prop, landmark, spawn point, etc.)
  ├── Item ID (reference to asset definition)
  ├── Coordinates (varies by precision level)
  ├── Precision Level (zone, cell, pixel, unrealDirect)
  ├── Is Landmark (boolean)
  ├── Nested Map ID (if landmark, link to nested map)
  └── Metadata (additional data)
```

---

## 🏗️ Example: Frozen Loom Structure

### **1. Environment Definition**

```typescript
{
  id: "frozen-loom-environment",
  name: "Frozen Loom",
  description: "A cold, mountainous region in the north",
  imagePath: "/game-content/environments/frozen-loom.png",
  mapIds: ["frozen-loom-map"], // References to maps
  storyIds: ["frozen-loom-story"],
  metadata: {
    biome: "Mountain",
    climate: "Cold",
    dangerLevel: 3
  }
}
```

**Key Points:**
- Environment is a **container** for maps
- `mapIds` array references all maps in this environment
- Metadata defines environmental properties

---

### **2. World Map (Parent Map)**

```typescript
{
  id: "world-map",
  environmentId: "world-environment",
  name: "World Map",
  description: "The entire game world",
  imagePath: "/game-content/maps/world-map.png",
  coordinateConfig: {
    imageWidth: 4096,
    imageHeight: 4096,
    unrealWidth: 12000, // 12km
    unrealHeight: 12000,
    baseCellSize: 16,
    zoneSize: 16
  },
  // No parentMapId - this is a top-level map
  sceneIds: [],
  connections: [],
  environmentalModifiers: []
}
```

**Key Points:**
- Top-level map (no `parentMapId`)
- Large scale (12km × 12km)
- Contains cell selections that define regions

---

### **3. Cell Selection on World Map**

When you select cells on the world map covering "Frozen Loom":

```typescript
// Selected cells (stored in editor state)
selectedCells: [
  { cellX: 50, cellY: 30 },
  { cellX: 51, cellY: 30 },
  { cellX: 50, cellY: 31 },
  { cellX: 51, cellY: 31 },
  // ... more cells
]

// Converted to Unreal bounds
unrealBounds: {
  minX: 2350,  // Unreal units
  minY: 1410,
  maxX: 2820,
  maxY: 1880
}
```

**Key Points:**
- Cells are selected on parent map
- Converted to Unreal units for export
- Used to create nested map

---

### **4. Frozen Loom Map (Nested Map)**

```typescript
{
  id: "frozen-loom-map",
  environmentId: "frozen-loom-environment",
  parentMapId: "world-map", // Links to parent
  parentCellCoordinates: { cellX: 50, cellY: 30 }, // Where on parent
  name: "Frozen Loom",
  description: "The Frozen Loom region map",
  imagePath: "/game-content/maps/frozen-loom-map.png",
  coordinateConfig: {
    imageWidth: 2048,
    imageHeight: 2048,
    unrealWidth: 2000, // 2km (smaller than parent)
    unrealHeight: 2000,
    baseCellSize: 10, // Smaller cells
    zoneSize: 10
  },
  sceneIds: [],
  connections: [],
  environmentalModifiers: [
    {
      id: "cold-climate",
      name: "Cold Climate",
      type: "statusEffect",
      target: "player",
      value: -10, // Reduces player stats
      element: "ice"
    }
  ]
}
```

**Key Points:**
- `parentMapId` links to world map
- `parentCellCoordinates` shows where on parent map
- Smaller scale than parent (2km vs 12km)
- Can have different environmental modifiers

---

### **5. Landmark Placement (Lilaran on Frozen Loom Map)**

```typescript
{
  id: "lilaran-landmark",
  mapId: "frozen-loom-map", // Placed on Frozen Loom map
  type: "landmark",
  itemId: "town-landmark-asset",
  coordinates: { cellX: 20, cellY: 15 }, // Cell precision
  precisionLevel: "cell",
  isLandmark: true,
  landmarkType: "town",
  nestedMapId: "lilaran-map", // Links to nested map
  metadata: {
    name: "Lilaran",
    description: "A small town in Frozen Loom"
  }
}
```

**Key Points:**
- Placed on Frozen Loom map
- `nestedMapId` links to Lilaran map
- When player interacts → Lilaran map loads

---

### **6. Lilaran Map (Nested from Frozen Loom)**

```typescript
{
  id: "lilaran-map",
  environmentId: "frozen-loom-environment", // Same environment
  parentMapId: "frozen-loom-map", // Parent is Frozen Loom
  parentCellCoordinates: { cellX: 20, cellY: 15 }, // Where landmark is
  name: "Lilaran",
  description: "A small town in Frozen Loom",
  imagePath: "/game-content/maps/lilaran-map.png",
  coordinateConfig: {
    imageWidth: 1024,
    imageHeight: 1024,
    unrealWidth: 500, // 500m (even smaller)
    unrealHeight: 500,
    baseCellSize: 8,
    zoneSize: 8
  },
  sceneIds: [],
  connections: [],
  environmentalModifiers: [
    {
      id: "warm-interior",
      name: "Warm Interior",
      type: "statusEffect",
      target: "player",
      value: 5, // Increases player stats (warm inside)
      element: "fire"
    }
  ]
}
```

**Key Points:**
- Nested from Frozen Loom map
- Even smaller scale (500m vs 2km)
- Can override environmental modifiers (warm inside vs cold outside)

---

## 🔄 Data Flow: How It All Connects

### **Player Navigation Flow**

```
1. Player on World Map
   ↓ Enters Frozen Loom region (selected cells)
2. Frozen Loom Map loads
   - Environment: "Frozen Loom Environment"
   - Climate: Cold
   - Environmental Modifier: Cold Climate (active)
   ↓ Player clicks/interacts with Lilaran landmark
3. Lilaran Map loads
   - Environment: "Frozen Loom Environment" (same)
   - Climate: Cold (inherited, but overridden by modifier)
   - Environmental Modifier: Warm Interior (overrides cold)
   ↓ Player enters building
4. Building Interior Map loads
   - Environment: "Frozen Loom Environment" (same)
   - Climate: Warm (overridden)
   - Environmental Modifier: Warm Interior (active)
```

**Key Points:**
- Environment is consistent (Frozen Loom)
- Maps are nested (World → Frozen Loom → Lilaran → Building)
- Environmental modifiers can override parent properties
- Each map can have different scale and properties

---

## 📋 Data Maintenance Best Practices

### **1. Environment Management**

- **One environment per major region** (Frozen Loom, Xingdom Huld, etc.)
- **Environment contains all maps** in that region
- **Metadata is shared** across all maps in environment
- **Update environment** when region properties change

### **2. Map Hierarchy**

- **Top-level maps** have no `parentMapId`
- **Nested maps** always have `parentMapId` and `parentCellCoordinates`
- **Map scale decreases** as you go deeper (12km → 2km → 500m → 100m)
- **Each map level** has appropriate cell sizes

### **3. Placement Management**

- **Landmarks** link maps together (`nestedMapId`)
- **Props** are placed with appropriate precision levels
- **Spawn points** use zone precision for procedural spawns
- **All coordinates** convert to Unreal units for export

### **4. Coordinate Consistency**

- **Always use coordinate system utils** for conversions
- **Validate coordinates** before saving
- **Check precision levels** match item sizes
- **Export always in Unreal units** (no pixel coordinates)

---

## 🎯 Common Patterns

### **Pattern 1: Large Region (Frozen Loom)**

```
World Map (12km)
  → Cell Selection (defines region)
  → Frozen Loom Map (2km)
    → Landmark Placements (towns)
      → Town Maps (500m)
        → Building Landmarks
          → Building Interiors (100m)
```

### **Pattern 2: Small Area (Single Town)**

```
World Map (12km)
  → Landmark Placement (single town)
  → Town Map (2km)
    → Building Landmarks
      → Building Interiors (100m)
```

### **Pattern 3: Dungeon**

```
World Map (12km)
  → Landmark Placement (dungeon entrance)
  → Dungeon Map (500m)
    → Room Landmarks
      → Room Maps (100m)
```

---

## ✅ Data Validation Checklist

Before creating nested maps:

- [ ] Cell selection is valid (not empty, reasonable size)
- [ ] Recommended map level matches selection size
- [ ] No conflicts with existing placements
- [ ] Parent map has correct coordinate config
- [ ] Nested map scale is smaller than parent
- [ ] Environmental modifiers are appropriate

Before placing items:

- [ ] Map is selected
- [ ] Coordinates are within map bounds
- [ ] Precision level matches item size
- [ ] Item size is appropriate for map level
- [ ] For landmarks: nested map exists or will be created

---

## 🔧 Maintenance Workflow

1. **Create Environment** → Define region properties
2. **Create World Map** → Upload world map image
3. **Select Cells** → Define regions on world map
4. **Create Nested Maps** → For each selected region
5. **Place Landmarks** → Connect maps together
6. **Place Props** → Populate maps with content
7. **Validate** → Check all connections and coordinates
8. **Export** → Generate Unreal-ready data

---

This structure ensures:
- ✅ Clear hierarchy (World → Region → Town → Building)
- ✅ Consistent coordinate system
- ✅ Easy navigation between maps
- ✅ Maintainable data structure
- ✅ Ready for Unreal Engine import


