# Map Editor User Guide

## 🎯 Overview

The Map Editor lets you build hierarchical game worlds by creating maps, defining regions with different environment properties, and placing content. This guide covers both **first-time setup** (no data) and **working with existing data**.

---

## 🚀 First Time Setup: Building Your World from Scratch

### **Scenario: You have no maps, no regions, nothing. Starting fresh.**

---

### **Step 1: Create Your World Map**

**What you're doing:** Creating the foundation - the main map where players start.

1. Go to **"Maps"** section (top tab)
2. Click **"+ New Map"** button
3. Fill in the form:
   - **ID:** `world-map` (unique identifier)
   - **Name:** `World Map`
   - **Type:** Select **"World Map"** preset
     - This auto-fills: 12km × 12km, 4096×4096px image
   - **Environment:** Select **"world-environment"** (default)
     - This is the baseline environment (safe, neutral)
   - **Image:** Upload your world map image (4096×4096px recommended)
4. Click **"Create"**

**What just happened:**
- World Map created with default "World Environment"
- Default properties: Safe (Danger 0), neutral biome/climate
- This is your foundation - everything else builds on this

**Visual feedback:**
- Map appears in dropdown
- Canvas shows your world map image
- Grid overlay visible
- Status bar shows coordinates

---

### **Step 2: Select Cells for Your First Region**

**What you're doing:** Defining an area on the world map that will have different environment properties.

1. Select **"World Map"** from the dropdown (top left)
2. Click **Cell Selection** tool (square icon - turns blue when active)
3. **Click and drag** on the map to select cells
   - Example: Drag to select the area covering "Frozen Loom" region
   - You'll see blue highlighted cells as you drag
4. Release mouse - selection stays visible

**What you see:**
- Blue highlighted cells showing your selection
- Feedback panel (top-right) shows:
  - Selected cell count
  - Area size in km²
  - Recommended nested map configuration
  - Warnings/recommendations

**Visual feedback:**
- Selected cells highlighted in blue
- Status bar shows: "Cells: X" (number of selected cells)
- Mode indicator shows: "Cell Selection" (blue border)

---

### **Step 3: Create Region with Environment Properties**

**What you're doing:** Creating a region that overrides the world's default environment.

1. In the feedback panel (top-right), click **"Create Region from Selection"**
2. A dialog appears - fill in:
   - **Name:** `Frozen Loom`
   - **Environment Properties:**
     - **Biome:** `Mountain` (overrides world default)
     - **Climate:** `Cold` (overrides world default)
     - **Danger Level:** `3` (overrides world default of 0)
     - **Creatures:** `Ice Wolf, Frost Giant` (specific to this area)
3. Click **"Create"**

**What just happened:**
- Region created with unique color (you'll see it on the map)
- Selection persists (cells stay highlighted)
- Region boundaries = edges of selected cells
- When player enters these cells → environment changes to Mountain, Cold, Danger 3

**Visual feedback:**
- Region appears with unique color (not blue anymore)
- Region list shows in feedback panel (if no active selection)
- Status bar shows: "Regions: 1"

---

### **Step 4: Create Nested Map from Region**

**What you're doing:** Creating a detailed view of the region that inherits its environment properties.

1. Click on the **"Frozen Loom"** region (on map or in region list)
   - Region highlights (more opaque)
   - Cells show region color
2. Click **"Create Nested Map"** button (in feedback panel)
3. Fill in the form:
   - **Name:** `Frozen Loom Map`
   - **Type:** Select **"Town"** preset (2km × 2km)
   - **Environment:** Inherits from "Frozen Loom" region
     - Biome: Mountain (inherited)
     - Climate: Cold (inherited)
     - Danger Level: 3 (inherited)
     - Creatures: Ice Wolves, Frost Giants (inherited)
   - **Image:** Upload Frozen Loom detailed map image (2048×2048px)
4. Click **"Create"**

**What just happened:**
- Nested map created
- Linked to parent region (`nestedMapId` set)
- Inherits all environment properties from region
- When player enters region cells → Frozen Loom Map loads

**Visual feedback:**
- Region shows link icon (indicates it has nested map)
- Nested map appears in map dropdown
- Can now select nested map to edit it

---

### **Step 5: Add More Regions (Repeat Pattern)**

**What you're doing:** Adding more areas with different properties.

1. Select **"World Map"** again (from dropdown)
2. Click **Cell Selection** tool
3. Drag to select different area (e.g., "Xingdom Huld")
4. Create Region:
   - Name: `Xingdom Huld`
   - Biome: `Forest` (different from Frozen Loom!)
   - Climate: `Temperate` (different from Frozen Loom!)
   - Danger Level: `1` (safer than Frozen Loom!)
   - Creatures: `Deer, Wolf`
5. Create nested map if needed

**Pattern:** Same workflow for each region. Each can have different properties.

---

### **Step 6: Place Content on Nested Maps**

**What you're doing:** Adding landmarks, props, and spawn points to your nested maps.

1. Select **"Frozen Loom Map"** from dropdown
2. Click **Placement Tool** (pointer icon - turns orange when active)
3. Click on map where you want to place something
   - Example: Click on "Lilaran" location
4. Placement dialog appears:
   - **Type:** Select `Landmark`
   - **Landmark Type:** Select `Town`
   - **Create nested map:** `Yes`
   - **Name:** `Lilaran`
   - **Image:** Upload Lilaran map image
5. Click **"Place"**

**What just happened:**
- Landmark placed at clicked location
- Nested map "Lilaran" created automatically
- When player interacts with landmark → Lilaran map loads

**Visual feedback:**
- Landmark icon appears on map
- Can click landmark to edit or navigate to nested map

---

## 📂 Working with Existing Data

### **Scenario: You already have maps, regions, and content. Editing existing world.**

---

### **Understanding What You Have**

**When you open the Map Editor:**

1. **Maps Section:**
   - Dropdown shows all existing maps
   - Select a map to view/edit it
   - See map hierarchy (parent maps, nested maps)

2. **Regions:**
   - Regions show on map with unique colors
   - Region list appears in feedback panel (when no active selection)
   - Click region to select it and see its properties

3. **Placements:**
   - Icons/markers show on map
   - Click placement to edit it
   - See placement list in sidebar (if implemented)

---

### **Editing Existing Maps**

1. **Select map** from dropdown
2. **View map** on canvas
3. **See existing regions** (colored areas)
4. **See existing placements** (icons/markers)
5. **Edit:**
   - Click region → Edit properties
   - Click placement → Edit placement
   - Use tools to add more content

---

### **Editing Existing Regions**

1. **Click on region** (on map or in region list)
   - Region highlights
   - Feedback panel shows region info
2. **Edit properties:**
   - Click "Edit Region" button
   - Change biome, climate, danger level, creatures
   - Changes apply immediately
3. **Edit nested map:**
   - Click "Edit Nested Map" button
   - Navigate to nested map editor
   - Make changes there

---

### **Adding to Existing Maps**

**Add new region:**
1. Select map
2. Use Cell Selection tool
3. Select new area
4. Create region (same as first-time setup)

**Add new placement:**
1. Select map
2. Use Placement tool
3. Click location
4. Place item (same as first-time setup)

---

### **Navigating Map Hierarchy**

**Understanding the structure:**
- World Map (top level)
  - Region: Frozen Loom → Nested Map: Frozen Loom Map
    - Region: Warm Inn → Nested Map: Warm Inn Map
  - Region: Xingdom Huld → Nested Map: Xingdom Huld Map

**How to navigate:**
1. **Breadcrumb trail** (if implemented) shows: World Map > Frozen Loom Map > Warm Inn Map
2. **Click region** → Navigate to nested map
3. **Click landmark** → Navigate to nested map
4. **Use map dropdown** → Jump to any map directly

---

## 🎨 Visual Guide: What You See

### **On World Map (First Time):**
- Map image as background
- Grid overlay
- No regions yet (empty)
- Status bar shows coordinates

### **After Creating Regions:**
- Colored regions visible (each unique color)
- Region boundaries highlighted
- Region list in feedback panel
- Status bar shows: "Regions: X"

### **On Nested Maps:**
- Detailed map image
- Inherited environment properties shown
- Regions (if any) with different properties
- Placements (landmarks, props, spawn points)

### **Mode Indicators:**
- **Blue border** = Cell Selection Mode (selecting cells)
- **Orange border** = Placement Mode (placing items)
- **Status bar** shows current mode

---

## 🛠️ Tools Explained

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

### **Undo/Redo**
- **Undo:** `Ctrl+Z`
- **Redo:** `Ctrl+Shift+Z`

---

## 📋 Complete Workflow: First Time vs Existing

### **First Time (No Data):**
1. Create World Map → Set default environment
2. Select cells → Create region → Set environment properties
3. Create nested map → Inherits from region
4. Add more regions → Repeat pattern
5. Place content → Add landmarks, props

### **Existing Data:**
1. Select map → View existing content
2. Click region → Edit properties or nested map
3. Click placement → Edit placement
4. Add more → Use same tools to add regions/placements
5. Navigate hierarchy → Use breadcrumbs or dropdown

---

## ❓ Common Questions

**Q: I don't see any maps. What do I do?**
- Click "+ New Map" to create your first map
- Start with World Map

**Q: How do I know which mode I'm in?**
- Look at toolbar icons - blue border = Cell Selection, orange border = Placement
- Status bar shows current mode

**Q: I selected cells but they disappeared.**
- Make sure you're in Cell Selection mode (blue border)
- Selection should persist after drag
- If it disappears, try selecting again

**Q: How do I edit a region?**
- Click on the region (on map or in region list)
- Feedback panel shows region info
- Click "Edit Region" button

**Q: How do I navigate to a nested map?**
- Click on region → Click "Edit Nested Map" button
- Or select nested map from dropdown

**Q: Can I have multiple regions with same properties?**
- Yes! Create multiple regions with same environment properties
- Each region can have its own nested map

**Q: How do I delete a region?**
- Select region → Click "Delete" button (to be implemented)
- Or edit region → Delete option

---

## ✅ Quick Reference

### **First Time Setup:**
1. Create World Map
2. Select cells → Create region
3. Create nested map
4. Repeat for more regions
5. Place content

### **Working with Existing:**
1. Select map
2. View regions/placements
3. Click to edit
4. Add more as needed

### **Keyboard Shortcuts:**
- `G` - Toggle grid
- `S` - Toggle snap
- `+` / `-` - Zoom in/out
- `0` - Reset view
- `F` - Fit to viewport
- `Ctrl+Z` - Undo
- `Ctrl+Shift+Z` - Redo

---

This guide covers both scenarios. Start with first-time setup if you're new, or jump to "Working with Existing Data" if you already have content.
