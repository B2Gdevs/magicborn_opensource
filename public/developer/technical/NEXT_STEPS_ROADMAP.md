# Environment Editor - Next Steps Roadmap

## ✅ Current Status (What's Working)

### Phase 1: Data Layer ✅ COMPLETE
- ✅ Database schemas (environments, maps, map-placements)
- ✅ Repositories with full CRUD operations
- ✅ API routes (GET, POST, PUT, DELETE)
- ✅ API clients for frontend access
- ✅ Smoke tests passing

### Phase 2: Core Canvas ✅ COMPLETE
- ✅ Zustand store with history/undo-redo
- ✅ MapCanvas with smooth zoom/pan
- ✅ Grid layer with sub-grid support
- ✅ Status bar with real-time coordinates
- ✅ Keyboard shortcuts (G, S, +/-, Ctrl+Z, etc.)
- ✅ Context menus (Radix UI)
- ✅ Map creation form with presets
- ✅ Environment Manager UI (create/edit environments)
- ✅ Map Manager UI (create/edit maps)

**You can now:**
- ✅ Create and manage environments
- ✅ Create and manage maps
- ✅ View maps in canvas with zoom/pan/grid
- ✅ See real-time coordinate calculations
- ✅ Use professional keyboard shortcuts

---

## 🎯 Next Steps (Priority Order)

### **Step 1: Cell Selection System** (Foundation for Advanced Features)
**Why:** You mentioned needing to select cells, group them, and create nested environments. This is the foundation.

**What to build:**
1. **Cell Selection Tool**
   - Click on map to select a cell
   - Visual highlight of selected cell(s)
   - Multi-select (Ctrl+Click, Shift+Click, drag box)
   - Show selected cell coordinates in status bar

2. **Cell Selection Layer Component**
   - `components/environment/CellSelectionLayer.tsx`
   - Render selected cells with highlight
   - Handle click/drag selection
   - Calculate cell coordinates from pixel clicks

3. **Cell Selection State**
   - Add to `mapEditorStore.ts`:
     - `selectedCells: Array<{ cellX: number; cellY: number }>`
     - `selectionMode: "cell" | "placement"`
     - Actions: `selectCell()`, `selectCellRange()`, `clearCellSelection()`

**Estimated effort:** 2-3 hours
**Risk:** Low (additive feature, won't break existing functionality)

---

### **Step 2: Placement System** (Core Feature)
**Why:** This is the main feature - placing props, spawn points, landmarks on maps.

**What to build:**
1. **PlacementLayer Component**
   - `components/environment/PlacementLayer.tsx`
   - Render placements as icons/markers on canvas
   - Show selection highlights
   - Hover tooltips with placement info
   - Transform handles when selected

2. **Placement Tools**
   - Update `MapCanvas.tsx` with tool modes:
     - **Placement tool** (P key) - Click to place new item
     - **Select tool** (V key) - Click/drag to select placements
     - **Move tool** (M key) - Drag selected placements
   - Calculate Unreal coordinates from clicks
   - Save to database via API client

3. **Placement Properties Panel**
   - Side panel or modal for editing selected placement
   - Edit placement type (prop, spawn point, landmark, etc.)
   - Edit coordinates (with validation)
   - Edit precision level
   - For landmarks: link to nested map

4. **Placement List/Outliner**
   - `components/environment/PlacementList.tsx`
   - List all placements for current map
   - Search/filter functionality
   - Click to select (syncs with canvas)
   - Multi-select support

**Estimated effort:** 4-6 hours
**Risk:** Medium (touches canvas, but isolated to placement layer)

---

### **Step 3: Multi-Cell Grouping & Nested Environments** (Advanced Feature)
**Why:** You want to select groups of cells and make them into environments with their own maps.

**What to build:**
1. **Cell Group Selection**
   - Extend cell selection to support multi-cell groups
   - Visual highlight of cell group
   - "Create Environment from Selection" button

2. **Environment from Cell Group**
   - Convert selected cells to new environment
   - Create nested map for that environment
   - Link parent map cell to nested map
   - Update environment's `mapIds` array

3. **Map Navigation**
   - `components/environment/MapNavigation.tsx`
   - Breadcrumb navigation (World → Town → Shop)
   - Click on cell group → open nested map
   - "Back" button to return to parent map

**Estimated effort:** 3-4 hours
**Risk:** Medium (depends on cell selection and placement system)

---

### **Step 4: Landmark System** (Hierarchical Maps)
**Why:** Click into cells to edit nested maps (town → shop → home).

**What to build:**
1. **Landmark Placement**
   - Mark placements as landmarks
   - Set landmark type (Town, Dungeon, Shop, etc.)
   - Link to nested map (or create new)

2. **Nested Map Editor**
   - Same editor, but for nested map
   - Load nested map when landmark clicked
   - Show parent map context
   - Save nested map changes

**Estimated effort:** 2-3 hours
**Risk:** Low (builds on placement system)

---

## 🚀 Recommended Workflow

### Immediate Next Step: **Cell Selection System**

This is the safest next step because:
1. ✅ It's additive (won't break existing functionality)
2. ✅ It's foundational (needed for cell grouping)
3. ✅ It's isolated (only touches selection layer)
4. ✅ Low risk of breaking the app

**Implementation Plan:**
1. Add cell selection state to `mapEditorStore.ts`
2. Create `CellSelectionLayer.tsx` component
3. Integrate into `MapCanvas.tsx`
4. Add cell selection to status bar
5. Test with existing map

**After Cell Selection:**
- Then build Placement System (Step 2)
- Then build Cell Grouping (Step 3)
- Then build Landmarks (Step 4)

---

## ⚠️ Error Prevention Strategy

To avoid breaking the application:

1. **Incremental Changes**
   - One feature at a time
   - Test after each change
   - Don't refactor existing code unless necessary

2. **Isolated Components**
   - New features in new components
   - Minimal changes to existing components
   - Use composition over modification

3. **Error Boundaries**
   - Wrap new components in error boundaries
   - Graceful fallbacks for missing data
   - Try/catch around API calls

4. **Type Safety**
   - Use TypeScript strictly
   - Add types for new features
   - Don't use `any` types

5. **Testing Strategy**
   - Manual smoke tests after each feature
   - Test happy path first
   - Test error cases second

---

## 📋 Quick Reference: What's Missing

- ❌ **Cell Selection** - Can't select cells on map
- ❌ **Placement Rendering** - Can't see placements on canvas
- ❌ **Placement Tools** - Can't place items on map
- ❌ **Placement List** - Can't see/edit list of placements
- ❌ **Cell Grouping** - Can't group cells into environments
- ❌ **Nested Maps** - Can't navigate to nested maps
- ❌ **Landmarks** - Can't place landmarks that link to nested maps

---

## 🎯 Success Criteria

**After Cell Selection:**
- ✅ Can click on map to select a cell
- ✅ Selected cell is visually highlighted
- ✅ Can multi-select cells (Ctrl+Click, drag box)
- ✅ Status bar shows selected cell coordinates
- ✅ No errors in console
- ✅ Existing features still work

**After Placement System:**
- ✅ Can place items on map (props, spawn points, landmarks)
- ✅ Can see placements rendered on canvas
- ✅ Can select, move, delete placements
- ✅ Can edit placement properties
- ✅ Placements persist to database
- ✅ Undo/redo works for placements

---

## 🚀 Ready to Start?

**Next Task:** Implement Cell Selection System

This will give you the foundation for:
- Cell grouping
- Nested environments
- Advanced map editing features

**Estimated Time:** 2-3 hours
**Risk Level:** Low
**Breaking Changes:** None (additive feature)

