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
  history: [],
  historyIndex: -1,
  maxHistorySize: MAX_HISTORY_SIZE,
  activeTool: "select",
  
  // Map actions
  setSelectedMap: (map) => {
    set({ selectedMap: map, selectedMapId: map?.id || null, placements: [] });
    // Reset viewport when changing maps
    get().resetView();
    get().clearSelection();
    get().clearHistory();
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
    set({ selectedPlacementIds: [] });
  },
  
  selectAll: () => {
    const { placements } = get();
    set({ selectedPlacementIds: placements.map((p) => p.id) });
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

