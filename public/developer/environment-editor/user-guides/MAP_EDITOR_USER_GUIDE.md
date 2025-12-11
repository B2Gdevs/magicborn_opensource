# Map Editor User Guide

## 🎯 Overview

The Map Editor is a **region-first** workflow for building hierarchical game worlds. You work with **regions** (which define areas with specific environment properties), but you **edit using maps** (images that provide visual context and coordinate systems). Every map is associated with a region, and regions can have nested maps for more granular detail.

## 📐 Coordinate System & Hierarchy

The Map Editor uses a **hierarchical coordinate system** that scales from world-level down to granular regions:

### **World Region (Top Level)**
- Represents the **entire game world** (e.g., 12km × 12km)
- Defined by:
  - **World Dimensions**: Total width/height in Unreal Engine meters (e.g., 12000m = 12km)
  - **Map Image**: Visual representation (e.g., 4096×4096px)
  - **Cell Size**: Pixel size of each cell (e.g., 16px)
- **Grid Calculation**: The image is divided into cells based on cell size
  - Example: 4096px image ÷ 16px cells = 256×256 cells
- **Cell-to-World Mapping**: Each cell represents a portion of the world
  - Example: 12km world ÷ 256 cells = ~46.9m per cell

### **Nested Regions (More Granular)**
- When you select cells on a map and create a region, that region represents a **smaller area** within the parent
- **Inheritance**: Regions inherit the parent map's coordinate system but represent a subset
- **Example Flow**:
  1. **World Region**: 12km × 12km, 256×256 cells, ~46.9m per cell
  2. **Select 64×64 cells** → Create "Frozen Loom" region
     - This region = 64 cells × 46.9m = ~3km × 3km area
  3. **Create nested map** for "Frozen Loom" region
     - New map might be 2km × 2km (more granular)
     - Same cell size (16px) but smaller total area
     - Now each cell = ~31.25m per cell (more detail)
  4. **Select 32×32 cells** on nested map → Create "Ice Cave" region
     - This region = 32 cells × 31.25m = ~1km × 1km area

### **Key Principles**
- **Top-Down Hierarchy**: World → Regions → Nested Maps → More Regions
- **Increasing Granularity**: Each level down provides more detail in a smaller area
- **Consistent Cell Size**: Cell size (in pixels) typically stays the same, but world-space per cell decreases
- **Coordinate Mapping**: The system automatically calculates world coordinates based on the hierarchy

---

## 🚀 First Time Setup: Creating Your World

### **Scenario: You have no regions, no maps, nothing. Starting fresh.**

---

### **Step 1: Create Your World Region**

**What you're doing:** Creating the foundation - a world region with a world map and world environment.

1. Go to **"Maps"** section (top tab)
2. Click **"+ New World Region"** button
3. Fill in the form:
   - **Region Name:** `World` (or your world name)
   - **Region ID:** Auto-generated from name
   - **Description:** Optional description
   - **Environment:** Select from existing environments or click "+ Create New" to create one inline
     - If no environments exist, a default one is automatically created
     - When creating new: Enter ID, Name, Biome, Climate, and Danger Level
   - **Map Image:** Upload your world map image (4096×4096px recommended)
     - Image dimensions are automatically detected and cannot be changed
   - **World Map Configuration:**
     - **World Width/Height:** Total world size in meters (e.g., 12000m = 12km)
     - **Cell Size:** Pixel size of each cell (e.g., 16px)
     - The system calculates: Grid size, cells per world meter, etc.
4. Click **"Create World Region"**

**What just happened:**
- **World Environment** created with default properties
- **World Map** created with your image and coordinate system
- **Base Region** created covering the entire map
- All three are linked together

**Visual feedback:**
- World region appears in the region selector
- Canvas shows your world map image
- Base region covers the entire map (visible with low opacity)
- Grid overlay visible

---

### **Step 2: Select a Region to Edit**

**What you're doing:** Choosing which region's map you want to edit.

1. In the **region selector** (searchable combobox in toolbar), select **"Base Region (World Map)"**
   - This loads the world map for editing
2. The map canvas displays the world map image
3. You can now create more granular regions on this map

---

### **Step 3: Create a Granular Region**

**What you're doing:** Defining a sub-region within the world that has different environment properties.

1. Make sure the **world map** is loaded (from Step 2)
2. Click **Cell Selection** tool (square icon - turns blue when active)
3. **Click and drag** on the map to select cells
   - Example: Drag to select the area covering "Frozen Loom"
   - You'll see blue highlighted cells as you drag
4. Release mouse - selection stays visible

**What you see:**
- Blue highlighted cells showing your selection
- Feedback panel (top-right) shows:
  - Selected cell count
  - Area size in km²
  - Inheritance information (inheriting from Base Region)
  - Environment selector

---

### **Step 4: Create Region with Environment Override**

**What you're doing:** Creating a region that overrides the world's default environment.

1. In the feedback panel (top-right), enter a **region name** (e.g., `Frozen Loom`)
2. **Select an environment** from the dropdown (or create a new one)
   - The environment defines: Biome, Climate, Danger Level
   - If no environment is selected, it will inherit from the parent region
3. Click **"Create Region"**

**What just happened:**
- Region created with unique color (you'll see it on the map)
- Selection persists (cells stay highlighted)
- Region boundaries = edges of selected cells
- When player enters these cells → environment changes to the region's environment
- If parent region had different properties, this region overrides them

**Visual feedback:**
- Region appears with unique color (not blue anymore)
- Region list shows in feedback panel (if no active selection)
- Status bar shows: "Regions: X"

---

### **Step 5: Create Nested Map for Granular Detail**

**What you're doing:** Creating a detailed map for the region so you can add even more granular regions.

1. Click on the **"Frozen Loom"** region (on map or in region list)
   - Region highlights (more opaque)
   - Cells show region color
2. In the feedback panel, you'll see options to **add a map** to this region
3. **Drag and drop** or **upload** a map image for this region
   - The region will snap to a square based on the image dimensions
4. The map is now associated with this region

**What just happened:**
- Map created and linked to the region (`nestedMapId` set)
- Region now has its own map for more granular editing
- When player enters region cells → this map loads (if visible to player)
- You can now select this region from the dropdown to edit its map

**Visual feedback:**
- Region shows it has a nested map
- Region appears in the region selector dropdown
- Can now select this region to edit its map

---

### **Step 6: Edit Nested Map and Create More Granular Regions**

**What you're doing:** Adding even more detail by creating sub-regions within the nested map.

1. In the **region selector**, select **"Frozen Loom"** (the region you just created)
   - This loads the Frozen Loom map for editing
2. The canvas now shows the Frozen Loom map image
3. Use **Cell Selection** tool to select a smaller area
   - Example: Select a single cell or small area within Frozen Loom
4. Create a new region:
   - Name: `Warm Inn` (or whatever you're creating)
   - Select environment (or inherit from Frozen Loom)
   - This region will override Frozen Loom's environment if different
5. Optionally add a map to this new region for even more granular detail

**Pattern:** 
- Each nested level gets more granular
- Regions inherit from parent regions unless overridden
- Maps are inherited unless a region has its own map
- You can nest as deep as needed

---

## 📂 Working with Existing Data

### **Scenario: You already have regions and maps. Editing existing world.**

---

### **Understanding the Region-First Workflow**

**When you open the Map Editor:**

1. **Region Selector:**
   - Shows all regions that have maps
   - Searchable combobox for easy selection
   - Includes the world region (Base Region) if it exists
   - Select a region to load its map for editing

2. **Regions:**
   - Regions show on map with unique colors
   - Each region can have its own map
   - Regions inherit environment properties from parent regions
   - Regions can override inherited properties

3. **Maps:**
   - Maps are always associated with regions
   - Maps provide the image and coordinate system for editing
   - Maps can be hidden from players but still used for editing
   - Nested maps allow for granular detail at deeper levels

---

### **Selecting a Region to Edit**

1. **Open region selector** (searchable combobox in toolbar)
2. **Search or scroll** to find the region you want to edit
3. **Select the region** - its map loads automatically
4. **Canvas shows** the region's map image
5. **You can now:**
   - View existing sub-regions on this map
   - Create new sub-regions
   - Edit existing regions
   - Add placements

---

### **Understanding Inheritance**

**Environment Inheritance:**
- Regions inherit environment properties from their parent region
- If a region doesn't override a property, it inherits from parent
- Inheritance chain: World Region → Frozen Loom → Warm Inn
- Each level can override specific properties

**Map Inheritance:**
- If a region has a map (`nestedMapId`), that map is used when player enters
- If a region doesn't have a map, it uses the parent region's map
- Maps cascade down the hierarchy unless overridden
- Maps can be hidden from players but still used for editing granular details

**Example:**
- World Region has World Map
- Frozen Loom region (on World Map) has Frozen Loom Map
- Warm Inn region (on Frozen Loom Map) has Warm Inn Map
- When player is in Warm Inn cells:
  - If Warm Inn has a map → Warm Inn Map loads
  - Otherwise → Frozen Loom Map loads
  - Otherwise → World Map loads

---

### **Creating More Granular Regions**

**On any map, you can create sub-regions:**

1. **Select the region** whose map you want to edit
2. **Map loads** on canvas
3. **Use Cell Selection** tool to select cells
4. **Create new region** with environment properties
5. **Optionally add a map** to the new region for even more detail
6. **Repeat** to create deeper nesting

**Each level gets more granular:**
- World Map: Large regions (kingdoms, continents)
- Town Map: Medium regions (districts, neighborhoods)
- Building Map: Small regions (rooms, areas)

---

### **Coordinate System and Scaling**

**How coordinates work at nested levels:**

- Each map has its own coordinate system
- Coordinates are calculated relative to the map's image size
- When nesting maps, coordinates scale appropriately
- Cell sizes are calculated based on:
  - Image dimensions
  - Unreal world size
  - Base cell size
- The system maintains precision at all nesting levels

**Example:**
- World Map: 4096×4096px, 12km×12km, 16px cells = ~47m per cell
- Town Map: 2048×2048px, 2km×2km, 10px cells = ~9.8m per cell
- Building Map: 1024×1024px, 500m×500m, 8px cells = ~3.9m per cell

---

## 🎨 Visual Guide: What You See

### **Region Selector:**
- Searchable dropdown showing all regions with maps
- Shows region name and associated map name
- Shows environment properties (biome, climate)
- Select to load that region's map for editing

### **On World Map:**
- Map image as background
- Grid overlay
- Base region visible (low opacity, covers entire map)
- Sub-regions visible with unique colors
- Status bar shows coordinates

### **On Nested Maps:**
- Detailed map image
- Inherited environment properties shown
- Sub-regions (if any) with different properties
- Placements (landmarks, props, spawn points)
- Each level shows more detail

### **Mode Indicators:**
- **Blue border** = Cell Selection Mode (selecting cells)
- **Orange border** = Placement Mode (placing items)
- **Status bar** shows current mode

---

## 🛠️ Tools Explained

### **Region Selector** (Searchable Combobox)
- **What it does:** Select which region's map to edit
- **When to use:** Always - this is how you navigate between maps
- **How:** Search or scroll to find region, click to select
- **Visual:** Selected region's map loads on canvas

### **Cell Selection Tool** (Square Icon)
- **What it does:** Select cells to create regions
- **When to use:** Defining areas with different environment properties
- **How:** Click and drag to select rectangular area
- **Visual:** Blue highlight for selection, colored regions when created

### **Placement Tool** (Pointer Icon)
- **What it does:** Place items on map (landmarks, props, spawn points)
- **When to use:** Adding content to maps
- **How:** Click on map where you want item
- **Visual:** Icons/markers appear on map

### **Grid Toggle** (Grid Icon)
- **What it does:** Show/hide grid overlay
- **When to use:** Always on for precision
- **Keyboard:** `G` key

### **Snap Toggle** (Snap Icon)
- **What it does:** Snap placements to grid cells
- **When to use:** When placing items precisely
- **Keyboard:** `S` key

### **Zoom Controls**
- **Zoom In/Out:** `+` / `-` keys or mouse wheel
- **Reset View:** `0` key
- **Fit to Viewport:** `F` key

---

## 📋 Complete Workflow

### **First Time (No Data):**
1. Create World Region (creates environment + map + base region)
2. Select World Region from dropdown
3. Use Cell Selection to create sub-regions
4. Add maps to regions for more granular detail
5. Select nested regions to edit their maps
6. Create even more granular regions
7. Repeat to build hierarchy

### **Working with Existing:**
1. Select region from dropdown
2. Map loads on canvas
3. View existing sub-regions
4. Create new sub-regions or edit existing ones
5. Navigate to nested regions to edit their maps
6. Add more detail as needed

---

## ❓ Common Questions

**Q: I don't see any regions. What do I do?**
- Click "+ New World Region" to create your first region
- This creates the world environment, world map, and base region

**Q: How do I edit a specific region's map?**
- Select the region from the region selector dropdown
- The region's map loads automatically
- You can now edit that map

**Q: How does inheritance work?**
- Regions inherit environment properties from parent regions
- If a property isn't set, it inherits from parent
- Maps are inherited unless a region has its own map
- Each level can override inherited values

**Q: Can I have maps that players don't see?**
- Yes! Maps can be used for editing granular details
- Even if not visible to players, they help you organize regions
- The map provides the coordinate system for editing

**Q: How do coordinates work at nested levels?**
- Each map has its own coordinate system
- Coordinates are calculated relative to the map's dimensions
- The system maintains precision at all nesting levels
- Cell sizes scale appropriately for each level

**Q: How do I navigate between regions?**
- Use the region selector dropdown
- Search for the region you want
- Select it to load its map
- The canvas updates to show that region's map

**Q: Can I delete a region?**
- Yes, select the region and use the delete option
- This will also delete its associated map and sub-regions
- Be careful - this is permanent

---

## ✅ Quick Reference

### **First Time Setup:**
1. Create World Region
2. Select World Region from dropdown
3. Create sub-regions with Cell Selection
4. Add maps to regions for detail
5. Select nested regions to edit their maps
6. Create more granular regions
7. Repeat to build hierarchy

### **Working with Existing:**
1. Select region from dropdown
2. Map loads on canvas
3. View/edit existing regions
4. Create new regions
5. Navigate to nested regions
6. Add more detail

### **Keyboard Shortcuts:**
- `G` - Toggle grid
- `S` - Toggle snap
- `+` / `-` - Zoom in/out
- `0` - Reset view
- `F` - Fit to viewport
- `Ctrl+Z` - Undo
- `Ctrl+Shift+Z` - Redo

---

## 🔄 The Region-First Workflow

**Key Concepts:**
- **Regions** are the primary entities (define areas with environment properties)
- **Maps** are always associated with regions (provide images and coordinate systems)
- **Editing** is done on maps, but you select regions to edit
- **Inheritance** flows from parent regions to child regions
- **Nesting** allows for granular detail at deeper levels
- **Coordinates** scale appropriately at each nesting level

**Remember:**
- Start with World Region (creates everything you need)
- Select regions to edit their maps
- Create sub-regions for more granular detail
- Add maps to regions when you need more detail
- Maps can be hidden from players but still used for editing

This guide covers the region-first workflow. Regions are the foundation, maps are the editing interface.
