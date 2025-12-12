# Map Sizing Standards for Hierarchical Maps

## 🎯 Problem Statement

Different map levels (World → Town → Interior) have different scales:
- **World level:** Large cells → huge Unreal areas (for massive 3D models like entire towns)
- **Town level:** Medium cells → medium Unreal areas (for buildings, districts)
- **Interior level:** Small cells → small Unreal areas (for furniture, props)

**Key Principles:**
1. **Unreal units (meters) are the source of truth** - Everything calculates down to Unreal units
2. **Image sizes are flexible** - Images are just visual reference, they get stretched to fit the coordinate config
3. **Cell count depends on image size** - But cell size in Unreal meters is what matters
4. **Nested maps get more granular** - Each level has smaller Unreal units per cell

**Challenge:** A "cell" at world level = huge area, but a "cell" at interior level = small area. We need standardized sizing to ensure proper translation to Unreal Engine.

---

## 📐 Standard Map Levels & Sizing

### **Level 0: World Map** (Top Level)
**Purpose:** Massive overworld, entire regions, huge 3D models

**Standard Configuration:**
```typescript
{
  imageWidth: 4096,      // Any size - just visual reference (gets stretched)
  imageHeight: 4096,     // Any size - just visual reference (gets stretched)
  unrealWidth: 12000,    // 12km in Unreal units - SOURCE OF TRUTH
  unrealHeight: 12000,   // 12km in Unreal units - SOURCE OF TRUTH
  baseCellSize: 16,      // 16 pixels per cell (fixed)
  zoneSize: 16,          // 16 cells per zone
}
```

**Cell Size in Unreal (Calculated):**
- Cell size = `baseCellSize × (unrealWidth / imageWidth)`
- Example: `16 × (12000 / 4096) = 46.875m × 46.875m`
- 1 zone = ~750m × 750m (16 cells × 47m)

**Note:** Image size doesn't affect cell size in Unreal meters. A 1024×1024px image stretched to 4096×4096px still gives 46.875m × 46.875m cells.

**Use Cases:**
- Place huge 3D models (entire town as one model - wall + tree stump)
- Place landmarks (towns, dungeons, regions)
- Place spawn zones (large areas)
- **Example:** Tarro town as single 3D model placed at cell (50, 30) on world map

**Placement Sizing:**
- **Zone precision:** For spawn zones, large environmental effects (750m+ areas)
- **Cell precision:** For huge 3D models, landmarks (47m+ objects)
- **Pixel precision:** For large props, buildings (7.5m+ objects)
- **Unreal Direct:** For precise landmark placement

---

### **Level 1: Town/Region Map** (Nested from World)
**Purpose:** Towns, regions, medium-sized areas

**Standard Configuration:**
```typescript
{
  imageWidth: 2048,      // Any size - just visual reference (gets stretched)
  imageHeight: 2048,     // Any size - just visual reference (gets stretched)
  unrealWidth: 2000,     // 2km in Unreal units - SOURCE OF TRUTH
  unrealHeight: 2000,    // 2km in Unreal units - SOURCE OF TRUTH
  baseCellSize: 10,      // 10 pixels per cell (fixed)
  zoneSize: 10,          // 10 cells per zone
}
```

**Cell Size in Unreal (Calculated):**
- Cell size = `baseCellSize × (unrealWidth / imageWidth)`
- Example: `10 × (2000 / 2048) = 9.77m × 9.77m`
- 1 zone = ~98m × 98m (10 cells × 9.8m)

**Use Cases:**
- Place buildings, districts, medium 3D models
- Place landmarks (shops, homes, buildings)
- Place spawn points (player spawn, NPC spawn)
- **Example:** Building placed at cell (20, 15) on town map

**Placement Sizing:**
- **Zone precision:** For spawn zones, encounter areas (98m+ areas)
- **Cell precision:** For buildings, large props (9.8m+ objects)
- **Pixel precision:** For medium props, furniture (0.98m+ objects)
- **Unreal Direct:** For precise prop placement

---

### **Level 2: Interior/Building Map** (Nested from Town)
**Purpose:** Building interiors, shops, homes

**Standard Configuration:**
```typescript
{
  imageWidth: 1024,      // Any size - just visual reference (gets stretched)
  imageHeight: 1024,     // Any size - just visual reference (gets stretched)
  unrealWidth: 500,      // 500m in Unreal units - SOURCE OF TRUTH
  unrealHeight: 500,     // 500m in Unreal units - SOURCE OF TRUTH
  baseCellSize: 8,       // 8 pixels per cell (fixed)
  zoneSize: 8,           // 8 cells per zone
}
```

**Cell Size in Unreal (Calculated):**
- Cell size = `baseCellSize × (unrealWidth / imageWidth)`
- Example: `8 × (500 / 1024) = 3.91m × 3.91m`
- 1 zone = ~31m × 31m (8 cells × 3.9m)

**Use Cases:**
- Place rooms, furniture, small 3D models
- Place interactables (chests, doors, triggers)
- Place environmental modifiers (fire, cold zones)
- **Example:** Fire prop placed at Unreal Direct (250, 250, 100) in house interior

**Placement Sizing:**
- **Zone precision:** For room zones, environmental effects (31m+ areas)
- **Cell precision:** For furniture, large props (3.9m+ objects)
- **Pixel precision:** For small props, items (0.49m+ objects)
- **Unreal Direct:** For precise 3D prop placement (furniture, decorations)

---

### **Level 3: Small Interior Map** (Nested from Interior)
**Purpose:** Small rooms, closets, detailed spaces

**Standard Configuration:**
```typescript
{
  imageWidth: 512,       // or 1024 for high detail
  imageHeight: 512,      // or 1024 for high detail
  unrealWidth: 100,      // 100m in Unreal units
  unrealHeight: 100,     // 100m in Unreal units
  baseCellSize: 5,       // 5 pixels per cell
  zoneSize: 5,           // 5 cells per zone
}
```

**Cell Size in Unreal:**
- 1 cell = ~0.98m × 0.98m (5 pixels × 0.196 Unreal units per pixel)
- 1 zone = ~4.9m × 4.9m (5 cells × 0.98m)

**Use Cases:**
- Place small props, decorations
- Place precise 3D models (furniture, items)
- Place triggers, interactables
- **Example:** Health potion placed at Unreal Direct (50, 50, 10) on table

**Placement Sizing:**
- **Zone precision:** For small zones, trigger areas (4.9m+ areas)
- **Cell precision:** For small props, items (0.98m+ objects)
- **Pixel precision:** For tiny props, decorations (0.196m+ objects)
- **Unreal Direct:** For precise item placement (keys, potions, exact positions)

---

## 🏗️ Hierarchical Scaling Example: Tarro Town

### **World Map (Level 0)**
```
Map: "World Map"
Size: 4096×4096px → 12km × 12km Unreal
Cell Size: 16px → ~47m × 47m Unreal

Placement: Tarro Town (huge 3D model)
- Type: Landmark
- Position: Cell (50, 30)
- Model: Entire town as one 3D model (wall + tree stump)
- Size: ~47m × 47m (one cell)
- Links to: Nested map "Tarro Town"
```

### **Tarro Town Map (Level 1 - Nested)**
```
Map: "Tarro Town" (nested from World)
Size: 2048×2048px → 2km × 2km Unreal
Cell Size: 10px → ~9.8m × 9.8m Unreal

Placements:
- Building at Cell (20, 15) → Links to "Shop Interior" map
- Building at Cell (25, 20) → Links to "Home Interior" map
- Spawn point at Zone (1, 1) → Player spawn zone
```

### **Shop Interior Map (Level 2 - Nested)**
```
Map: "Shop Interior" (nested from Tarro Town)
Size: 1024×1024px → 500m × 500m Unreal
Cell Size: 8px → ~3.9m × 3.9m Unreal

Placements:
- Counter at Cell (10, 5)
- Fire prop at Unreal Direct (250, 250, 100) → Exact position
- Chest at Cell (15, 8)
```

### **Home Interior Map (Level 2 - Nested)**
```
Map: "Home Interior" (nested from Tarro Town)
Size: 1024×1024px → 500m × 500m Unreal
Cell Size: 8px → ~3.9m × 3.9m Unreal

Placements:
- Fire prop at Unreal Direct (200, 300, 100) → Warm zone
- Furniture at various cells
- Environmental modifier: "Warm" at Zone (1, 1)
```

---

## 📊 Standard Cell Size Reference

| Map Level | Image Size (Example) | Unreal Size | Cell Size (px) | Cell Size (Unreal) | Zone Size (Unreal) |
|-----------|---------------------|-------------|----------------|-------------------|-------------------|
| **World** | 4096×4096 (flexible) | 12km × 12km | 16px | ~47m × 47m | ~750m × 750m |
| **Town** | 2048×2048 (flexible) | 2km × 2km | 10px | ~9.8m × 9.8m | ~98m × 98m |
| **Interior** | 1024×1024 (flexible) | 500m × 500m | 8px | ~3.9m × 3.9m | ~31m × 31m |
| **Small Interior** | 512×512 (flexible) | 100m × 100m | 5px | ~0.98m × 0.98m | ~4.9m × 4.9m |

**Note:** Image sizes are flexible - they're just visual reference. Images get stretched to fit the coordinate config. Cell size in Unreal meters is calculated as `baseCellSize × (unrealWidth / imageWidth)`.

---

## ✅ Placement Size Validation

### **Validation Rules:**

1. **Item size must match map level:**
   - World level: Items should be 47m+ (use Cell precision or larger)
   - Town level: Items should be 9.8m+ (use Cell precision or larger)
   - Interior level: Items should be 3.9m+ (use Cell precision or larger)
   - Small Interior: Items should be 0.98m+ (use Cell precision or larger)

2. **Precision level appropriateness:**
   - Zone precision: For areas larger than zone size
   - Cell precision: For objects that fit within cell size
   - Pixel precision: For objects smaller than cell but larger than pixel
   - Unreal Direct: For objects smaller than pixel or exact placement

3. **Warnings:**
   - If item size < cell size: Warn "Item is smaller than cell size - consider using Unreal Direct precision"
   - If item size > zone size: Warn "Item is larger than zone size - consider using lower precision"
   - If precision too high for item: Warn "Precision is too high for this item size"

---

## 🔧 Implementation Requirements

### **1. Map Level Detection**
```typescript
enum MapLevel {
  World = "world",        // Level 0
  Town = "town",          // Level 1
  Interior = "interior",  // Level 2
  SmallInterior = "smallInterior", // Level 3
}

function detectMapLevel(config: CoordinateSystemConfig): MapLevel {
  // Detect based on unreal size and cell size
  if (config.unrealWidth >= 10000) return MapLevel.World;
  if (config.unrealWidth >= 1000) return MapLevel.Town;
  if (config.unrealWidth >= 200) return MapLevel.Interior;
  return MapLevel.SmallInterior;
}
```

### **2. Standard Config Generator**
```typescript
function getStandardConfig(
  level: MapLevel,
  imageWidth?: number,
  imageHeight?: number
): CoordinateSystemConfig {
  const standards = {
    [MapLevel.World]: {
      imageWidth: 4096,
      imageHeight: 4096,
      unrealWidth: 12000,
      unrealHeight: 12000,
      baseCellSize: 16,
      zoneSize: 16,
    },
    [MapLevel.Town]: {
      imageWidth: 2048,
      imageHeight: 2048,
      unrealWidth: 2000,
      unrealHeight: 2000,
      baseCellSize: 10,
      zoneSize: 10,
    },
    [MapLevel.Interior]: {
      imageWidth: 1024,
      imageHeight: 1024,
      unrealWidth: 500,
      unrealHeight: 500,
      baseCellSize: 8,
      zoneSize: 8,
    },
    [MapLevel.SmallInterior]: {
      imageWidth: 512,
      imageHeight: 512,
      unrealWidth: 100,
      unrealHeight: 100,
      baseCellSize: 5,
      zoneSize: 5,
    },
  };
  
  const standard = standards[level];
  return {
    imageWidth: imageWidth || standard.imageWidth,
    imageHeight: imageHeight || standard.imageHeight,
    unrealWidth: standard.unrealWidth,
    unrealHeight: standard.unrealHeight,
    baseCellSize: standard.baseCellSize,
    zoneSize: standard.zoneSize,
  };
}
```

### **3. Placement Size Validator**
```typescript
function validatePlacementSize(
  placement: MapPlacement,
  mapConfig: CoordinateSystemConfig
): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  const mapLevel = detectMapLevel(mapConfig);
  const cellSize = getUnrealSizeForPrecision(
    PrecisionLevel.Cell,
    mapConfig
  );
  
  // Check if item size is appropriate for map level
  if (placement.metadata?.sizeInUnreal) {
    const itemSize = placement.metadata.sizeInUnreal;
    const minCellSize = Math.min(cellSize.width, cellSize.height);
    
    if (itemSize.width < minCellSize || itemSize.height < minCellSize) {
      warnings.push(
        `Item size (${itemSize.width}m × ${itemSize.height}m) is smaller than cell size (${minCellSize}m). ` +
        `Consider using Unreal Direct precision for precise placement.`
      );
    }
  }
  
  // Check precision appropriateness
  const precisionSize = getUnrealSizeForPrecision(
    placement.precisionLevel,
    mapConfig
  );
  
  if (placement.metadata?.sizeInUnreal) {
    const itemSize = placement.metadata.sizeInUnreal;
    if (itemSize.width < precisionSize.width || itemSize.height < precisionSize.height) {
      warnings.push(
        `Precision level "${placement.precisionLevel}" may be too low for item size. ` +
        `Consider using higher precision or Unreal Direct.`
      );
    }
  }
  
  return {
    valid: warnings.length === 0,
    warnings,
  };
}
```

---

## 🎯 Unreal Engine Translation

### **Export Format (Standardized)**
```typescript
interface MapExport {
  mapId: string;
  mapLevel: MapLevel; // World, Town, Interior, SmallInterior
  coordinateConfig: CoordinateSystemConfig;
  
  // Unreal bounds (always in Unreal units)
  unrealBounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  
  // Cell/zone info for procedural generation
  cellSizeInUnreal: { width: number; height: number };
  zoneSizeInUnreal: { width: number; height: number };
  
  // Placements (all in Unreal units)
  placements: Array<{
    id: string;
    type: PlacementType;
    coordinates: UnrealCoordinates; // Always in Unreal units
    precisionLevel: PrecisionLevel;
    sizeInUnreal?: { width: number; height: number };
    // ... other data
  }>;
}
```

### **Unreal Procedural Generation**
```cpp
// Unreal receives standardized data
void SpawnContentFromMapExport(const MapExport& Export) {
    // Determine spawn method based on precision level
    for (const auto& Placement : Export.Placements) {
        switch (Placement.PrecisionLevel) {
            case PrecisionLevel::Zone:
                // Spawn randomly within zone bounds
                SpawnInZone(Placement, Export.ZoneSizeInUnreal);
                break;
            case PrecisionLevel::Cell:
                // Spawn at cell center (or random within cell)
                SpawnAtCell(Placement, Export.CellSizeInUnreal);
                break;
            case PrecisionLevel::Pixel:
                // Spawn at pixel position
                SpawnAtPosition(Placement.Coordinates);
                break;
            case PrecisionLevel::UnrealDirect:
                // Spawn at exact Unreal coordinates
                SpawnAtExactPosition(Placement.Coordinates);
                break;
        }
    }
}
```

---

## ✅ Success Criteria

1. **Standardized Sizing:**
   - ✅ Each map level has standard cell sizes
   - ✅ Cell sizes scale appropriately (World > Town > Interior)
   - ✅ Validation ensures items fit their level

2. **Proper Translation:**
   - ✅ All coordinates convert to Unreal units correctly
   - ✅ Cell sizes translate correctly per level
   - ✅ Export format is standardized

3. **Placement Validation:**
   - ✅ Warnings for inappropriate item sizes
   - ✅ Precision level recommendations
   - ✅ Size validation per map level

4. **Unreal Integration:**
   - ✅ Procedural generation can use standardized data
   - ✅ Spawn methods match precision levels
   - ✅ Models spawn at correct scales

---

## 🚀 Next Steps

1. **Update Map Presets** - Use standard configurations
2. **Add Map Level Detection** - Auto-detect level from config
3. **Add Placement Validation** - Validate sizes against map level
4. **Update Coordinate System** - Handle hierarchical scaling
5. **Create Export Format** - Standardized export with level info

