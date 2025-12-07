# Map Editor: Data Relationships & Workflow Guide

## 🎯 The Core Model

**World Map = Foundation with Default Environment**  
**Regions = Areas with Different Environment Properties**  
**Nested Maps = Detailed Views that Inherit from Regions**

---

## 📊 The Hierarchy

```
World Map
  ├── Default Environment: "World Environment" (baseline, stable)
  │   ├── Biome: (none/default)
  │   ├── Climate: (none/default)
  │   └── Danger Level: 0 (safe to travel)
  │
  └── Regions (Override World Environment)
      ├── Region: "Frozen Loom"
      │   ├── Environment Properties:
      │   │   ├── Biome: Mountain
      │   │   ├── Climate: Cold
      │   │   ├── Danger Level: 3
      │   │   └── Creatures: Ice Wolves, Frost Giants
      │   └── Nested Map: "Frozen Loom Map"
      │       ├── Inherits: Mountain, Cold, Danger 3
      │       └── Regions (can override again)
      │
      ├── Region: "Xingdom Huld"
      │   ├── Environment Properties:
      │   │   ├── Biome: Forest
      │   │   ├── Climate: Temperate
      │   │   ├── Danger Level: 1
      │   │   └── Creatures: Deer, Wolves
      │   └── Nested Map: "Xingdom Huld Map"
      │
      └── Region: "Mire of Echoes"
          ├── Environment Properties:
          │   ├── Biome: Swamp
          │   ├── Climate: Humid
          │   ├── Danger Level: 5
          │   └── Creatures: Swamp Monsters, Poisonous Snakes
          └── Nested Map: "Mire of Echoes Map"
```

**Key Insight:** World Map has a default environment. Regions override it with specific properties. Nested maps inherit from their parent region.

---

## 🏗️ Core Concepts

### **1. World Map = Foundation**

**What it is:**
- The starting point - where players begin
- Has a default "World Environment" (baseline properties)
- Contains multiple regions, each with different properties

**Default World Environment:**
- Biome: (none/default - neutral)
- Climate: (none/default - neutral)
- Danger Level: 0 (safe to travel)
- Creatures: (none - or basic wildlife)

**Properties:**
- `id`: "world-map"
- `name`: "World Map"
- `environmentId`: "world-environment" ← Default environment
- `coordinateConfig`: Image size, Unreal size, cell size
- `imagePath`: "/game-content/maps/world-map.png"

**When to create:**
- First thing you create
- This is your foundation

---

### **2. Region = Area with Different Environment**

**What it is:**
- A selection of cells on a map that defines an area
- **Overrides** the parent map's environment properties
- When player enters these cells → different environment applies

**Properties:**
- `id`: "frozen-loom-region"
- `mapId`: "world-map" ← Parent map
- `cells`: [{ cellX: 50, cellY: 30 }, ...] ← Selected cells
- `nestedMapId`: "frozen-loom-map" ← Link to nested map (if created)
- `color`: "hsl(120, 70%, 50%)" ← Unique color for this region
- `metadata`: {
    - `biome`: "Mountain" ← Overrides world default
    - `climate`: "Cold" ← Overrides world default
    - `dangerLevel`: 3 ← Overrides world default (0)
    - `creatures`: ["Ice Wolf", "Frost Giant"] ← Specific to this region
  }

**When to create:**
- When you want an area with different properties than the world default
- Example: Cold mountain area on otherwise temperate world map

**Key Point:** Regions **override** parent map's environment. World Map is safe (Danger 0), but Frozen Loom region is dangerous (Danger 3).

---

### **3. Nested Map = Detailed View**

**What it is:**
- A detailed view of a region
- **Inherits** environment properties from parent region
- Can have its own regions that override again

**Properties:**
- `id`: "frozen-loom-map"
- `parentMapId`: "world-map" ← Links to parent
- `parentCellCoordinates`: { cellX: 50, cellY: 30 } ← Where on parent
- `environmentId`: "frozen-loom-environment" ← Inherits from region
- `coordinateConfig`: Image size, Unreal size, cell size
- `imagePath`: "/game-content/maps/frozen-loom-map.png"

**Inherited Properties:**
- Biome: Mountain (from parent region)
- Climate: Cold (from parent region)
- Danger Level: 3 (from parent region)
- Creatures: Ice Wolves, Frost Giants (from parent region)

**When to create:**
- When you want a detailed view of a region
- Shows zoomed-in area with same environment properties

---

### **4. Placement = Item on Map**

**What it is:**
- A specific item placed on a map (prop, landmark, spawn point, etc.)
- Has precise coordinates and precision level

**Properties:**
- `id`: "lilaran-landmark"
- `mapId`: "frozen-loom-map" ← Parent map
- `type`: "landmark"
- `coordinates`: { cellX: 20, cellY: 15 } ← Position
- `precisionLevel`: "cell"
- `nestedMapId`: "lilaran-map" ← If landmark, links to nested map

**When to create:**
- When placing specific items (props, landmarks, spawn points)
- After maps are created

---

## 🔄 The Workflow: Step-by-Step

### **Step 1: Create World Map with Default Environment**

```
1. Go to "Maps" section
2. Click "+ New Map"
3. Fill in:
   - ID: "world-map"
   - Name: "World Map"
   - Type: "World Map" (12km × 12km)
   - Environment: "world-environment" (default)
     * Biome: (none/default)
     * Climate: (none/default)
     * Danger Level: 0 (safe)
   - Upload world map image (4096×4096px)
4. Click "Create"
```

**Result:** World Map created with default safe environment. Player can travel anywhere safely (unless they enter a region).

---

### **Step 2: Select Cells for Frozen Loom Region**

```
1. Select "World Map" from dropdown
2. Click "Cell Selection" tool (square icon - turns blue)
3. Click and DRAG on map to select cells covering "Frozen Loom" area
4. Selection shows blue highlight
5. Feedback panel shows:
   - Selected: 256 cells
   - Area: 2.5 km²
   - Recommended: Town level (2km × 2km)
```

**Result:** Cells selected, ready to create region with different environment.

---

### **Step 3: Create Region with Environment Properties**

```
1. In feedback panel, click "Create Region from Selection"
2. Fill in:
   - Name: "Frozen Loom"
   - Environment Properties:
     * Biome: "Mountain" ← Overrides world default
     * Climate: "Cold" ← Overrides world default
     * Danger Level: 3 ← Overrides world default (0)
     * Creatures: ["Ice Wolf", "Frost Giant"] ← Specific to this area
3. Click "Create"
```

**Result:** 
- Region created with unique color
- Environment properties override world default
- When player enters these cells → Cold, Mountain, Danger 3 applies

---

### **Step 4: Create Nested Map from Region**

```
1. Click on the "Frozen Loom" region (or select it from region list)
2. Click "Create Nested Map" button
3. Fill in:
   - Name: "Frozen Loom Map"
   - Type: "Town" (2km × 2km)
   - Environment: Inherits from "Frozen Loom" region
     * Biome: Mountain (inherited)
     * Climate: Cold (inherited)
     * Danger Level: 3 (inherited)
     * Creatures: Ice Wolves, Frost Giants (inherited)
   - Upload Frozen Loom map image (2048×2048px)
4. Click "Create"
```

**Result:**
- Nested map created
- Inherits all environment properties from parent region
- When player enters region cells → Frozen Loom Map loads with Cold, Mountain, Danger 3

---

### **Step 5: Add Region on Nested Map (Override Again)**

```
1. Select "Frozen Loom Map" from dropdown
2. Click "Cell Selection" tool
3. Select cells for "Warm Inn" building
4. Create Region:
   - Name: "Warm Inn"
   - Environment Properties:
     * Biome: "Interior" ← Overrides Mountain
     * Climate: "Warm" ← Overrides Cold (fire inside!)
     * Danger Level: 0 ← Overrides 3 (safe inside)
     * Creatures: [] ← Overrides (no creatures inside)
5. Create Nested Map from region
```

**Result:**
- Region on nested map overrides parent's properties
- Warm Inn is safe and warm, even though it's in a cold, dangerous mountain area
- Shows how properties can override at each level

---

## 🎮 Player Journey Example

### **Player starts on World Map**

```
Player Position: Cell (55, 35)
Current Map: World Map
Current Environment:
  - Biome: (default - neutral)
  - Climate: (default - neutral)
  - Danger Level: 0 (safe to travel)
  - Creatures: (none - or basic wildlife)
```

**Status:** Safe to travel, no special effects.

---

### **Player moves into Frozen Loom Region**

```
Player Position: Cell (60, 40) ← Inside Frozen Loom region cells
System checks: Is this cell in a region?
  → Yes! Cell (60, 40) is in "Frozen Loom" region
  → Region has environment properties that override world default
  
Environment Changes:
  - Biome: Mountain (was default)
  - Climate: Cold (was default)
  - Danger Level: 3 (was 0 - now dangerous!)
  - Creatures: Ice Wolves, Frost Giants (spawn now)
  
Frozen Loom Map loads (if nested map exists)
Current Map: Frozen Loom Map
Current Environment: (inherited from region)
  - Biome: Mountain
  - Climate: Cold
  - Danger Level: 3
  - Environmental effects: Cold damage over time, reduced visibility
  - Creatures: Ice Wolves, Frost Giants spawn
```

**Status:** Now in dangerous cold mountain area. Environmental effects apply.

---

### **Player enters Warm Inn Region**

```
Player Position: Cell (22, 17) ← Inside Warm Inn region cells
System checks: Is this cell in a region?
  → Yes! Cell (22, 17) is in "Warm Inn" region
  → Region has environment properties that override parent
  
Environment Changes:
  - Biome: Interior (was Mountain)
  - Climate: Warm (was Cold - fire inside!)
  - Danger Level: 0 (was 3 - now safe!)
  - Creatures: [] (was Ice Wolves, Frost Giants - none inside)
  
Warm Inn Map loads
Current Map: Warm Inn Map
Current Environment: (inherited from region)
  - Biome: Interior
  - Climate: Warm
  - Danger Level: 0
  - Environmental effects: None (warm and safe)
  - Creatures: None
```

**Status:** Now safe and warm inside building, even though outside is cold and dangerous.

---

## 📊 Visual Example: Complete Structure

```
World Map
  ├── Default Environment: "World Environment"
  │   ├── Biome: (default)
  │   ├── Climate: (default)
  │   ├── Danger Level: 0
  │   └── Creatures: (none)
  │
  ├── Region: "Frozen Loom" (cells 50,30-65,45)
  │   ├── Environment Override:
  │   │   ├── Biome: Mountain
  │   │   ├── Climate: Cold
  │   │   ├── Danger Level: 3
  │   │   └── Creatures: Ice Wolves, Frost Giants
  │   └── Nested Map: "Frozen Loom Map"
  │       ├── Inherits: Mountain, Cold, Danger 3
  │       └── Region: "Warm Inn" (cells 20,15-25,20)
  │           ├── Environment Override:
  │           │   ├── Biome: Interior
  │           │   ├── Climate: Warm
  │           │   ├── Danger Level: 0
  │           │   └── Creatures: []
  │           └── Nested Map: "Warm Inn Map"
  │               └── Inherits: Interior, Warm, Danger 0
  │
  ├── Region: "Xingdom Huld" (cells 100,50-120,70)
  │   ├── Environment Override:
  │   │   ├── Biome: Forest
  │   │   ├── Climate: Temperate
  │   │   ├── Danger Level: 1
  │   │   └── Creatures: Deer, Wolves
  │   └── Nested Map: "Xingdom Huld Map"
  │       └── Inherits: Forest, Temperate, Danger 1
  │
  └── Region: "Mire of Echoes" (cells 30,80-45,95)
      ├── Environment Override:
      │   ├── Biome: Swamp
      │   ├── Climate: Humid
      │   ├── Danger Level: 5
      │   └── Creatures: Swamp Monsters, Poisonous Snakes
      └── Nested Map: "Mire of Echoes Map"
          └── Inherits: Swamp, Humid, Danger 5
```

---

## 🎯 Key Relationships

### **World Map ↔ Default Environment**
- **One-to-One:** World Map has one default environment
- **Default Environment** = Baseline properties (safe, neutral)
- **Purpose:** Provides stable baseline for entire world

### **Map ↔ Regions**
- **One-to-Many:** One map can have many regions
- **Region `mapId`** links to parent map
- **Region `cells`** array defines which cells are in the region
- **Region `metadata`** overrides parent map's environment

### **Region ↔ Environment Properties**
- **One-to-One:** Each region has its own environment properties
- **Properties override** parent map's default environment
- **Properties include:** Biome, Climate, Danger Level, Creatures

### **Region ↔ Nested Map**
- **One-to-One:** One region can create one nested map
- **Region `nestedMapId`** links to nested map
- **Nested Map `parentMapId`** links back to parent
- **Nested Map inherits** region's environment properties

### **Nested Map ↔ Regions**
- **One-to-Many:** Nested map can have its own regions
- **Regions on nested map** can override parent's environment again
- **Allows:** Multiple levels of environment override

---

## 🔄 Property Inheritance & Override

### **The Flow:**

```
World Map (Default Environment)
  ├── Biome: (default)
  ├── Climate: (default)
  ├── Danger Level: 0
  └── Creatures: (none)
      │
      └── Region: "Frozen Loom" (OVERRIDES)
          ├── Biome: Mountain ← Override
          ├── Climate: Cold ← Override
          ├── Danger Level: 3 ← Override
          └── Creatures: Ice Wolves, Frost Giants ← Override
              │
              └── Nested Map: "Frozen Loom Map" (INHERITS)
                  ├── Biome: Mountain ← Inherited
                  ├── Climate: Cold ← Inherited
                  ├── Danger Level: 3 ← Inherited
                  └── Creatures: Ice Wolves, Frost Giants ← Inherited
                      │
                      └── Region: "Warm Inn" (OVERRIDES AGAIN)
                          ├── Biome: Interior ← Override
                          ├── Climate: Warm ← Override
                          ├── Danger Level: 0 ← Override
                          └── Creatures: [] ← Override
                              │
                              └── Nested Map: "Warm Inn Map" (INHERITS)
                                  ├── Biome: Interior ← Inherited
                                  ├── Climate: Warm ← Inherited
                                  ├── Danger Level: 0 ← Inherited
                                  └── Creatures: [] ← Inherited
```

**Rule:** 
- **Regions override** parent map's environment
- **Nested maps inherit** from their parent region
- **Can override again** with regions on nested maps

---

## ✅ Repeatable Workflow

### **Pattern: Create Region with Different Environment**

1. **Select Map** (World Map or Nested Map)
2. **Select Cells** (use Cell Selection tool, drag to select)
3. **Create Region** (click "Create Region from Selection")
4. **Set Environment Properties:**
   - Biome: (choose or override)
   - Climate: (choose or override)
   - Danger Level: (choose or override)
   - Creatures: (add specific creatures for this area)
5. **Create Nested Map** (optional - if you want detailed view)
6. **Repeat** on nested map if needed

### **Pattern: Override Environment at Each Level**

- **World Map:** Default safe environment
- **Region on World Map:** Override with specific properties
- **Nested Map:** Inherits from region
- **Region on Nested Map:** Override again with different properties
- **Nested Map of Region:** Inherits from parent region

---

## ❓ Common Questions

**Q: Why does World Map need a default environment?**
- Provides baseline properties for entire world
- Regions override it with specific properties
- Ensures there's always an environment (even if no regions)

**Q: Can regions have the same properties as world default?**
- Yes, but usually you create regions to have different properties
- If properties are same, you might not need a region

**Q: How do creatures work?**
- World Map default: (none or basic wildlife)
- Region: Specific creatures for that area
- When player enters region → those creatures spawn

**Q: Can I change environment properties later?**
- Yes! Edit region properties anytime
- Changes apply immediately to nested maps

**Q: What if I want multiple regions with same properties?**
- Create multiple regions with same environment properties
- Each region can have its own nested map

**Q: How deep can nesting go?**
- As deep as needed
- Each level can override environment properties
- Example: World → Region → Nested Map → Region → Nested Map → Region → Nested Map

---

## 🎨 Visual Guide: What You See

### **On World Map:**
- **Default environment** = Safe, neutral (unless in a region)
- **Colored regions** = Areas with different properties (each unique color)
- **Region boundaries** = Edges of region cells (highlighted)

### **On Nested Maps:**
- **Inherited environment** = From parent region
- **Regions** = Can override again
- **Placements** = Items on map

### **Mode Indicators:**
- **Blue border** = Cell Selection Mode
- **Orange border** = Placement Mode

---

## ✅ Checklist: Building Your World

- [ ] Create World Map with default environment
- [ ] Select cells for regions with different properties
- [ ] Create regions with environment overrides
- [ ] Create nested maps from regions
- [ ] Add regions on nested maps (override again)
- [ ] Place landmarks and props
- [ ] Test environment changes when entering regions

---

This structure ensures:
- ✅ Clear hierarchy (World Map → Regions → Nested Maps)
- ✅ Repeatable workflow (same pattern at each level)
- ✅ Environment override system (regions override, nested maps inherit)
- ✅ Flexible nesting (as deep as needed)
- ✅ Ready for Unreal Engine (boundaries = cell edges, properties = environment data)
