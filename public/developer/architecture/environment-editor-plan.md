# Environment Editor - Requirements & Design Plan

## Overview
The Environment Editor will manage all location-based game data: environments, maps, scenes, props, and environmental modifiers that affect gameplay (combat, exploration, story).

---

## 1. Core Data Structures

### 1.1 Environment Definition
**What it is:** A top-level location/region in the game world (e.g., "Tarro", "Beanstalk Stump", "Wildlands")

**Fields:**
- `id: string` - Unique identifier (e.g., "tarro", "wildlands")
- `name: string` - Display name
- `description: string` - Lore/description
- `imagePath?: string` - Main environment image/thumbnail
- `mapIds: string[]` - Associated maps within this environment
- `ambientEffects?: EnvironmentalModifier[]` - Global modifiers (mana regeneration, element affinity bonuses, etc.)
- `storyIds: string[]` - Associated story files (like characters/creatures - simple markdown associations)
- `metadata: { biome: string, climate: string, dangerLevel: number }` - Classification data

**Use Cases:**
- World map navigation
- Fast travel system
- Story branching based on location
- Global environmental effects

---

### 1.2 Map Definition (Hierarchical)
**What it is:** A specific playable area within an environment. Maps can be nested (World → Town → Shop → Home).

**Fields:**
- `id: string` - Unique identifier
- `environmentId: string` - Parent environment
- `parentMapId?: string` - If nested map, reference to parent map
- `parentCellCoordinates?: CellCoordinates` - Where this map is placed on parent (cell coordinates)
- `name: string` - Display name
- `description: string` - Area description
- `imagePath?: string` - Map image/background (2D reference image, lower resolution for nested maps)
- `unrealMapSize: { width: number, height: number }` - Size in Unreal units (e.g., 12km x 12km = 12000 x 12000)
- `imageDimensions: { width: number, height: number }` - Pixel dimensions of reference image
- `coordinateConfig: CoordinateSystemConfig` - Mapping between pixels and Unreal units
- `sceneIds: string[]` - Scenes within this map
- `placements: MapPlacement[]` - All placed items (props, spawn points, interactables, landmarks) with coordinates
- `connections: MapConnection[]` - Links to other maps (doors, paths, etc.)
- `environmentalModifiers?: EnvironmentalModifier[]` - Map-specific effects

**Hierarchical Structure:**
- **World Map:** Top-level map (e.g., entire game world)
- **Town Map:** Nested map placed on world map (click into town cell)
- **Shop Map:** Nested map placed on town map (click into shop cell)
- **Home Map:** Nested map placed on town map (click into home cell)

**Coordinate System:**
- Maps 2D image pixels to Unreal world coordinates
- Handles different precision levels (zone-level vs pixel-level)
- Calculates Unreal unit equivalents for visualization
- Core math in `lib/utils/coordinateSystem.ts`

**Use Cases:**
- World map with towns/dungeons
- Town maps with shops/homes
- Shop/home interiors
- Combat encounter locations
- Exploration areas

---

### 1.3 Scene Definition
**What it is:** A specific camera/view setup or narrative moment within a map (e.g., "Campfire Scene", "Marketplace Entrance", "Boss Arena")

**Fields:**
- `id: string` - Unique identifier
- `mapId: string` - Parent map
- `name: string` - Display name
- `description: string` - Scene description
- `type: SceneType` - `"combat" | "narrative" | "exploration" | "transition"`
- `cameraSettings?: CameraSettings` - View angle, zoom, focus point
- `lighting: LightingSettings` - Ambient light, color, intensity
- `props: SceneProp[]` - Props visible in this scene (references to Prop definitions)
- `triggers: SceneTrigger[]` - Events that activate in this scene
- `backgroundMusic?: string` - Audio track ID
- `environmentalModifiers?: EnvironmentalModifier[]` - Scene-specific effects
- `combatSettings?: CombatSceneSettings` - If combat scene, specific rules

**Why Scenes Matter:**
- **Combat Scenes:** Different arenas with different environmental hazards (fire pits, ice patches, mana wells)
- **Narrative Scenes:** Story moments with specific camera angles and lighting
- **Exploration Scenes:** Areas where players can interact with props, find items
- **Transition Scenes:** Smooth movement between maps

**Recommendation:** YES, include scenes. They're essential for:
1. **Combat variety** - Different environmental hazards per scene
2. **Storytelling** - Cinematic moments
3. **Gameplay depth** - Scene-specific interactions

---

### 1.4 Map Placement (with Landmarks)
**What it is:** Any item placed on a map. Most placements are **landmarks** that link to nested maps.

**Fields:**
- `id: string` - Unique identifier
- `mapId: string` - Parent map
- `type: PlacementType` - Enum: `Prop | SpawnPoint | Interactable | Zone | Trigger | Landmark`
- `itemId: string` - Reference to prop/spawn point/interactable definition
- `coordinates: PlacementCoordinates` - Position data (varies by precision level)
- `precisionLevel: PrecisionLevel` - Enum: `Zone | Cell | Pixel | UnrealDirect`
- `isLandmark: boolean` - Most placements are landmarks
- `landmarkType?: LandmarkType` - Enum: `Town | Dungeon | Shop | Home | Building | Cave | Ruin | Other`
- `nestedMapId?: string` - If landmark, link to nested map
- `metadata: Record<string, any>` - Type-specific data

**Landmarks:**
- **Most placements are landmarks** (towns, dungeons, shops, homes)
- Clicking a landmark opens its nested map editor
- Landmarks have visual indicators (different icons)
- Nested maps can have lower resolution images

**Placement Coordinates (varies by precision):**
- **Zone-level:** `{ zoneX: number, zoneY: number, zoneWidth: number, zoneHeight: number }` - Large area (e.g., spawn zone)
- **Cell-level:** `{ cellX: number, cellY: number }` - Grid cell (e.g., building placement)
- **Pixel-level:** `{ pixelX: number, pixelY: number }` - Exact pixel (e.g., precise item)
- **Unreal-level:** `{ unrealX: number, unrealY: number, unrealZ?: number }` - Direct Unreal coordinates

**Precision Levels:**
- **Zone (Low Precision):** For spawn zones, encounter areas, large regions
  - Example: "Spawn zone covers 100x100 pixels = 140m x 140m in Unreal"
  - Use for: Creature spawn areas, encounter zones, large environmental effects
  
- **Cell (Medium Precision):** For grid-based placement
  - Example: "Cell is 10x10 pixels = 14m x 14m in Unreal"
  - Use for: Buildings, large props, landmarks
  
- **Pixel (High Precision):** For exact placement
  - Example: "1 pixel = 1.4m in Unreal"
  - Use for: Small items, precise spawns (but be aware of limitations)
  
- **Unreal (Direct):** Direct Unreal unit coordinates
  - Use for: Critical placements where pixel precision isn't enough

### 1.5 Prop Definition (Reference Data)
**What it is:** Template/definition for props (not the placement itself)

**Fields:**
- `id: string` - Unique identifier
- `name: string` - Display name
- `description: string` - What it is/does
- `type: PropType` - `"decorative" | "interactive" | "hazard" | "resource" | "trigger"`
- `imagePath?: string` - Prop image/sprite
- `modelPath?: string` - 3D model reference (if applicable)
- `recommendedPrecision: PrecisionLevel` - Suggested precision level for placement
- `sizeInUnrealUnits: { width: number, height: number, depth?: number }` - Physical size
- `interactionData?: InteractionData` - What happens when interacted with
- `environmentalEffects?: EnvironmentalModifier[]` - Effects this prop provides
- `health?: number` - If destructible
- `tags: string[]` - Searchable tags

**Interaction Types:**
- **Decorative:** Just visual (trees, rocks, buildings)
- **Interactive:** Can be clicked/used (chests, NPCs, doors)
- **Hazard:** Damages players (fire pits, spikes, cursed zones)
- **Resource:** Provides something (mana wells, healing springs, item spawns)
- **Trigger:** Activates events (pressure plates, rune stones, story triggers)

**Use Cases:**
- Visual world building
- Gameplay mechanics (mana regeneration, damage zones)
- Story triggers
- Loot/interaction points

---

### 1.5 Environmental Modifier
**What it is:** A gameplay effect tied to an environment/map/scene/prop (e.g., "Fire Affinity +10%", "Mana Regen +5/sec", "Ice Damage -20%")

**Fields:**
- `id: string` - Unique identifier
- `name: string` - Display name
- `type: ModifierType` - `"affinity" | "manaRegen" | "damageResist" | "damageBonus" | "statusEffect" | "custom"`
- `target: ModifierTarget` - `"player" | "creature" | "all" | "spell"`
- `value: number` - Magnitude
- `element?: DamageType` - If element-specific
- `duration?: number` - If temporary (in seconds)
- `conditions?: ModifierCondition[]` - When it applies (e.g., "only in combat", "only at night")

**Use Cases:**
- Mana regeneration zones (Tarro's inner sanctum)
- Element affinity bonuses (fire areas boost fire spells)
- Damage resistance (ice areas reduce ice damage)
- Cursed zone effects (warp mana, cause instability)

---

## 2. Editor Features

### 2.1 Environment Manager
**Tab:** Main list of environments
- Create/edit/delete environments
- Associate maps, stories, images
- Set global environmental modifiers
- View environment hierarchy

---

### 2.2 Map Editor
**Tab:** Grid-based visual map editor with precision levels

**Core Features:**

**1. Canvas & Navigation:**
- **2D Canvas:** Display map image as background
- **Pan:** Click and drag to move around map
- **Zoom:** Mouse wheel or zoom controls (zoom in/out)
- **Grid System:** Dynamic grid that adjusts with zoom level
  - Low zoom: Large grid cells (zone-level)
  - Medium zoom: Medium grid cells (cell-level)
  - High zoom: Small grid cells (pixel-level)
  - Maximum zoom: Individual pixels selectable

**2. Coordinate System:**
- **Map Size Configuration:** Set Unreal map size (e.g., 12km x 12km = 12000 x 12000 units)
- **Image Dimensions:** Set reference image pixel dimensions
- **Coordinate Calculator:** Real-time display of:
  - Current pixel coordinates
  - Equivalent Unreal coordinates
  - Precision level (zone/cell/pixel)
  - Unreal unit size at current zoom level

**3. Precision Levels & Placement:**
- **Precision Selector:** Choose placement precision (Zone/Cell/Pixel/Unreal)
- **Multi-Cell Selection:** Click and drag to select multiple cells
- **Placement Tool:** 
  - Select precision level
  - Select item (prop, spawn point, etc.)
  - Click/drag on map to place
  - Shows preview of Unreal coordinate range
- **Precision Warnings:** 
  - Warn if placing small item (e.g., health potion) at low precision
  - Show "This placement covers X meters in Unreal - may be imprecise"
  - Suggest higher precision for small items

**4. Placement Types:**
- **Props:** Place decorative/interactive objects
- **Spawn Points:** Mark creature/character spawn locations
- **Interactables:** NPCs, items, triggers
- **Zones:** Large areas (spawn zones, encounter areas, environmental effects)
- **Connections:** Links to other maps

**5. Visualization:**
- **Coordinate Overlay:** Show pixel/Unreal coordinates on hover
- **Precision Indicator:** Show current precision level and Unreal unit size
- **Placement Preview:** Preview what will be placed before confirming
- **Unreal Size Visualization:** Show "This area = X meters in Unreal" for selected cells
- **Different Map Size Preview:** Toggle between different Unreal map sizes to see coordinate implications

**6. Data Management:**
- **Placement Data:** Save all placements with coordinates and precision levels
- **Export to Unreal:** Generate coordinate data for Unreal import
- **Import/Export:** JSON format for version control
- **Templates:** Save/load map templates

**Precision Handling:**
- **Small Items (e.g., health potion):** 
  - Warn if placed at low precision
  - Suggest using "Unreal Direct" coordinates for critical placements
  - Or use "spawn zone" approach: place in zone, let Unreal code handle exact placement within zone
  
- **Large Items (e.g., building):** 
  - Can use cell-level precision
  - Show Unreal coordinate range
  
- **Critical Placements:**
  - Use "Unreal Direct" mode for exact coordinates
  - Bypass pixel-to-Unreal conversion
  - Directly specify Unreal units

---

### 2.3 Scene Editor
**Tab:** Scene configuration and preview

**Features:**
- **Scene List:** All scenes in selected map
- **Scene Properties:** Edit camera, lighting, modifiers
- **Prop Assignment:** Assign props to scenes (with positions)
- **Trigger Editor:** Define scene events
- **Combat Settings:** If combat scene, configure hazards/rules
- **Preview Mode:** See scene as player would

**Scene Types:**
- **Combat:** Arena with hazards, modifiers
- **Narrative:** Story moment with camera/lighting
- **Exploration:** Interactive area
- **Transition:** Movement between areas

---

### 2.4 Prop Library (Simplified)
**Tab:** Browse and select props for placement (no separate editor for now)

**Features:**
- **Prop Library:** Browse all props (filterable by type/tags)
- **Prop Selection:** Click prop to select for placement in Map Editor
- **Prop Preview:** See prop image/model
- **Prop Info:** View prop metadata (size, type, recommended precision)
- **Prop Sets:** Filter by prop sets/packs (e.g., "Tarro Props", "Wildlands Props")

**Note:** Prop creation/editing can be added later. For now, focus on placement in Map Editor.

---

### 2.5 Environmental Modifier Editor
**Tab:** Create and manage gameplay modifiers

**Features:**
- **Modifier Library:** All modifiers (filterable by type)
- **Modifier Editor:** Create/edit modifier definitions
- **Assignment Tool:** Assign modifiers to environments/maps/scenes/props
- **Preview Effects:** See how modifiers affect gameplay
- **Testing:** Test modifier combinations

---

## 3. Additional Recommendations

### 3.1 Map Templates
**Why:** Speed up creation of similar maps

**How Templates Work:**
1. **Pre-built Templates:** Start with common layouts
   - "Dungeon Template" → Pre-placed walls, corridors, rooms, doors, lighting
   - "Forest Template" → Pre-placed trees, paths, clearings, natural props
   - "City Street Template" → Pre-placed buildings, roads, market stalls
   - "Cave Template" → Pre-placed rock formations, tunnels, stalactites

2. **Save Your Own:** Create a map, then "Save as Template"
   - You've built "Tarro Marketplace" with all props placed perfectly
   - Save it as "Marketplace Template"
   - Next time you need a marketplace, start from template instead of empty map

3. **Template = Starting Point, Not Final**
   - Apply template → Get all props/layout pre-placed
   - Then customize: move props, add/remove, change modifiers
   - Much faster than placing 50 trees manually every time

**Real-World Example:**
- You need 5 different forest maps (Frozen Forest, Cursed Forest, etc.)
- Without templates: Place trees, rocks, paths manually 5 times = hours of work
- With templates: Start from "Forest Template", adjust lighting/modifiers, done = 10 minutes

**For Unreal Integration:**
- Templates can export as Unreal Blueprint prefabs
- "Forest Template" → Unreal "Forest_Base" prefab with all props
- Spawn in Unreal, then customize per-map

---

### 3.2 Prop Sets/Packs
**Why:** Organize related props
- Group props by theme (Tarro props, Wildlands props, etc.)
- Import/export prop sets
- Share prop sets between projects

---

### 3.3 Narrative System (Cutscenes, Gameplay Narrative, Choices)

**What the Narrative Editor Involves:**

1. **Cutscene Management**
   - Create/edit cutscenes (camera sequences, character animations, dialogue)
   - Timeline editor for cutscene events
   - Camera path editing
   - Character positioning and animations

2. **Gameplay Narrative**
   - In-game dialogue sequences
   - Narrative moments during gameplay
   - Environmental narrative triggers
   - Story beats tied to gameplay events

3. **Player Choices & Branching**
   - Choice trees (player selects option A/B/C)
   - Branching narratives based on choices
   - Conditional narrative paths (if flag X, show story Y)
   - Achievement-based narrative branches

4. **Narrative Triggers**
   - Location-based: "When player enters area X, trigger narrative Y"
   - Interaction-based: "When player interacts with object X, show dialogue Y"
   - Combat-based: "After defeating boss X, play cutscene Y"
   - Flag-based: "If player has achievement X, show different narrative"

5. **Dialogue System**
   - Character dialogue trees
   - NPC conversation flows
   - Player response options
   - Dialogue metadata (voice lines, timing, etc.)

**Recommendation: Separate "Narrative Editor" Tab**

**Why "Narrative Editor" instead of "Story Editor":**
- "Story" is too generic and conflicts with markdown story files
- "Narrative" better describes cutscenes, gameplay narrative, choices
- Clear distinction: Narrative = interactive gameplay narrative, Stories = markdown lore files

**Why Separate:**
- **Narrative Editor** focuses on:
  - Creating cutscenes and gameplay narrative
  - Managing dialogue trees and choices
  - Setting up narrative triggers
  - Timeline editing for cutscenes
  
- **Environment Editor** focuses on:
  - Linking narratives to locations (association only)
  - Setting up narrative triggers in maps/scenes
  - Environmental storytelling (prop placement for narrative)

**Integration:**
- Environment Editor can link narratives to maps/scenes
- Map Editor can place narrative triggers at specific coordinates
- But actual narrative creation happens in Narrative Editor

**Proposed Structure:**
```
Content Editor
├── Files (existing)
├── Spells (existing)
├── Effects (existing)
├── Runes (existing)
├── Characters (existing)
├── Creatures (existing)
├── Environments (NEW)
│   ├── Environment Manager
│   │   └── Stories Tab (link markdown stories, like characters/creatures)
│   ├── Map Editor (grid-based, prop placement, coordinate system)
│   ├── Scene Editor
│   └── Narrative Triggers (link narratives from Narrative Editor)
└── Narrative (NEW - separate editor)
    ├── Cutscene Editor
    ├── Dialogue Tree Editor
    ├── Choice Branching Editor
    ├── Narrative Trigger Manager
    └── Narrative Preview
```

**Benefits of Separation:**
- Narrative designers work in Narrative Editor
- Environment designers link narratives without editing content
- Clear separation: Narrative = interactive gameplay, Stories = markdown lore
- Both editors can be used simultaneously

---

### 3.4 Combat Integration
**Why:** Environments affect combat
- Environmental hazards in combat scenes
- Element affinity bonuses based on location
- Mana regeneration zones
- Damage resistance areas

**Example Combat Scenes:**
- **Fire Arena:** Fire affinity +20%, ice damage -30%, fire hazards
- **Ice Cave:** Ice affinity +20%, fire damage -30%, slippery surfaces
- **Mana Well:** Mana regen +10/sec, spell instability -5%

---

### 3.5 Visual Preview System
**Why:** See how environments look before exporting
- 2D/3D preview of maps
- Scene preview with lighting
- Prop placement visualization
- Export preview images

---

### 3.6 Import/Export System
**Why:** Work with external tools
- Export to Unity/Unreal format
- Import from image editors
- JSON/XML export for version control
- Asset pipeline integration

---

### 3.7 Version Control & Collaboration
**Why:** Team workflow
- Track changes to environments
- Merge conflicts
- Rollback to previous versions
- Branch environments for testing

---

### 3.8 Search & Filter System
**Why:** Find content quickly
- Search environments/maps/scenes/props by name/tags
- Filter by type, biome, danger level
- Quick navigation between related content

---

### 3.9 Validation & Testing
**Why:** Catch errors early
- Validate map connections (no broken links)
- Check prop references (no missing props)
- Test scene triggers
- Validate modifier values

---

### 3.10 Metadata & Tagging
**Why:** Organization and searchability
- Tags for environments (biome, climate, danger)
- Tags for props (interactive, decorative, hazard)
- Custom metadata fields
- Search by tags

---

## 4. Database Schema Considerations

### Tables Needed:
1. `environments` - Top-level locations
2. `maps` - Playable areas within environments
3. `scenes` - Camera/view setups within maps
4. `props` - Interactive/decorative objects
5. `environmental_modifiers` - Gameplay effects
6. `map_connections` - Links between maps
7. `scene_props` - Props assigned to scenes (junction table)
8. `spawn_points` - Creature spawn locations
9. `interactables` - Points of interest

### Relationships:
- Environment → Maps (1:many)
- Map → Scenes (1:many)
- Map → Props (many:many via scene_props)
- Scene → Props (many:many via scene_props)
- Environment/Map/Scene/Prop → Modifiers (many:many)

---

## 5. Implementation Priority

### Phase 1: Core Structure
1. Environment Manager (CRUD)
2. Map Editor (basic grid, pan, zoom, coordinate system)
3. Coordinate system (pixel to Unreal conversion)
4. Precision level system
5. Basic placement (props, spawn points)

### Phase 2: Map Editor Features
1. Multi-cell selection
2. Placement tool with precision warnings
3. Coordinate visualization (pixel/Unreal display)
4. Different map size preview
5. Prop library (browse/select)

### Phase 3: Advanced Map Features
1. Scene editor
2. Environmental modifiers
3. Map connections
4. Export to Unreal format

### Phase 4: Advanced Features
1. Templates
2. Import/export
3. Validation
4. Collaboration tools

---

## 6. Coordinate System & Precision Details

### 6.1 Pixel to Unreal Unit Conversion

**Problem:** On a 12km² map (12000 x 12000 Unreal units), if the reference image is 1000x1000 pixels:
- 1 pixel = 12 Unreal units = 12 meters
- A single health potion placed at pixel precision = 12m x 12m area in Unreal
- Too imprecise for small items

**Solution: Multi-Level Precision System**

**Zone Level (Low Precision):**
- Large grid cells (e.g., 100x100 pixels)
- Use for: Spawn zones, encounter areas, large environmental effects
- Example: "Spawn zone at zone (5, 3)" = 500x300 pixel area = 6000x3600 Unreal units
- Unreal code handles exact placement within zone (random or algorithm-based)

**Cell Level (Medium Precision):**
- Medium grid cells (e.g., 10x10 pixels)
- Use for: Buildings, large props, landmarks
- Example: "Building at cell (50, 30)" = 500x300 pixel area = 600x360 Unreal units
- Still imprecise for small items, but good for large objects

**Pixel Level (High Precision):**
- Individual pixels
- Use for: Medium-sized props, approximate item locations
- Example: "Item at pixel (500, 300)" = 12x12 Unreal units
- Warning shown: "This placement covers 12m x 12m - may be imprecise for small items"

**Unreal Direct (Maximum Precision):**
- Direct Unreal unit coordinates
- Use for: Critical placements, small items, exact positions
- Example: "Health potion at Unreal (6000, 3000, 100)"
- Bypasses pixel conversion entirely
- Most control, but requires manual coordinate entry or precise measurement

### 6.2 Precision Warnings & Recommendations

**When placing small items (health potion, small prop):**
- Warn: "This placement at pixel precision covers X meters in Unreal"
- Suggest: "Use Unreal Direct coordinates for precise placement"
- Or: "Place in spawn zone and let Unreal code handle exact placement"

**When placing large items (building, landmark):**
- Cell-level precision is fine
- Show Unreal coordinate range
- No warning needed

**When placing zones (spawn area, encounter area):**
- Zone-level precision is appropriate
- Show zone boundaries in Unreal units
- Allow Unreal code to handle distribution within zone

### 6.3 Zoom Levels & Grid Density

**Low Zoom (Overview):**
- Large grid cells (zone-level)
- See entire map
- Place large zones/areas

**Medium Zoom (Normal):**
- Medium grid cells (cell-level)
- See portion of map
- Place buildings/large props

**High Zoom (Detail):**
- Small grid cells (pixel-level)
- See small area
- Place medium props

**Maximum Zoom (Pixel-Level):**
- Individual pixels selectable
- See tiny area
- Place with pixel precision (with warnings)

**Grid adjusts automatically with zoom level**

### 6.4 Data-Driven Approach

**All placements saved with:**
- Placement type (prop, spawn point, interactable, zone)
- Precision level (zone, cell, pixel, Unreal direct)
- Coordinates (appropriate format for precision level)
- Metadata (item ID, rotation, scale, etc.)

**Unreal Import:**
- Export placements as JSON
- Include coordinate system info
- Include precision level info
- Unreal code interprets and places accordingly

**For small items in large zones:**
- Place spawn zone
- Include metadata: "spawnType: 'healthPotion', spawnCount: 1, distribution: 'random'"
- Unreal code handles exact placement within zone
- Avoids items spawning in rocks/props

---

## 7. UI/UX Considerations

- **Split View:** Map editor on left, prop library on right
- **Toolbar:** Placement tools, selection tools, connection tools
- **Properties Panel:** Edit selected item properties
- **Hierarchy Panel:** Tree view of environment → map → scene → props
- **Minimap:** Overview of current map
- **Layer Toggle:** Show/hide different layers
- **Undo/Redo:** Essential for map editing

---

## Summary

**Must-Have:**
- Environment Manager
- Map Editor (with visual canvas)
- Prop Manager/Editor
- Scene System (especially for combat)
- Environmental Modifiers

**Should-Have:**
- Visual preview
- Templates
- Import/export
- Validation

**Nice-to-Have:**
- Version control
- Collaboration tools
- Advanced search/filtering

**Scenes are essential** - They provide combat variety, storytelling moments, and gameplay depth. Without scenes, every map would feel the same.

