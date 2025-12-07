# Unreal Engine Mapping & Data-Driven World Building

## 🎯 Overview

This document explains how our map editor system maps to Unreal Engine, compares our approach to **Witcher 3** and **Elden Ring**, and demonstrates how we achieve a data-driven workflow for creating and managing game worlds.

---

## 📊 Comparison: Witcher 3, Elden Ring, and Our System

### **Witcher 3: The Wild Hunt**

**Map Structure:**
- **World Map:** ~136 km² (13.6km × 10km) - Massive open world
- **Hierarchical Zones:** Velen, Novigrad, Skellige, Toussaint
- **Interior Maps:** Buildings, caves, dungeons (separate instances)
- **Asset Placement:** Hand-placed by artists, some procedural elements

**Approach:**
- Large hand-crafted world with detailed interiors
- Separate map instances for interiors
- Manual placement of most assets
- Some procedural vegetation/foliage

**Challenges:**
- Time-consuming manual placement
- Difficult to iterate on world layout
- Hard to maintain consistency across zones

---

### **Elden Ring**

**Map Structure:**
- **World Map:** ~79 km² (12km × 12km estimated) - Massive interconnected world
- **Hierarchical Zones:** Limgrave, Liurnia, Caelid, Altus Plateau, etc.
- **Interior Maps:** Legacy Dungeons (Stormveil, Raya Lucaria, etc.) - nested within world
- **Asset Placement:** Mix of hand-placed and procedural (enemies, items)

**Approach:**
- Massive interconnected world with seamless transitions
- Legacy Dungeons are nested areas within the world
- Hand-placed landmarks and structures
- Procedural enemy/item placement

**Challenges:**
- Complex world layout management
- Difficult to visualize entire world structure
- Iteration requires rebuilding large areas

---

### **Our System: Magicborn**

**Map Structure:**
- **World Map:** 12km × 12km (configurable) - Matches Elden Ring scale
- **Hierarchical Maps:** World → Town → Building → Room (fully nested)
- **Interior Maps:** Seamlessly nested within parent maps
- **Asset Placement:** Data-driven with precision levels

**Approach:**
- **Data-Driven:** All placements stored as data, not hand-placed in Unreal
- **Hierarchical:** True nested maps (town inside world, shop inside town)
- **Precision Levels:** Zone/Cell/Pixel/UnrealDirect for different item sizes
- **Procedural Ready:** Export data for Unreal to spawn procedurally

**Advantages:**
- ✅ Fast iteration (edit data, not rebuild in Unreal)
- ✅ Version control friendly (data files, not binary assets)
- ✅ Easy to visualize entire world structure
- ✅ Consistent coordinate system across all levels
- ✅ Procedural generation ready

---

## 🗺️ Map Scale Comparison

| Game | World Size | Our Equivalent | Cell Size (World) | Use Case |
|------|------------|----------------|------------------|----------|
| **Witcher 3** | ~136 km² | 13.6km × 10km | ~47m × 47m | Massive open world |
| **Elden Ring** | ~79 km² | 12km × 12km | ~47m × 47m | Interconnected world |
| **Our System** | Configurable | 12km × 12km (default) | ~47m × 47m | Matches Elden Ring scale |

**Key Insight:** Our default world map (12km × 12km) matches Elden Ring's scale, making it perfect for large open-world games.

---

## 🏗️ Hierarchical Map Structure

### **Witcher 3 Structure:**
```
World Map (Velen, Novigrad, Skellige)
  ├── Zone: Velen
  │   ├── Town: Crow's Perch (separate instance)
  │   └── Dungeon: Cave (separate instance)
  └── Zone: Novigrad
      └── Building: Tavern (separate instance)
```

**Limitation:** Interiors are separate instances, not truly nested.

---

### **Elden Ring Structure:**
```
World Map (Lands Between)
  ├── Region: Limgrave
  │   ├── Legacy Dungeon: Stormveil Castle (nested within world)
  │   │   ├── Area: Main Gate
  │   │   └── Area: Rampart Tower
  │   └── Landmark: Church of Elleh
  └── Region: Liurnia
      └── Legacy Dungeon: Raya Lucaria Academy (nested)
```

**Advantage:** Legacy Dungeons are nested within the world map.

---

### **Our System Structure:**
```
World Map (12km × 12km, 16px cells → 47m × 47m)
  ├── Landmark: Tarro Town (huge 3D model at cell level)
  │   └── Nested Map: Tarro Town (2km × 2km, 10px cells → 9.8m × 9.8m)
  │       ├── Landmark: Shop (building at cell level)
  │       │   └── Nested Map: Shop Interior (500m × 500m, 8px cells → 3.9m × 3.9m)
  │       │       └── Placement: Fire Prop (Unreal Direct precision)
  │       └── Landmark: Home (building at cell level)
  │           └── Nested Map: Home Interior (500m × 500m, 8px cells → 3.9m × 3.9m)
  │               ├── Placement: Fire Prop (warm zone)
  │               └── Placement: Furniture (cell precision)
  └── Landmark: Dungeon (dungeon at cell level)
      └── Nested Map: Dungeon Interior (500m × 500m, 8px cells → 3.9m × 3.9m)
```

**Advantage:** True hierarchical nesting with consistent coordinate system.

---

## 🔄 Data Flow: Editor → Unreal Engine

### **1. Content Creation (Our Editor)**

```
Map Editor (2D Image)
  ↓
User Places Items (Selection/Placement System)
  ↓
Coordinate Conversion (Pixel → Unreal Units)
  ↓
Database Storage (JSON/SQLite)
  ↓
Export to JSON (Unreal Units Only)
```

**Example:**
```typescript
// User clicks at pixel (500, 300) on world map
const pixel = { x: 500, y: 300 };
const unreal = pixelToUnreal(pixel, worldMapConfig);
// Result: { x: 1464, y: 878 } Unreal units

// Stored in database
{
  "id": "tarro-town-landmark",
  "type": "landmark",
  "coordinates": { "x": 1464, "y": 878 },
  "precisionLevel": "cell",
  "isLandmark": true,
  "nestedMapId": "tarro-town-map"
}
```

---

### **2. Export Format (Unreal-Ready)**

```typescript
interface MapExport {
  // Map metadata
  mapId: string;
  mapLevel: "world" | "town" | "interior" | "smallInterior";
  name: string;
  
  // Coordinate system (for reference)
  coordinateConfig: {
    imageWidth: number;
    imageHeight: number;
    unrealWidth: number;  // Always in Unreal units
    unrealHeight: number;
    baseCellSize: number;
    zoneSize: number;
  };
  
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
  
  // Placements (all coordinates in Unreal units)
  placements: Array<{
    id: string;
    type: "prop" | "spawnPoint" | "landmark" | "interactable" | "trigger";
    itemId: string; // Reference to asset definition
    
    // Coordinates (always in Unreal units)
    coordinates: {
      x: number; // Unreal units
      y: number; // Unreal units
      z?: number; // Unreal units (for 3D placement)
    };
    
    // Precision level (tells Unreal how to spawn)
    precisionLevel: "zone" | "cell" | "pixel" | "unrealDirect";
    
    // Item size (for validation)
    sizeInUnreal?: {
      width: number;  // Unreal units
      height: number; // Unreal units
      depth?: number; // Unreal units (for 3D)
    };
    
    // Landmark data (if applicable)
    isLandmark?: boolean;
    nestedMapId?: string; // Link to nested map export
    
    // Additional metadata
    metadata: Record<string, any>;
  }>;
  
  // Nested maps (if any)
  nestedMaps?: MapExport[];
}
```

---

### **3. Unreal Engine Import**

```cpp
// Unreal C++ Code
class AMapDataImporter : public AActor {
    GENERATED_BODY()
    
public:
    // Import map export JSON
    UFUNCTION(BlueprintCallable)
    void ImportMapData(const FString& JsonPath);
    
    // Spawn content based on placements
    void SpawnPlacements(const TArray<FPlacementData>& Placements);
    
private:
    // Spawn method based on precision level
    void SpawnPlacement(const FPlacementData& Placement) {
        switch (Placement.PrecisionLevel) {
            case EPrecisionLevel::Zone:
                // Spawn randomly within zone bounds
                SpawnInZone(Placement);
                break;
            case EPrecisionLevel::Cell:
                // Spawn at cell center (or random within cell)
                SpawnAtCell(Placement);
                break;
            case EPrecisionLevel::Pixel:
                // Spawn at pixel position
                SpawnAtPosition(Placement.Coordinates);
                break;
            case EPrecisionLevel::UnrealDirect:
                // Spawn at exact Unreal coordinates
                SpawnAtExactPosition(Placement.Coordinates);
                break;
        }
    }
    
    // Spawn in zone (procedural)
    void SpawnInZone(const FPlacementData& Placement) {
        FVector ZoneCenter = FVector(
            Placement.Coordinates.X,
            Placement.Coordinates.Y,
            Placement.Coordinates.Z
        );
        
        // Get zone size from map config
        FVector ZoneSize = GetZoneSize(Placement.MapLevel);
        
        // Spawn randomly within zone
        FVector RandomOffset = FVector(
            FMath::RandRange(-ZoneSize.X / 2, ZoneSize.X / 2),
            FMath::RandRange(-ZoneSize.Y / 2, ZoneSize.Y / 2),
            0
        );
        
        FVector SpawnLocation = ZoneCenter + RandomOffset;
        SpawnAsset(Placement.ItemId, SpawnLocation);
    }
    
    // Spawn at cell center
    void SpawnAtCell(const FPlacementData& Placement) {
        FVector CellCenter = FVector(
            Placement.Coordinates.X,
            Placement.Coordinates.Y,
            Placement.Coordinates.Z
        );
        
        // Optionally add small random offset within cell
        FVector CellSize = GetCellSize(Placement.MapLevel);
        FVector RandomOffset = FVector(
            FMath::RandRange(-CellSize.X / 4, CellSize.X / 4),
            FMath::RandRange(-CellSize.Y / 4, CellSize.Y / 4),
            0
        );
        
        FVector SpawnLocation = CellCenter + RandomOffset;
        SpawnAsset(Placement.ItemId, SpawnLocation);
    }
    
    // Spawn at exact position
    void SpawnAtExactPosition(const FPlacementData& Placement) {
        FVector ExactPosition = FVector(
            Placement.Coordinates.X,
            Placement.Coordinates.Y,
            Placement.Coordinates.Z
        );
        
        SpawnAsset(Placement.ItemId, ExactPosition);
    }
};
```

---

## 🎨 Asset Management Workflow

### **1. Asset Definition (In Our Editor)**

```typescript
// Asset Library (stored in database)
interface AssetDefinition {
  id: string; // e.g., "tarro-town-model", "fire-prop", "health-potion"
  name: string;
  type: "3dModel" | "prop" | "spawnPoint" | "interactable";
  
  // Unreal asset reference
  unrealAssetPath: string; // e.g., "/Game/Models/TarroTown"
  unrealBlueprintClass?: string; // Optional Blueprint class
  
  // Size in Unreal units (for validation)
  sizeInUnreal: {
    width: number;
    height: number;
    depth?: number;
  };
  
  // Recommended precision level
  recommendedPrecision: PrecisionLevel;
  
  // Metadata
  metadata: {
    category?: string;
    tags?: string[];
    description?: string;
  };
}
```

---

### **2. Placement Workflow**

```
1. Select Asset from Library
   ↓
2. Choose Map Level (World/Town/Interior)
   ↓
3. Place on Map (with precision level)
   ↓
4. Validation (size check, precision check)
   ↓
5. Save to Database (Unreal coordinates)
   ↓
6. Export to JSON (for Unreal import)
```

**Example:**
```typescript
// User places "Tarro Town" model on world map
const placement: MapPlacement = {
  id: "tarro-town-placement-1",
  mapId: "world-map-1",
  type: PlacementType.Landmark,
  itemId: "tarro-town-model", // Reference to asset definition
  coordinates: { cellX: 50, cellY: 30 }, // Cell precision
  precisionLevel: PrecisionLevel.Cell,
  isLandmark: true,
  nestedMapId: "tarro-town-map",
  metadata: {
    sizeInUnreal: { width: 47, height: 47 }, // Cell size
  }
};

// Convert to Unreal coordinates
const unrealCoords = cellToUnreal(placement.coordinates, worldMapConfig);
// Result: { x: 2350, y: 1410 } Unreal units

// Export includes Unreal coordinates
{
  "coordinates": { "x": 2350, "y": 1410, "z": 0 },
  "precisionLevel": "cell",
  "itemId": "tarro-town-model"
}
```

---

### **3. Unreal Asset Spawning**

```cpp
// Unreal Blueprint/C++ Code
void AMapDataImporter::SpawnAsset(const FString& ItemId, const FVector& Location) {
    // Load asset definition
    FAssetDefinition AssetDef = GetAssetDefinition(ItemId);
    
    // Load Unreal asset
    UClass* AssetClass = LoadClass<AActor>(
        nullptr,
        *AssetDef.UnrealAssetPath
    );
    
    if (AssetClass) {
        // Spawn actor at location
        AActor* SpawnedActor = GetWorld()->SpawnActor<AActor>(
            AssetClass,
            Location,
            FRotator::ZeroRotator
        );
        
        // Apply metadata
        if (SpawnedActor) {
            // Set custom properties from metadata
            ApplyMetadata(SpawnedActor, AssetDef.Metadata);
        }
    }
}
```

---

## 🗺️ Real-World Example: Building Tarro Town

### **Step 1: World Map (Level 0)**

```
Map: "World Map"
Size: 4096×4096px → 12km × 12km Unreal
Cell Size: 16px → 47m × 47m Unreal

Placement:
- Tarro Town (huge 3D model)
  - Type: Landmark
  - Position: Cell (50, 30) → Unreal (2350, 1410)
  - Model: "/Game/Models/Towns/TarroTown" (entire town as one model)
  - Size: 47m × 47m (one cell)
  - Links to: Nested map "Tarro Town"
```

**Export:**
```json
{
  "id": "tarro-town-landmark",
  "type": "landmark",
  "itemId": "tarro-town-model",
  "coordinates": { "x": 2350, "y": 1410, "z": 0 },
  "precisionLevel": "cell",
  "nestedMapId": "tarro-town-map"
}
```

**Unreal Spawn:**
```cpp
// Spawn at cell center (47m × 47m cell)
FVector CellCenter(2350, 1410, 0);
SpawnAsset("tarro-town-model", CellCenter);
```

---

### **Step 2: Tarro Town Map (Level 1 - Nested)**

```
Map: "Tarro Town" (nested from World)
Size: 2048×2048px → 2km × 2km Unreal
Cell Size: 10px → 9.8m × 9.8m Unreal

Placements:
- Shop Building
  - Type: Landmark
  - Position: Cell (20, 15) → Unreal (196, 147)
  - Model: "/Game/Models/Buildings/Shop"
  - Size: 9.8m × 9.8m (one cell)
  - Links to: Nested map "Shop Interior"

- Home Building
  - Type: Landmark
  - Position: Cell (25, 20) → Unreal (245, 196)
  - Model: "/Game/Models/Buildings/Home"
  - Size: 9.8m × 9.8m (one cell)
  - Links to: Nested map "Home Interior"

- Player Spawn Point
  - Type: SpawnPoint
  - Position: Zone (1, 1) → Unreal (98, 98)
  - Precision: Zone (procedural spawn within zone)
```

**Export:**
```json
{
  "placements": [
    {
      "id": "shop-building",
      "type": "landmark",
      "itemId": "shop-building-model",
      "coordinates": { "x": 196, "y": 147, "z": 0 },
      "precisionLevel": "cell",
      "nestedMapId": "shop-interior-map"
    },
    {
      "id": "player-spawn",
      "type": "spawnPoint",
      "itemId": "player-spawn-marker",
      "coordinates": { "x": 98, "y": 98, "z": 0 },
      "precisionLevel": "zone"
    }
  ]
}
```

**Unreal Spawn:**
```cpp
// Shop: Spawn at cell center
SpawnAsset("shop-building-model", FVector(196, 147, 0));

// Player spawn: Spawn randomly within zone (98m × 98m)
FVector ZoneCenter(98, 98, 0);
FVector RandomOffset = FVector(
    FMath::RandRange(-49, 49),
    FMath::RandRange(-49, 49),
    0
);
SpawnAsset("player-spawn-marker", ZoneCenter + RandomOffset);
```

---

### **Step 3: Shop Interior Map (Level 2 - Nested)**

```
Map: "Shop Interior" (nested from Tarro Town)
Size: 1024×1024px → 500m × 500m Unreal
Cell Size: 8px → 3.9m × 3.9m Unreal

Placements:
- Fire Prop
  - Type: Prop
  - Position: Unreal Direct (250, 250, 100)
  - Model: "/Game/Props/Fire/FireProp"
  - Size: 1m × 1m
  - Precision: Unreal Direct (exact position)

- Counter
  - Type: Prop
  - Position: Cell (10, 5) → Unreal (39, 19.5)
  - Model: "/Game/Props/Furniture/Counter"
  - Size: 3.9m × 1.5m
  - Precision: Cell (fits in cell)

- Chest
  - Type: Interactable
  - Position: Cell (15, 8) → Unreal (58.5, 31.2)
  - Model: "/Game/Props/Chests/WoodenChest"
  - Size: 1m × 1m
  - Precision: Unreal Direct (exact position)
```

**Export:**
```json
{
  "placements": [
    {
      "id": "fire-prop",
      "type": "prop",
      "itemId": "fire-prop-model",
      "coordinates": { "x": 250, "y": 250, "z": 100 },
      "precisionLevel": "unrealDirect",
      "sizeInUnreal": { "width": 1, "height": 1 }
    },
    {
      "id": "counter",
      "type": "prop",
      "itemId": "counter-model",
      "coordinates": { "x": 39, "y": 19.5, "z": 0 },
      "precisionLevel": "cell",
      "sizeInUnreal": { "width": 3.9, "height": 1.5 }
    }
  ]
}
```

**Unreal Spawn:**
```cpp
// Fire prop: Exact position
SpawnAsset("fire-prop-model", FVector(250, 250, 100));

// Counter: Cell center (with small random offset)
FVector CellCenter(39, 19.5, 0);
FVector RandomOffset = FVector(
    FMath::RandRange(-0.5, 0.5),
    FMath::RandRange(-0.5, 0.5),
    0
);
SpawnAsset("counter-model", CellCenter + RandomOffset);
```

---

## 🎯 Key Advantages of Our System

### **1. Data-Driven Workflow**

**Traditional (Witcher 3 / Elden Ring):**
- Artists place assets directly in Unreal
- Changes require rebuilding in Unreal
- Hard to version control
- Difficult to iterate

**Our System:**
- ✅ Edit data in our editor (fast iteration)
- ✅ Version control friendly (JSON/SQLite files)
- ✅ Easy to visualize entire world structure
- ✅ Export to Unreal when ready

---

### **2. Hierarchical Nesting**

**Traditional:**
- Interiors are separate instances
- Hard to maintain parent-child relationships
- Coordinate systems don't align

**Our System:**
- ✅ True hierarchical nesting (World → Town → Building → Room)
- ✅ Consistent coordinate system across all levels
- ✅ Easy to navigate between levels
- ✅ Parent-child relationships maintained in data

---

### **3. Precision Levels**

**Traditional:**
- All placements are exact positions
- No flexibility for procedural variation
- Hard to manage large areas

**Our System:**
- ✅ Zone precision: Procedural spawn within zones
- ✅ Cell precision: Spawn at cell center (with variation)
- ✅ Pixel precision: Approximate positions
- ✅ Unreal Direct: Exact positions when needed

---

### **4. Procedural Generation Ready**

**Traditional:**
- Hand-placed everything
- No data structure for procedural generation
- Hard to regenerate content

**Our System:**
- ✅ Export includes precision levels
- ✅ Unreal can spawn procedurally based on precision
- ✅ Easy to regenerate content from data
- ✅ Supports both hand-placed and procedural content

---

## 📋 Implementation Checklist

### **Editor Side:**
- [x] Map sizing standards (World/Town/Interior levels)
- [x] Coordinate system (pixel → Unreal conversion)
- [x] Precision levels (Zone/Cell/Pixel/UnrealDirect)
- [x] Placement validation (size checks)
- [ ] Asset library (3D model definitions)
- [ ] Export format (JSON with Unreal coordinates)
- [ ] Nested map navigation

### **Unreal Side:**
- [ ] Map data importer (JSON → Unreal)
- [ ] Precision-based spawning system
- [ ] Asset loader (load models from paths)
- [ ] Procedural spawn system (zone/cell precision)
- [ ] Nested map system (load nested maps on demand)

---

## 🚀 Next Steps

1. **Complete Asset Library** - Define 3D models and their properties
2. **Export System** - Generate Unreal-ready JSON exports
3. **Unreal Importer** - Import and spawn content in Unreal
4. **Procedural System** - Implement precision-based spawning
5. **Nested Map Loading** - Load nested maps on demand

---

## 📚 References

- **Witcher 3:** ~136 km² world, separate interior instances
- **Elden Ring:** ~79 km² world, nested Legacy Dungeons
- **Our System:** 12km × 12km default, true hierarchical nesting

**Key Insight:** Our system combines the best of both worlds - Witcher 3's detail with Elden Ring's interconnectedness, but with a data-driven approach that makes iteration and management much easier.

