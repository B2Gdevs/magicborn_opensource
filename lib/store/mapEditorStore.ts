// lib/store/mapEditorStore.ts
// Professional map editor state management with undo/redo, multi-select, and history

import { create } from "zustand";
import type { MapDefinition } from "@/lib/data/maps";
import type { MapPlacement } from "@/lib/data/mapPlacements";
import type { PrecisionLevel } from "@core/mapEnums";

export interface MapEditorHistoryEntry {
  type: "placement_created" | "placement_updated" | "placement_deleted" | "placements_moved" | "placements_copied";
  timestamp: number;
  data: {
    placements?: MapPlacement[];
    previousPlacements?: MapPlacement[];
  };
}

export interface MapEditorState {
  // Current map
  selectedMapId: string | null;
  selectedMap: MapDefinition | null;
  
  // Placements (loaded separately from API)
  placements: MapPlacement[];
  
  // Viewport state
  zoom: number;
  panX: number;
  panY: number;
  
  // Grid & snapping
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number; // Base grid size in pixels
  
  // Selection
  selectedPlacementIds: string[];
  clipboard: MapPlacement[];
  
  // Cell Selection (for regions/nested maps)
  selectedCells: Array<{ cellX: number; cellY: number }>;
  selectionMode: "placement" | "cell"; // What type of selection is active
  isSelectingCells: boolean; // Whether user is currently selecting cells (drag)
  selectionStartCell: { cellX: number; cellY: number } | null; // For drag selection
  
  // Map Regions (persistent cell selections with nested maps)
  // Regions override parent map's environment properties
  regions: Array<{
    id: string;
    mapId: string; // Parent map
    name: string;
    cells: Array<{ cellX: number; cellY: number }>; // Selected cells that define boundaries
    nestedMapId?: string; // Link to nested map (if created)
    color: string; // Unique color for visual distinction
    metadata: {
      // Environment properties that override parent map's default
      biome?: string; // Overrides world default (Mountain, Forest, Swamp, Interior, etc.)
      climate?: string; // Overrides world default (Cold, Warm, Temperate, Humid, etc.)
      dangerLevel?: number; // Overrides world default (0-5)
      creatures?: string[]; // Specific creatures for this region
      completion?: {
        totalCells: number;
        completedCells: number;
        percentage: number;
      };
    };
  }>;
  selectedRegionId: string | null; // Currently selected region (for editing)
  
  // History (undo/redo)
  history: MapEditorHistoryEntry[];
  historyIndex: number; // Current position in history (-1 = no history)
  maxHistorySize: number; // Limit history to prevent memory issues
  
  // Tools
  activeTool: "select" | "place" | "move" | "delete";
  
  // Actions - Map
  setSelectedMap: (map: MapDefinition | null) => void;
  setSelectedMapId: (id: string | null) => void;
  
  // Actions - Viewport
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  fitToViewport: () => void;
  
  // Actions - Grid
  toggleGrid: () => void;
  toggleSnap: () => void;
  setGridSize: (size: number) => void;
  
  // Actions - Selection
  selectPlacement: (id: string, addToSelection?: boolean) => void;
  selectPlacements: (ids: string[]) => void;
  clearSelection: () => void;
  selectAll: () => void;
  
  // Actions - Cell Selection
  selectCell: (cellX: number, cellY: number, addToSelection?: boolean) => void;
  selectCellRange: (startCell: { cellX: number; cellY: number }, endCell: { cellX: number; cellY: number }) => void;
  clearCellSelection: () => void;
  setSelectionMode: (mode: "placement" | "cell") => void;
  startCellSelection: (cellX: number, cellY: number) => void;
  updateCellSelection: (cellX: number, cellY: number) => void;
  endCellSelection: () => void;
  
  // Actions - Regions
  loadRegions: (mapId: string) => Promise<void>;
  addRegion: (region: {
    id: string;
    mapId: string; // Parent map
    name: string;
    cells: Array<{ cellX: number; cellY: number }>; // Selected cells
    nestedMapId?: string; // Link to nested map
    color: string; // Unique color
    metadata: {
      // Environment properties (override parent map's default)
      biome?: string;
      climate?: string;
      dangerLevel?: number;
      creatures?: string[];
      completion?: {
        totalCells: number;
        completedCells: number;
        percentage: number;
      };
    };
  }) => void;
  selectRegion: (regionId: string | null) => void;
  clearRegionSelection: () => void;
  
  // Actions - Clipboard
  copySelected: () => void;
  paste: (offsetX?: number, offsetY?: number) => void;
  clearClipboard: () => void;
  
  // Actions - History
  addHistoryEntry: (entry: MapEditorHistoryEntry) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
  
  // Actions - Tools
  setActiveTool: (tool: "select" | "place" | "move" | "delete") => void;
  
  // Actions - Placements (with history)
  addPlacement: (placement: MapPlacement) => void;
  updatePlacement: (placement: MapPlacement) => void;
  deletePlacement: (id: string) => void;
  deleteSelectedPlacements: () => void;
  movePlacements: (ids: string[], deltaX: number, deltaY: number) => void;
  setPlacements: (placements: MapPlacement[]) => void;
  loadPlacements: (mapId: string) => Promise<void>;
}

const DEFAULT_ZOOM = 1;
const DEFAULT_PAN = { x: 0, y: 0 };
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;
const ZOOM_STEP = 0.1;
const DEFAULT_GRID_SIZE = 10;
const MAX_HISTORY_SIZE = 50;

export const useMapEditorStore = create<MapEditorState>((set, get) => ({
  // Initial state
  selectedMapId: null,
  selectedMap: null,
  placements: [],
  zoom: DEFAULT_ZOOM,
  panX: DEFAULT_PAN.x,
  panY: DEFAULT_PAN.y,
  showGrid: true,
  snapToGrid: true,
  gridSize: DEFAULT_GRID_SIZE,
  selectedPlacementIds: [],
  clipboard: [],
  selectedCells: [],
  selectionMode: "placement",
  isSelectingCells: false,
  selectionStartCell: null,
  regions: [],
  selectedRegionId: null,
  history: [],
  historyIndex: -1,
  maxHistorySize: MAX_HISTORY_SIZE,
  activeTool: "select",
  
  // Map actions
  setSelectedMap: async (map) => {
    set({ selectedMap: map, selectedMapId: map?.id || null, placements: [] });
    // Reset viewport when changing maps
    get().resetView();
    get().clearSelection();
    get().clearHistory();
    // Load regions for this map
    if (map?.id) {
      await get().loadRegions(map.id);
    }
  },
  
  setSelectedMapId: (id) => {
    set({ selectedMapId: id, selectedMap: null, placements: [] });
    get().resetView();
    get().clearSelection();
    get().clearHistory();
  },
  
  // Viewport actions
  setZoom: (zoom) => {
    const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
    set({ zoom: clampedZoom });
  },
  
  setPan: (x, y) => {
    set({ panX: x, panY: y });
  },
  
  zoomIn: () => {
    const { zoom } = get();
    get().setZoom(zoom + ZOOM_STEP);
  },
  
  zoomOut: () => {
    const { zoom } = get();
    get().setZoom(zoom - ZOOM_STEP);
  },
  
  resetView: () => {
    set({
      zoom: DEFAULT_ZOOM,
      panX: DEFAULT_PAN.x,
      panY: DEFAULT_PAN.y,
    });
  },
  
  fitToViewport: () => {
    const { selectedMap } = get();
    if (!selectedMap) return;
    
    // Calculate zoom to fit map in viewport
    // This will be calculated based on viewport size in the component
    // For now, just reset
    get().resetView();
  },
  
  // Grid actions
  toggleGrid: () => {
    set((state) => ({ showGrid: !state.showGrid }));
  },
  
  toggleSnap: () => {
    set((state) => ({ snapToGrid: !state.snapToGrid }));
  },
  
  setGridSize: (size) => {
    set({ gridSize: Math.max(1, size) });
  },
  
  // Selection actions
  selectPlacement: (id, addToSelection = false) => {
    if (addToSelection) {
      set((state) => ({
        selectedPlacementIds: state.selectedPlacementIds.includes(id)
          ? state.selectedPlacementIds.filter((i) => i !== id)
          : [...state.selectedPlacementIds, id],
      }));
    } else {
      set({ selectedPlacementIds: [id] });
    }
  },
  
  selectPlacements: (ids) => {
    set({ selectedPlacementIds: ids });
  },
  
  clearSelection: () => {
    set({ selectedPlacementIds: [], selectedCells: [] });
  },
  
  selectAll: () => {
    const { placements } = get();
    set({ selectedPlacementIds: placements.map((p) => p.id) });
  },
  
  // Cell Selection actions
  selectCell: (cellX, cellY, addToSelection = false) => {
    const cell = { cellX, cellY };
    if (addToSelection) {
      set((state) => {
        const exists = state.selectedCells.some(
          (c) => c.cellX === cellX && c.cellY === cellY
        );
        if (exists) {
          return {
            selectedCells: state.selectedCells.filter(
              (c) => !(c.cellX === cellX && c.cellY === cellY)
            ),
          };
        }
        return { selectedCells: [...state.selectedCells, cell] };
      });
    } else {
      set({ selectedCells: [cell] });
    }
  },
  
  selectCellRange: (startCell, endCell) => {
    const minX = Math.min(startCell.cellX, endCell.cellX);
    const maxX = Math.max(startCell.cellX, endCell.cellX);
    const minY = Math.min(startCell.cellY, endCell.cellY);
    const maxY = Math.max(startCell.cellY, endCell.cellY);
    
    const cells: Array<{ cellX: number; cellY: number }> = [];
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        cells.push({ cellX: x, cellY: y });
      }
    }
    
    set({ selectedCells: cells });
  },
  
  clearCellSelection: () => {
    set({ selectedCells: [], isSelectingCells: false, selectionStartCell: null });
  },
  
  setSelectionMode: (mode) => {
    const state = get();
    set({ 
      selectionMode: mode,
      selectedPlacementIds: mode === "cell" ? [] : state.selectedPlacementIds,
      // Don't clear selectedCells if we have a selected region - keep it visible
      selectedCells: mode === "placement" && !state.selectedRegionId ? [] : state.selectedCells,
    });
  },
  
  startCellSelection: (cellX, cellY) => {
    set({
      isSelectingCells: true,
      selectionStartCell: { cellX, cellY },
      selectedCells: [{ cellX, cellY }],
      selectionMode: "cell",
    });
  },
  
  updateCellSelection: (cellX, cellY) => {
    const { selectionStartCell } = get();
    if (!selectionStartCell) return;
    
    get().selectCellRange(selectionStartCell, { cellX, cellY });
  },
  
  endCellSelection: () => {
    set({ isSelectingCells: false, selectionStartCell: null });
  },
  
  // Region actions
  loadRegions: async (mapId) => {
    try {
      // TODO: Load from API when ready
      // For now, keep regions in memory only
      // This will be implemented with API integration
      set({ regions: [], selectedRegionId: null });
    } catch (error) {
      console.error("Failed to load regions:", error);
      set({ regions: [], selectedRegionId: null });
    }
  },
  
  addRegion: (region) => {
    set((state) => ({
      regions: [...state.regions, region],
      // Keep cells selected so region is visible, but mark region as selected
      selectedRegionId: region.id,
      // Don't clear selectedCells - keep them visible for the region
    }));
  },
  
  selectRegion: (regionId) => {
    set({ selectedRegionId: regionId });
    const { regions } = get();
    const region = regions.find((r) => r.id === regionId);
    if (region) {
      set({ selectedCells: region.cells, selectionMode: "cell" });
    }
  },
  
  clearRegionSelection: () => {
    set({ selectedRegionId: null, selectedCells: [] });
  },
  
  // Clipboard actions
  copySelected: () => {
    const { selectedPlacementIds, placements } = get();
    if (selectedPlacementIds.length === 0) return;
    
    const selectedPlacements = placements.filter((p) =>
      selectedPlacementIds.includes(p.id)
    );
    set({ clipboard: selectedPlacements });
  },
  
  paste: (offsetX = 0, offsetY = 0) => {
    const { clipboard, placements } = get();
    if (clipboard.length === 0) return;
    
    // Create new placements with offset and new IDs
    const newPlacements = clipboard.map((placement) => ({
      ...placement,
      id: `${placement.id}_copy_${Date.now()}_${Math.random()}`,
      // Apply offset to coordinates (this will need coordinate system utils)
      // For now, just add to placements
    }));
    
    // Add to placements (this will be handled by the component with API calls)
    set({
      placements: [...placements, ...newPlacements],
      selectedPlacementIds: newPlacements.map((p) => p.id),
    });
  },
  
  clearClipboard: () => {
    set({ clipboard: [] });
  },
  
  // History actions
  addHistoryEntry: (entry) => {
    const { history, historyIndex, maxHistorySize } = get();
    
    // Remove any history after current index (when undoing then making new change)
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(entry);
    
    // Limit history size
    if (newHistory.length > maxHistorySize) {
      newHistory.shift();
    }
    
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },
  
  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < 0) return;
    
    const entry = history[historyIndex];
    // Apply undo logic (restore previous state)
    // This will be handled by the component based on entry type
    
    set({ historyIndex: historyIndex - 1 });
  },
  
  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    
    const entry = history[historyIndex + 1];
    // Apply redo logic (restore next state)
    // This will be handled by the component based on entry type
    
    set({ historyIndex: historyIndex + 1 });
  },
  
  canUndo: () => {
    return get().historyIndex >= 0;
  },
  
  canRedo: () => {
    const { history, historyIndex } = get();
    return historyIndex < history.length - 1;
  },
  
  clearHistory: () => {
    set({ history: [], historyIndex: -1 });
  },
  
  // Tool actions
  setActiveTool: (tool) => {
    set({ activeTool: tool });
    // Clear selection when switching tools (except select tool)
    if (tool !== "select") {
      get().clearSelection();
    }
  },
  
  // Placement actions (with history)
  addPlacement: (placement) => {
    const { placements } = get();
    const previousPlacements = [...placements];
    const newPlacements = [...placements, placement];
    
    set({ placements: newPlacements });
    
    // Add to history
    get().addHistoryEntry({
      type: "placement_created",
      timestamp: Date.now(),
      data: {
        placements: [placement],
        previousPlacements: previousPlacements,
      },
    });
  },
  
  updatePlacement: (placement) => {
    const { placements } = get();
    const previousPlacement = placements.find((p) => p.id === placement.id);
    if (!previousPlacement) return;
    
    const newPlacements = placements.map((p) =>
      p.id === placement.id ? placement : p
    );
    
    set({ placements: newPlacements });
    
    // Add to history
    get().addHistoryEntry({
      type: "placement_updated",
      timestamp: Date.now(),
      data: {
        placements: [placement],
        previousPlacements: [previousPlacement],
      },
    });
  },
  
  deletePlacement: (id) => {
    const { placements } = get();
    const placement = placements.find((p) => p.id === id);
    if (!placement) return;
    
    const newPlacements = placements.filter((p) => p.id !== id);
    
    set({
      placements: newPlacements,
      selectedPlacementIds: get().selectedPlacementIds.filter((i) => i !== id),
    });
    
    // Add to history
    get().addHistoryEntry({
      type: "placement_deleted",
      timestamp: Date.now(),
      data: {
        placements: [placement],
        previousPlacements: newPlacements,
      },
    });
  },
  
  deleteSelectedPlacements: () => {
    const { selectedPlacementIds } = get();
    selectedPlacementIds.forEach((id) => get().deletePlacement(id));
  },
  
  movePlacements: (ids, deltaX, deltaY) => {
    const { placements } = get();
    
    // This will need coordinate system utils to properly move placements
    // For now, just update the store
    // The actual coordinate transformation will happen in the component
    const updatedPlacements = placements.map((p) => {
      if (ids.includes(p.id)) {
        // Apply delta to coordinates (needs coordinate system utils)
        return p; // Placeholder
      }
      return p;
    });
    
    set({ placements: updatedPlacements });
  },
  
  // Actions - Placements (load from API)
  setPlacements: (placements: MapPlacement[]) => {
    set({ placements });
  },
  
  loadPlacements: async (mapId: string) => {
    // This will be called by the component to load placements from API
    // For now, just clear placements
    set({ placements: [] });
  },
}));

