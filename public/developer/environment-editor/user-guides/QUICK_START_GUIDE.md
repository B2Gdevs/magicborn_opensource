# Map Editor Quick Start Guide

## 🚀 5-Minute Quick Start

### **Step 1: Create Your First Map**
1. Click **"+ New Map"** button
2. Select **"World Map"** preset
3. Upload your world map image (4096×4096px recommended)
4. Click **Create**

### **Step 2: Place Your First Environment (Frozen Loom)**
1. Select your world map from dropdown
2. Click **Cell Selection** tool (square icon)
3. Click and **drag** to select the area covering "Frozen Loom"
4. Check the feedback panel - it shows:
   - Selected cells count
   - Recommended nested map size
5. Click **"Create Nested Map from Selection"** button
6. Fill in:
   - Name: "Frozen Loom"
   - Type: "Town" (recommended)
   - Upload Frozen Loom map image
7. Click **Create**

**Done!** You've created your first nested environment.

### **Step 3: Place a Town (Lilaran)**
1. Select "Frozen Loom" map from dropdown
2. Click **Placement Tool** (pointer icon)
3. Click on "Lilaran" location on the map
4. Select:
   - Type: **Landmark**
   - Landmark Type: **Town**
   - Create nested map: **Yes**
5. Upload Lilaran map image
6. Click **Place**

**Done!** Lilaran is now a clickable landmark.

---

## 🎯 Two Main Workflows

### **Workflow A: Create Large Regions (Environments)**
**Use Cell Selection Tool**

1. Click **Cell Selection** (square icon)
2. Drag to select area
3. Click **"Create Nested Map"**
4. Fill in details and create

**Use for:** Frozen Loom, Xingdom Huld, large regions

---

### **Workflow B: Place Specific Items**
**Use Placement Tool**

1. Click **Placement Tool** (pointer icon)
2. Click on map where you want item
3. Select item type and properties
4. Click **Place**

**Use for:** Towns, buildings, props, spawn points

---

## 🖱️ How to Select Cells

1. **Click Cell Selection tool** (square icon)
2. **Click and drag** on map to select rectangular area
3. **Ctrl+Click** to add cells to selection
4. **Shift+Click** to add cells to selection
5. **Click again** to clear and start new selection

**Visual Feedback:**
- Selected cells show blue highlight
- Feedback panel shows selection info
- Status bar shows cell coordinates

---

## 📍 How to Place Items

1. **Click Placement Tool** (pointer icon)
2. **Click on map** where you want item
3. **Dialog appears** with placement options:
   - Type: Prop, Landmark, Spawn Point, etc.
   - Precision: Zone, Cell, Pixel, Unreal Direct
   - Properties: Size, rotation, etc.
4. **Fill in details** and click **Place**

**Visual Feedback:**
- Item appears on map
- Can be selected and moved
- Shows in placement list

---

## 🎨 Tool Icons Explained

| Icon | What It Does | When to Use |
|------|--------------|-------------|
| 📐 **Grid** | Show/hide grid | Always on for precision |
| 🎯 **Snap** | Snap to grid | When placing items |
| ⬜ **Cell Selection** | Select cells | Creating regions/environments |
| 👆 **Placement** | Place items | Placing props, landmarks |
| ➕➖ **Zoom** | Zoom in/out | Navigating large maps |
| ↶↷ **Undo/Redo** | Undo actions | Fixing mistakes |
| 📋📄 **Copy/Paste** | Copy items | Duplicating placements |
| 🗑️ **Delete** | Delete items | Removing placements |

**Hover over any icon to see detailed tooltip!**

---

## 💡 Common Tasks

### **Task: Create Frozen Loom Environment**
1. World Map → Cell Selection → Drag area → Create Nested Map

### **Task: Add Lilaran Town**
1. Frozen Loom Map → Placement Tool → Click location → Landmark → Town

### **Task: Add Building in Lilaran**
1. Lilaran Map → Placement Tool → Click location → Landmark → Building

### **Task: Place a Prop**
1. Any Map → Placement Tool → Click location → Prop → Select type → Place

---

## ❓ Quick Troubleshooting

**Q: I can't select cells**
- Make sure Cell Selection tool is active (square icon should be blue)
- Try clicking and dragging (not just clicking)

**Q: I can't place items**
- Make sure Placement Tool is active (pointer icon)
- Make sure a map is selected
- Check if you're in the right mode

**Q: I don't see my selection**
- Check if you're in Cell Selection mode
- Look for blue highlighted cells
- Check feedback panel (top-right)

**Q: Tooltips don't show**
- Hover over icons for 1-2 seconds
- Make sure you're hovering directly on the icon

---

## 📚 More Help

- **Full User Guide:** See `MAP_EDITOR_USER_GUIDE.md`
- **Data Structure:** See `DATA_STRUCTURE_GUIDE.md`
- **Unreal Integration:** See `UNREAL_ENGINE_MAPPING.md`

---

**Ready to start?** Create your first map and try placing an environment! 🗺️

