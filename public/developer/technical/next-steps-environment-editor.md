# Environment Editor - Next Steps

## ✅ What We've Completed

### Phase 1: Data Layer ✅
- Database schemas (environments, maps, map-placements)
- Repositories with full CRUD
- API routes and clients
- Smoke tests passing

### Phase 2: Core Canvas ✅
- Professional Zustand store with history/undo-redo
- MapCanvas with smooth zoom/pan
- Grid layer with sub-grid
- Status bar with coordinates
- Keyboard shortcuts (react-hotkeys-hook)
- Context menus (Radix UI)
- Map creation form with presets
- Fixed modal footer buttons

## 🎯 Current Status

**You can now:**
- ✅ Create maps with environment association
- ✅ View maps in canvas with zoom/pan/grid
- ✅ See real-time cell/zone calculations
- ✅ Use keyboard shortcuts and context menus

**What's missing:**
- ❌ Environment Manager UI (create/edit environments)
- ❌ Placement system (place props, spawn points on maps)
- ❌ Nested map navigation (click into cells)
- ❌ Placement rendering on canvas

---

## 📋 Next Steps (In Order)

### **Step 1: Environment Manager UI** (High Priority)
**Why:** You need to create environments before you can create maps.

**What to build:**
- `components/environment/EnvironmentEditor.tsx` - Full editor (similar to CharacterEditor)
- Environment list with create/edit/delete
- Environment form with:
  - ID, name, description
  - Image upload
  - Biome, climate, danger level
  - Story associations (like characters/creatures)
- Add "Environments" section to EnvironmentEditor (or separate tab)

**Estimated effort:** 2-3 hours

---

### **Step 2: Placement System** (Core Feature)
**Why:** This is the main feature - placing items on maps.

**What to build:**
1. **PlacementLayer component**
   - Render placements as icons/markers on canvas
   - Show selection highlights
   - Hover tooltips

2. **Placement Tools**
   - Placement tool (click to place)
   - Select tool (click/drag to select)
   - Move tool (drag selected)
   - Delete tool (Delete key)

3. **Placement Properties Panel**
   - Edit placement type (prop, spawn point, landmark, etc.)
   - Edit coordinates
   - Edit precision level
   - For landmarks: link to nested map

4. **Placement List/Outliner**
   - List all placements for current map
   - Search/filter
   - Select from list (syncs with canvas)

**Estimated effort:** 4-6 hours

---

### **Step 3: Nested Map Navigation** (Hierarchical Feature)
**Why:** Click into cells to edit nested maps (town → shop → home).

**What to build:**
1. **Landmark Placement**
   - Mark placements as landmarks
   - Set landmark type (Town, Dungeon, Shop, etc.)
   - Link to nested map

2. **Map Navigation**
   - Click landmark on canvas → open nested map
   - Breadcrumb navigation (World → Town → Shop)
   - "Back" button to return to parent map

3. **Nested Map Editor**
   - Same editor, but for nested map
   - Lower resolution image for nested maps
   - Show parent map context

**Estimated effort:** 3-4 hours

---

### **Step 4: Advanced Features** (Polish)
**What to build:**
- Prop library (reusable prop definitions)
- Environmental modifiers UI
- Map connections (doors, paths between maps)
- Scene management (scenes within maps)
- Export/import functionality
- Three.js integration prep

**Estimated effort:** Ongoing

---

## 🎮 Recommended Workflow

### 1. Create Your First Environment
```
1. Go to Environments tab
2. Click "New Environment"
3. Create "Tarro" environment:
   - ID: tarro
   - Name: Tarro
   - Biome: Town
   - Climate: Temperate
   - Danger Level: 1
```

### 2. Create Your First Map
```
1. Go to Environments tab → Maps section
2. Click "New Map"
3. Select "World Map" preset
4. Select "Tarro" environment
5. Upload world map image (4096x4096px recommended)
6. Create map
```

### 3. Place Landmarks
```
1. Select map in canvas
2. Use Placement tool
3. Click on map to place landmark
4. Set landmark type (Town, Dungeon, etc.)
5. Link to nested map (or create new nested map)
```

### 4. Create Nested Maps
```
1. Click on landmark cell
2. Opens nested map editor
3. Create nested map (e.g., "Tarro Town")
4. Use lower resolution image (2048x2048px)
5. Place more landmarks (shops, homes)
```

---

## 🚀 Quick Start: Create Your First Environment

Since you need an environment before creating maps, let's build the Environment Manager next. This will be similar to CharacterEditor/CreatureEditor:

1. **Environment List** - Shows all environments
2. **Create/Edit Modal** - Form with all environment fields
3. **Detail View** - Shows environment info, associated maps, stories
4. **Delete** - With confirmation

**Ready to build the Environment Manager?**


