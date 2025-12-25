# Map Editor Documentation

Complete documentation for the Map Editor system.

## 📚 Documentation Structure

### Main Guide
- **[MAP_EDITOR_GUIDE.md](./MAP_EDITOR_GUIDE.md)** - **START HERE** - Complete guide with code examples
  - Selection modes (Placement vs Cell Selection)
  - Region system (base region, child regions, colors)
  - Coordinate system overview
  - UI controls and toggles
  - Code examples

### Technical Documentation
- **[COORDINATE_SYSTEM_ARCHITECTURE.md](./technical/COORDINATE_SYSTEM_ARCHITECTURE.md)** - Core architecture
  - Unreal units as source of truth
  - Flexible image sizes
  - Hierarchical granularity
  - Base region concept

- **[GRID_SYSTEM.md](./technical/GRID_SYSTEM.md)** - Grid system details
  - Cell coordinates
  - Grid alignment
  - Zoom behavior
  - Standard cell counts

- **[MAP_SIZING_STANDARDS.md](./technical/MAP_SIZING_STANDARDS.md)** - Standard map sizes
  - Map level configurations
  - Cell size calculations
  - Unreal unit mappings

## 🎯 Quick Reference

### Selection Modes

**Placement Mode (Default):**
- Click to place items (props, spawn points, landmarks)
- Status bar: `Mode: Placement` (orange)
- Toolbar: Mouse pointer icon (orange)

**Cell Selection Mode:**
- Click and drag to select cells
- Create regions from selections
- Status bar: `Mode: Cell Selection` (blue)
- Toolbar: Square icon (blue)

### Region Visibility

**Base Region:**
- **Always hidden** - Never rendered, represents entire map
- Becomes base when loading nested map

**Child Regions:**
- **Visible by default** - Shown when `showRegions` is true
- **Toggle:** Info button (ℹ️) → "Show Regions" checkbox
- **Selected regions:** Always visible (even when toggled off)

### Toggle Controls

- **Grid:** `G` key or toolbar button
- **Snap to Grid:** `S` key (when grid is on)
- **Regions:** Info button (ℹ️) → "Show Regions" checkbox
- **Cell Selection Display:** Info button (ℹ️) → "Cell Selection" checkbox
- **Map Completion:** Info button (ℹ️) → "Map Completion" checkbox

## 🔗 Related Documentation

- [Environment Editor Documentation](../environment-editor/)
- [Technical Documentation](../technical/)




