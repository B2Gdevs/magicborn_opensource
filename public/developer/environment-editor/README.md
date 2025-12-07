# Environment Editor Documentation

## 📚 Documentation Structure

All Environment Editor documentation is organized here for easy navigation.

---

## 🎯 Start Here

### **For Users:**
1. **[Data Relationships](user-guides/MAP_EDITOR_DATA_RELATIONSHIPS.md)** - Understand the core model (World Map → Regions → Nested Maps)
2. **[User Guide](user-guides/MAP_EDITOR_USER_GUIDE.md)** - Step-by-step workflows (first-time + existing data)
3. **[Quick Examples](user-guides/QUICK_EXAMPLES.md)** - Real-world examples

### **For Developers:**
1. **[Component Breakdown](COMPONENT_BREAKDOWN.md)** - What each component does and how to extend it
2. **[Architecture Plan](../architecture/environment-editor-plan.md)** - Technical design and data structures
3. **[Coordinate System](../technical/coordinate-system-notes.md)** - Coordinate conversion details

---

## 📁 Documentation Files

### **User Guides** (`user-guides/`)
- **MAP_EDITOR_DATA_RELATIONSHIPS.md** - Core data model and relationships
- **MAP_EDITOR_USER_GUIDE.md** - Complete user guide (first-time + existing workflows)
- **QUICK_EXAMPLES.md** - Quick real-world examples
- **QUICK_START_GUIDE.md** - 5-minute quick start

### **Component Documentation** (`./`)
- **COMPONENT_BREAKDOWN.md** - Detailed component breakdown and extension guide

### **Architecture** (`../architecture/`)
- **environment-editor-plan.md** - Complete architecture plan

### **Technical** (`../technical/`)
- **MAP_SIZING_STANDARDS.md** - Standard sizing for map levels
- **UNREAL_ENGINE_MAPPING.md** - Unreal Engine integration
- **SELECTION_AND_PLACEMENT_SYSTEM.md** - Selection vs placement system
- **coordinate-system-notes.md** - Coordinate system details

---

## 🎯 Core Concepts

### **Data Model:**
```
World Map (Foundation)
  ├── Default Environment: "World Environment" (baseline, stable)
  └── Regions (Override World Environment)
      ├── Region: "Frozen Loom"
      │   ├── Environment Override: Mountain, Cold, Danger 3
      │   └── Nested Map: "Frozen Loom Map" (inherits from region)
      └── Region: "Xingdom Huld"
          ├── Environment Override: Forest, Temperate, Danger 1
          └── Nested Map: "Xingdom Huld Map" (inherits from region)
```

### **Key Principles:**
1. **World Map** = Foundation with default environment
2. **Regions** = Override world's default with specific properties
3. **Nested Maps** = Inherit from parent region
4. **Can override again** = Regions on nested maps can override parent

---

## 🔄 Workflow Pattern

### **Repeatable Pattern:**
1. **Select Map** (World Map or Nested Map)
2. **Select Cells** (use Cell Selection tool, drag to select)
3. **Create Region** (set environment properties that override parent)
4. **Create Nested Map** (optional - inherits from region)
5. **Repeat** on nested map if needed

---

## 🧩 Components

### **Main Components:**
- **EnvironmentEditor.tsx** - Main container
- **MapCanvas.tsx** - Canvas with zoom/pan
- **GridLayer.tsx** - Grid overlay
- **CellSelectionLayer.tsx** - Selected cells/regions rendering
- **CellSelectionFeedback.tsx** - Selection feedback panel
- **StatusBar.tsx** - Bottom status bar
- **MapCompletionIndicator.tsx** - Completion tracking
- **MapForm.tsx** - Map creation/editing form
- **EnvironmentForm.tsx** - Environment creation/editing form

See **[COMPONENT_BREAKDOWN.md](COMPONENT_BREAKDOWN.md)** for details.

---

## 📋 Quick Reference

### **First Time Setup:**
1. Create World Map → Set default environment
2. Select cells → Create region → Set environment properties
3. Create nested map → Inherits from region
4. Add more regions → Repeat pattern

### **Working with Existing:**
1. Select map → View existing content
2. Click region → Edit properties or nested map
3. Click placement → Edit placement
4. Add more → Use same tools

### **Keyboard Shortcuts:**
- `G` - Toggle grid
- `S` - Toggle snap
- `+` / `-` - Zoom in/out
- `0` - Reset view
- `F` - Fit to viewport
- `Ctrl+Z` - Undo
- `Ctrl+Shift+Z` - Redo

---

## 🔗 Related Systems

- **Coordinate System** - Pixel → Unreal → Cell conversion
- **Placement System** - Props, landmarks, spawn points
- **Selection System** - Cell selection for regions
- **Unreal Integration** - Export format and mapping

---

For specific questions, see the relevant documentation file.

