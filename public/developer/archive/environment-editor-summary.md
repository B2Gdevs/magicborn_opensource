# Environment Editor - Final Summary & Requirements

## 🎯 What We're Building

A **grid-based map editor** for placing props, spawn points, and interactables on 2D map images, with coordinate translation to Unreal Engine.

---

## 📋 Core Requirements Review

### 1. **Environment Manager**
- Create/edit/delete environments (top-level locations)
- Associate markdown stories (like characters/creatures)
- Link to maps
- Store in: SQLite database + images in `public/game-content/environments/`

### 2. **Map Editor** (The Main Feature)
- **Grid-based canvas** with zoom/pan
- **2D map image** as background
- **Click to place** items (props, spawn points, zones)
- **Multi-cell selection** (click and drag)
- **Coordinate system:**
  - Pixel coordinates (from image)
  - Unreal unit conversion (configurable per map)
  - Precision levels (zone/cell/pixel/Unreal direct)
- **Precision warnings** (e.g., "placing health potion at pixel precision = 12m x 12m in Unreal")
- **Save placements** to database
- **Export to JSON** for Unreal import

### 3. **Scene Editor** (Future)
- Define scenes within maps
- Camera/lighting settings
- Combat scene configuration

### 4. **Prop Library** (Simplified)
- Browse available props
- Select prop for placement
- Filter by type/tags
- (Prop creation/editing can be added later)

---

## 🗂️ File Structure

### Database (SQLite)
```
Tables:
- environments (id, name, description, imagePath, storyIds, mapIds, ...)
- maps (id, environmentId, name, imagePath, unrealMapSize, imageDimensions, ...)
- map_placements (id, mapId, type, itemId, coordinates, precisionLevel, ...)
- props (id, name, type, imagePath, recommendedPrecision, ...) - Future
```

### File System (`public/game-content/`)
```
game-content/
├── environments/     # Environment thumbnails
│   └── {environmentId}.png
├── maps/            # Map reference images (2D backgrounds)
│   └── {mapId}.png
└── props/           # Prop images (future)
    └── {propId}.png
```

**Image Paths in Database:**
- Stored as: `game-content/environments/tarro.png`
- Accessed as: `/game-content/environments/tarro.png` (Next.js public folder)

---

## 🛠️ Technology Stack

### Core Libraries
1. **react-konva** - Canvas rendering, zoom/pan, grid drawing
2. **zustand** - State management (already installed)
3. **framer-motion** - UI animations (already installed)

### What We're NOT Using (For Now)
- ❌ Viewport culling (premature optimization)
- ❌ Three.js (overkill for 2D)
- ❌ Complex drag-and-drop (click to place is simpler)

---

## 🏗️ Component Structure

```
EnvironmentEditor (Main Container)
├── EnvironmentList (Left Sidebar)
│   └── List of environments, create button
│
├── MapEditor (Center - Main Canvas)
│   ├── MapCanvas (react-konva Stage)
│   │   ├── MapBackground (Image)
│   │   ├── GridLayer (Grid lines)
│   │   ├── PlacementLayer (Placed items)
│   │   └── SelectionLayer (Selected cells)
│   │
│   ├── MapToolbar (Top)
│   │   ├── ZoomControls
│   │   ├── PrecisionSelector
│   │   └── GridToggle
│   │
│   └── CoordinateDisplay (Bottom)
│       └── Shows pixel + Unreal coordinates
│
└── PropertiesPanel (Right Sidebar)
    ├── PropLibrary (Browse/select props)
    └── PlacementList (All placements on map)
```

---

## 📊 Coordinate System

### Precision Levels

1. **Zone (Low Precision)**
   - Large areas (100x100 pixels = ~140m x 140m in Unreal)
   - Use for: Spawn zones, encounter areas
   - Unreal code handles exact placement within zone

2. **Cell (Medium Precision)**
   - Grid cells (10x10 pixels = ~14m x 14m in Unreal)
   - Use for: Buildings, large props

3. **Pixel (High Precision)**
   - Individual pixels (1 pixel = ~12m in Unreal on 12km map)
   - Use for: Medium props
   - **Warning shown:** "This covers X meters - may be imprecise"

4. **Unreal Direct (Maximum Precision)**
   - Direct Unreal unit coordinates
   - Use for: Critical placements, small items
   - Bypasses pixel conversion

### Coordinate Conversion
```typescript
// Simple math - no library needed
pixelToUnreal(pixelX, pixelY, imageWidth, imageHeight, unrealWidth, unrealHeight)
```

---

## ✅ MVP Features (The 20% That Gives 80% Value)

1. ✅ Load map image as background
2. ✅ Zoom/pan around map
3. ✅ Grid that adjusts with zoom
4. ✅ Click to place items
5. ✅ Multi-cell selection
6. ✅ Coordinate display (pixel + Unreal)
7. ✅ Precision selector with warnings
8. ✅ Save placements to database
9. ✅ Export to JSON for Unreal

**Can Add Later:**
- Templates
- Advanced prop editor
- Scene editor
- Real-time collaboration

---

## 🚀 Implementation Phases

### Phase 1: MVP (2-3 days)
1. Install react-konva
2. Create database schema (environments, maps, placements)
3. Create file folders (`game-content/environments/`, `game-content/maps/`)
4. Build MapCanvas with zoom/pan
5. Add grid rendering
6. Implement click to place
7. Add coordinate system
8. Save/load from database
9. Export to JSON

### Phase 2: Polish (1-2 days)
1. Multi-cell selection
2. Precision warnings
3. Better UX (tooltips, keyboard shortcuts)
4. Placement editing (move, delete)

### Phase 3: Advanced (Future)
1. Scene editor
2. Templates
3. Prop editor
4. Environmental modifiers

---

## 🎨 Key Considerations

### Performance
- **No viewport culling needed** - react-konva handles moderate item counts well
- Use `React.memo` for placement components
- Debounce zoom/pan updates

### Data-Driven
- All placements saved to database
- Images stored in `public/game-content/`
- Export format is Unreal-friendly JSON
- Coordinate system configurable per map

### User Experience
- Visual feedback before placement
- Precision warnings for small items
- Coordinate display always visible
- Keyboard shortcuts (zoom, pan, delete)

---

## 📝 Next Steps

1. ✅ Review complete
2. ✅ File structure decided (`game-content/`)
3. ✅ Technology stack chosen (react-konva + zustand)
4. ⏭️ Create database schema
5. ⏭️ Create file folders
6. ⏭️ Start implementing MapCanvas

---

## ❓ Questions Answered

**Q: Why viewport culling?**
A: Not needed for MVP. Only useful if you have thousands of items. react-konva handles 10-100 items easily. Premature optimization.

**Q: Where to store files?**
A: `public/game-content/` - environments, maps, props (future)

**Q: What's the 20% that gives 80% value?**
A: Grid canvas + click to place + coordinate system + save to database + export to JSON

