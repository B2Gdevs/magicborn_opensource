# Environment & Map Relationship

## 🗺️ What is an Environment?

An **Environment** is a **top-level location/region** in the game world. Think of it as a major area or biome.

**Examples:**
- "Tarro" - The main town region
- "Wildlands" - Dangerous wilderness area
- "Beanstalk Stump" - A specific landmark region
- "The Cursed Forest" - A biome with specific gameplay effects

## 📍 What is a Map?

A **Map** is a **specific playable area** within an environment. Maps can be nested hierarchically.

**Examples:**
- World Map (entire game world) - belongs to "Global" environment
- Tarro Town Map - belongs to "Tarro" environment
- Blacksmith Shop Map - nested inside Tarro Town Map
- Player Home Map - nested inside Tarro Town Map

## 🔗 How They Work Together

### Hierarchy Structure

```
Environment: "Tarro"
├── Map: "Tarro Town" (environmentId: "tarro")
│   ├── Map: "Blacksmith Shop" (parentMapId: "tarro-town", environmentId: "tarro")
│   ├── Map: "General Store" (parentMapId: "tarro-town", environmentId: "tarro")
│   └── Map: "Player Home" (parentMapId: "tarro-town", environmentId: "tarro")
└── Map: "Tarro Outskirts" (environmentId: "tarro")
```

### Data Relationship

1. **Environment → Maps (One-to-Many)**
   - Environment has `mapIds: string[]` - list of all maps in this environment
   - Map has `environmentId: string` - which environment it belongs to

2. **Map → Map (Parent-Child, Optional)**
   - Map can have `parentMapId?: string` - if nested, which map contains it
   - Map can have `parentCellCoordinates?: CellCoordinates` - where it's placed on parent

### Why This Matters

**Environments provide:**
- **Global context** - Biome, climate, danger level
- **Story associations** - Environment-level stories
- **Ambient effects** - Global modifiers (mana regen, element bonuses)
- **Organization** - Group related maps together

**Maps provide:**
- **Playable areas** - Where players actually explore
- **Coordinate systems** - Pixel-to-Unreal translation
- **Placements** - Props, spawn points, interactables
- **Nested structure** - Click into cells to enter nested maps

## 🎮 Use Cases

### Example: Creating "Tarro" Environment

1. **Create Environment:**
   - ID: `tarro`
   - Name: "Tarro"
   - Biome: "Town"
   - Climate: "Temperate"
   - Danger Level: 1 (safe)

2. **Create Maps in Environment:**
   - `tarro-town` - Main town map (environmentId: "tarro")
   - `tarro-outskirts` - Surrounding area (environmentId: "tarro")
   - `tarro-dungeon` - Underground area (environmentId: "tarro")

3. **Create Nested Maps:**
   - `blacksmith-shop` - Nested in `tarro-town` (parentMapId: "tarro-town")
   - `player-home` - Nested in `tarro-town` (parentMapId: "tarro-town")

### In Game

- **Fast Travel:** "Travel to Tarro" → shows all maps in Tarro environment
- **Story Branching:** "You arrive in Tarro" → environment-level story triggers
- **Global Effects:** "In Tarro, mana regenerates 20% faster" → environment modifier
- **Map Navigation:** Click on town cell → enter nested town map

## 📋 Current Status

✅ **Completed:**
- Environment & Map data structures
- Database schemas
- API routes & clients
- Map creation form with environment selector
- Map canvas with zoom/pan/grid

⏳ **Next Steps:**
1. **Environment Manager UI** - Create/edit environments
2. **Placement System** - Place props, spawn points on maps
3. **Nested Map Navigation** - Click into cells to edit nested maps
4. **Landmark System** - Mark cells as landmarks that link to nested maps


