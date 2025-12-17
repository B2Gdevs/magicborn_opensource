# Coordinate System Summary

## Core Principles

### 1. **Unreal Units (Meters) = Source of Truth**

Everything calculates down to Unreal units (meters). Images are **just visual reference** - they get stretched to fit the coordinate configuration.

**Formula:**
```
Cell Size (meters) = baseCellSize × (unrealWidth / imageWidth)
```

**Example:**
- World map: `16px × (12000m / 4096px) = 46.875m × 46.875m per cell`
- Image could be 1024×1024px or 8192×8192px - doesn't matter, cell size in meters stays the same

### 2. **Image Sizes are Flexible**

Images are **always stretched** to fit the coordinate configuration:

```typescript
// MapCanvas.tsx
<KonvaImage
  image={mapImage}
  width={config.imageWidth}   // Stretched to config
  height={config.imageHeight}  // Stretched to config
/>
```

**Why?**
- Images are just visual reference
- Cell selection is based on `baseCellSize`, not image dimensions
- Unreal units are the source of truth

### 3. **Fixed Cell Count Per Map Level**

Cell count depends on image size, but follows a fixed formula:

```
Cells Per Side = Math.floor(imageWidth / baseCellSize)
Total Cells = Cells Per Side × Cells Per Side
```

**Example:**
- World map (baseCellSize=16):
  - 4096×4096px image → 256×256 = 65,536 cells
  - 1024×1024px image → 64×64 = 4,096 cells
  - **Same cell size in meters** (46.875m × 46.875m) regardless of image size!

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

### 5. **Base Region Concept**

The **base region** represents the region being edited in the current map:

1. **Parent region becomes base region** - If "tet" has a map, loading that map makes "tet" the base region
2. **Base region covers entire map** - It represents the full area being edited
3. **Other regions are created on top** - You create more regions within the base region

**Example:**
- World map has region "tet"
- Create nested map for "tet" → Map "tet-map"
- Load "tet-map" → "tet" becomes base region (covers entire "tet-map")
- Create new regions on "tet-map": "shop", "home", "dungeon"
- Repeat process to add more content

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

### Usage in Components

```typescript
// AreaInfoDisplay.tsx - Shows cell size in meters
<AreaInfoDisplay
  estimatedAreaInUnreal={area}
  coordinateConfig={map.coordinateConfig}  // Shows cell size
/>

// Displays:
// Area: 1.76 km²
// Cell Size: 47m (46.88m × 46.88m)
```

## Best Practices

1. **Always use Unreal units for calculations** - Don't rely on pixel dimensions
2. **Track cell size in meters** - This is the primary metric
3. **Images are visual only** - They get stretched, don't worry about exact dimensions
4. **Fixed cell count per level** - Use standard baseCellSize values (16, 10, 8, 5)
5. **Nested maps get more granular** - Each level has smaller Unreal units per cell

## Related Documentation

- [COORDINATE_SYSTEM_ARCHITECTURE.md](./COORDINATE_SYSTEM_ARCHITECTURE.md) - Detailed architecture
- [GRID_SYSTEM.md](./GRID_SYSTEM.md) - Grid system and cell coordinates
- [MAP_SIZING_STANDARDS.md](./MAP_SIZING_STANDARDS.md) - Standard map sizes


