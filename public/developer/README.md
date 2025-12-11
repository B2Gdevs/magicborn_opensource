# Developer Documentation

## 📚 Documentation Structure

### **Environment Editor** (`environment-editor/`)
**Complete documentation for the Environment Editor**

- **README.md** - Environment Editor documentation index
- **COMPONENT_BREAKDOWN.md** - Component breakdown and extension guide
- **ARCHITECTURE.md** - Complete architecture plan
- **ROADMAP.md** - Development roadmap and next steps
- **user-guides/** - User guides and workflows
  - **MAP_EDITOR_DATA_RELATIONSHIPS.md** - Core data model and relationships
  - **MAP_EDITOR_USER_GUIDE.md** - Complete user guide
  - **QUICK_EXAMPLES.md** - Quick real-world examples
  - **QUICK_START_GUIDE.md** - 5-minute quick start

### **Architecture** (`architecture/`)
**High-level design and planning**

- **overview.md** - System overview

### **Technical** (`technical/`)
**Implementation details and technical documentation**

- **MAP_SIZING_STANDARDS.md** - Standard sizing for map levels
- **UNREAL_ENGINE_MAPPING.md** - Unreal Engine integration guide
- **SELECTION_AND_PLACEMENT_SYSTEM.md** - Selection vs placement system
- **coordinate-system-notes.md** - Coordinate system details

### **Magicborn Assistant** (`magicborn-assistant/`)
**AI Assistant (powered by OpenWebUI) for game database and documentation access**

- **SUMMARY.md** - Overview, features, and known limitations
- **Magicborn Ingestion (RAG).md** - Quick start and RAG setup guide
- **TOOLS_SETUP.md** - REST API tool server configuration


---

## 🎯 Quick Navigation

### **New to the Environment Editor?**
1. Start with: **environment-editor/user-guides/MAP_EDITOR_DATA_RELATIONSHIPS.md** (understand the model)
2. Then read: **environment-editor/user-guides/MAP_EDITOR_USER_GUIDE.md** (learn how to use it)
3. See examples: **environment-editor/user-guides/QUICK_EXAMPLES.md** (real-world scenarios)

### **Building Your First World?**
1. Read: **environment-editor/user-guides/MAP_EDITOR_USER_GUIDE.md** → "First Time Setup" section
2. Follow: Step-by-step workflow
3. Reference: **environment-editor/user-guides/QUICK_START_GUIDE.md** for quick start

### **Working with Existing Data?**
1. Read: **environment-editor/user-guides/MAP_EDITOR_USER_GUIDE.md** → "Working with Existing Data" section
2. Understand: How to navigate hierarchy
3. Edit: Regions, maps, placements

### **Understanding Components?**
1. Read: **environment-editor/COMPONENT_BREAKDOWN.md** (what each component does)
2. See: **environment-editor/ARCHITECTURE.md** (technical design)
3. Check: **environment-editor/ROADMAP.md** (development roadmap)

### **Using Magicborn Assistant?**
1. Start with: **magicborn-assistant/SUMMARY.md** (overview and limitations)
2. Quick start & RAG: **magicborn-assistant/Magicborn Ingestion (RAG).md** (setup guide)
3. Setup tools: **magicborn-assistant/TOOLS_SETUP.md** (REST API tool server)

---

## 📊 Core Data Model

```
World Map (Foundation)
  ├── Default Environment: "World Environment" (baseline, stable)
  │   ├── Biome: (default)
  │   ├── Climate: (default)
  │   └── Danger Level: 0 (safe)
  │
  └── Regions (Override World Environment)
      ├── Region: "Frozen Loom"
      │   ├── Environment Override: Mountain, Cold, Danger 3
      │   └── Nested Map: "Frozen Loom Map" (inherits from region)
      │       └── Regions (can override again)
      │
      └── Region: "Xingdom Huld"
          ├── Environment Override: Forest, Temperate, Danger 1
          └── Nested Map: "Xingdom Huld Map" (inherits from region)
```

**Key Principles:**
- **World Map** = Foundation with default environment
- **Regions** = Override world's default with specific properties
- **Nested Maps** = Inherit from parent region
- **Can override again** = Regions on nested maps can override parent

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

See **environment-editor/COMPONENT_BREAKDOWN.md** for details.

---

## 📝 Documentation Status

### **✅ Up to Date:**
- All Environment Editor documentation consolidated in `environment-editor/`
- Component breakdown created
- User guides organized
- Architecture plan updated
- Roadmap consolidated

---

## 🎯 Key Concepts

### **World Map**
- Foundation map where players start
- Has default "World Environment" (safe, neutral)
- Contains multiple regions with different properties

### **Region**
- Selection of cells on a map
- Overrides parent map's environment properties
- Defines boundaries (cell edges)
- Can create nested map

### **Nested Map**
- Detailed view of a region
- Inherits environment properties from parent region
- Can have its own regions that override again

### **Environment Properties**
- Biome, Climate, Danger Level, Creatures
- Set at region level (overrides parent)
- Inherited by nested maps

---

For specific questions, see the relevant documentation file in **environment-editor/**.
