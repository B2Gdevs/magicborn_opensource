# Coordinate System Architecture

## Core Principles

### 1. **Unreal Units (Meters) are the Source of Truth**

Everything calculates down to Unreal units (meters). Images are **just visual reference** - they get stretched to fit the coordinate configuration.

```typescript
// Example: World map
{
  imageWidth: 4096,      // Any size - just visual reference
  imageHeight: 4096,     // Gets stretched to fit config
  unrealWidth: 12000,    // 12km - THIS IS THE SOURCE OF TRUTH
  unrealHeight: 12000,   // 12km - THIS IS THE SOURCE OF TRUTH
  baseCellSize: 16,      // 16 pixels per cell (fixed)
}
```

**Key Point:** The image could be 1024×1024px or 8192×8192px - it doesn't matter. It gets stretched to match the coordinate config, and cells are always calculated based on `baseCellSize`.

### 2. **Fixed Cell Count Per Map Level**

Every map level has a **fixed number of cells** regardless of image size:

| Map Level | baseCellSize | Image Size | Cells Per Side | Total Cells |
|-----------|--------------|------------|----------------|-------------|
| World | 16px | Any (stretched) | `imageWidth / 16` | Fixed |
| Town | 10px | Any (stretched) | `imageWidth / 10` | Fixed |
| Interior | 8px | Any (stretched) | `imageWidth / 8` | Fixed |
| Small Interior | 5px | Any (stretched) | `imageWidth / 5` | Fixed |

**Example:**
- World map with 4096×4096px image: 256×256 = 65,536 cells
- World map with 1024×1024px image: 64×64 = 4,096 cells (same baseCellSize, fewer cells)
- World map with 8192×8192px image: 512×512 = 262,144 cells (same baseCellSize, more cells)

The cell count depends on the image size, but the **cell size in Unreal meters** is what matters.

### 3. **Cell Size in Meters (Unreal Units)**

Cells are tracked by their size in **Unreal meters**, not pixels:

```typescript
// Calculate cell size in meters
const cellSize = getCellSizeInUnrealMeters(config);
// Returns: { width: 46.875m, height: 46.875m } for world map
```

**Formula:**
```
Cell Size (meters) = baseCellSize × (unrealWidth / imageWidth)
```

**Example (World Map):**
- baseCellSize: 16px
- unrealWidth: 12000m (12km)
- imageWidth: 4096px
- Cell size: 16 × (12000 / 4096) = **46.875m × 46.875m**

### 4. **Hierarchical Granularity**

As you create nested maps (regions with maps), cells become **more granular** (smaller in Unreal meters):

```
World Map (Level 0)
├─ Cell: 47m × 47m
├─ Region: "tet" (11×11 cells = 517m × 517m)
│  └─ Nested Map (Level 1) - "tet" becomes base region
│     ├─ Cell: 9.8m × 9.8m (more granular!)
│     ├─ Region: "shop" (20×20 cells = 196m × 196m)
│     │  └─ Nested Map (Level 2) - "shop" becomes base region
│     │     └─ Cell: 3.9m × 3.9m (even more granular!)
```

**Key Insight:** Each nested level has:
- **Same baseCellSize in pixels** (e.g., 16px, 10px, 8px)
- **Smaller Unreal units per cell** (more granular)
- **Fixed cell count** for that map level

## Base Region Concept

### What is a Base Region?

The **base region** represents the region being edited in the current map. When you load a nested map:

1. **Parent region becomes base region** - If "tet" has a map, loading that map makes "tet" the base region
2. **Base region covers entire map** - It represents the full area being edited
3. **Other regions are created on top** - You create more regions within the base region

**Example Flow:**
```
1. World Map
   └─ Region: "tet" (11×11 cells)

2. Create nested map for "tet"
   └─ Map: "tet-map" (nested from "tet" region)

3. Load "tet-map"
   └─ "tet" becomes base region (covers entire map)
   └─ Create new regions on "tet-map":
      ├─ Region: "shop" (20×20 cells)
      ├─ Region: "home" (15×15 cells)
      └─ Region: "dungeon" (30×30 cells)

4. Create nested map for "shop"
   └─ Map: "shop-map" (nested from "shop" region)

5. Load "shop-map"
   └─ "shop" becomes base region (covers entire map)
   └─ Create new regions on "shop-map":
      ├─ Region: "counter" (5×5 cells)
      └─ Region: "storage" (8×8 cells)
```

## Image Stretching

Images are **always stretched** to fit the coordinate configuration:

```typescript
// MapCanvas.tsx
<KonvaImage
  image={mapImage}
  x={0}
  y={0}
  width={selectedMap.coordinateConfig.imageWidth}  // Stretched to config
  height={selectedMap.coordinateConfig.imageHeight} // Stretched to config
/>
```

**Why?**
- Images are just visual reference
- Cell selection is based on `baseCellSize`, not image dimensions
- Unreal units are the source of truth

**Example:**
- Upload 1024×1024px image for world map
- Config says imageWidth: 4096px
- Image gets stretched to 4096×4096px
- Cells are calculated: 4096 / 16 = 256 cells per side
- Each cell = 46.875m × 46.875m in Unreal

## Cell Selection

Cell selection is **independent of image size**:

```typescript
// pixelToCell() uses baseCellSize, not image dimensions
export function pixelToCell(pixel: PixelCoordinates, config: CoordinateSystemConfig): CellCoordinates {
  const cellSize = config.baseCellSize; // Always use baseCellSize
  return {
    cellX: Math.floor(pixel.x / cellSize),
    cellY: Math.floor(pixel.y / cellSize),
  };
}
```

**Key Point:** Clicking at pixel (240, 240) always selects cell (15, 15) for a world map (baseCellSize=16), regardless of whether the image is 1024×1024px or 8192×8192px (after stretching).

## Nested Map Configuration

When creating a nested map from a region:

```typescript
// Calculate nested map config
const nestedConfig = calculateNestedMapConfig(
  parentConfig,        // Parent map's config
  parentRegionCells,  // Cells that define the parent region
  "town",             // Nested map level (more granular)
  imageWidth,         // Optional - will be stretched
  imageHeight         // Optional - will be stretched
);
```

**What happens:**
1. Calculate parent region's Unreal size (cells × cell size in meters)
2. Create nested map with that Unreal size
3. Use more granular baseCellSize (e.g., 10px instead of 16px)
4. Result: More cells, smaller Unreal units per cell

**Example:**
- Parent region: 11×11 cells at 47m/cell = 517m × 517m
- Nested map: 2048×2048px image, baseCellSize=10px
- Cells: 2048 / 10 = 204 cells per side
- Cell size: 10 × (517 / 2048) = **2.52m × 2.52m** (much more granular!)

## Implementation

### Key Functions

```typescript
// lib/utils/cellSizeCalculator.ts

// Get cell size in Unreal meters (source of truth)
getCellSizeInUnrealMeters(config): { width: number, height: number }

// Get total cells for a map (fixed based on image size)
getTotalCells(config): { cellsX: number, cellsY: number, total: number }

// Calculate nested map config (more granular)
calculateNestedMapConfig(parentConfig, parentRegionCells, level, imageWidth?, imageHeight?)

// Format cell size for display
formatCellSizeInMeters(config): string // e.g., "47m" or "2.5m"
```

### Usage

```typescript
import { getCellSizeInUnrealMeters, formatCellSizeInMeters } from "@/lib/utils/cellSizeCalculator";

const config = selectedMap.coordinateConfig;
const cellSize = getCellSizeInUnrealMeters(config);
console.log(`Cell size: ${cellSize.width}m × ${cellSize.height}m`);
console.log(`Formatted: ${formatCellSizeInMeters(config)}`); // "47m"
```

## Best Practices

1. **Always use Unreal units for calculations** - Don't rely on pixel dimensions
2. **Track cell size in meters** - This is the primary metric
3. **Images are visual only** - They get stretched, don't worry about exact dimensions
4. **Fixed cell count per level** - Use standard baseCellSize values (16, 10, 8, 5)
5. **Nested maps get more granular** - Each level has smaller Unreal units per cell

## Related Documentation

- [GRID_SYSTEM.md](./GRID_SYSTEM.md) - Grid system and cell coordinates
- [MAP_SIZING_STANDARDS.md](./MAP_SIZING_STANDARDS.md) - Standard map sizes
- [coordinateSystem.ts](../../../lib/utils/coordinateSystem.ts) - Coordinate system implementation
- [cellSizeCalculator.ts](../../../lib/utils/cellSizeCalculator.ts) - Cell size calculations






