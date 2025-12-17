// lib/store/mapEditorStore.ts
// Professional map editor state management with undo/redo, multi-select, and history

import { create } from "zustand";
import type { MapDefinition } from "@/lib/data/maps";
import type { MapPlacement } from "@/lib/data/mapPlacements";
import type { PrecisionLevel } from "@core/mapEnums";
import { generateRegionColor } from "@/lib/data/mapRegions";

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
  mapNavigationStack: Array<{ mapId: string; mapName: string; regionId?: string; regionName?: string }>; // For nested map navigation
  
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
  // Store as bounding box for efficiency (minX, minY, maxX, maxY)
  selectedCellBounds: { minX: number; minY: number; maxX: number; maxY: number } | null;
  selectionMode: "placement" | "cell"; // What type of selection is active
  isSelectingCells: boolean; // Whether user is currently selecting cells (drag)
  selectionStartCell: { cellX: number; cellY: number } | null; // For drag selection
  
  // Map Regions (persistent cell selections with nested maps)
  // Regions override parent map's environment properties
  // All regions are squares stored as minX, minY, width, height
  regions: Array<{
    id: string;
    mapId: string; // Parent map
    parentRegionId?: string; // Parent region (if nested within another region)
    name: string;
    minX: number; // Left edge of square (cell X coordinate)
    minY: number; // Top edge of square (cell Y coordinate)
    width: number; // Width of square in cells
    height: number; // Height of square in cells
    environmentId?: string; // Associated environment template
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
  
  // Display visibility controls
  showCellSelectionDisplay: boolean;
  showMapCompletionDisplay: boolean;
  showInheritanceChainDisplay: boolean;
  visibleRegionIds: Set<string>; // Set of region IDs that are visible on map
  
  // Helper: Get selected cells array from bounds (for compatibility)
  getSelectedCells: () => Array<{ cellX: number; cellY: number }>;
  
  // History (undo/redo)
  history: MapEditorHistoryEntry[];
  historyIndex: number; // Current position in history (-1 = no history)
  maxHistorySize: number; // Limit history to prevent memory issues
  
  // Tools
  activeTool: "select" | "place" | "move" | "delete";
  
  // Actions - Map
  setSelectedMap: (map: MapDefinition | null) => void;
  setSelectedMapId: (id: string | null) => void;
  navigateToNestedMap: (nestedMapId: string, regionId?: string, regionName?: string) => Promise<void>;
  navigateBackToParent: () => Promise<void>;
  
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
  // Force selection to be a square (use the larger dimension for both width and height)
  selectCellSquare: (startCell: { cellX: number; cellY: number }, endCell: { cellX: number; cellY: number }) => void;
  selectAllCells: () => void;
  clearCellSelection: () => void;
  setSelectionMode: (mode: "placement" | "cell") => void;
  startCellSelection: (cellX: number, cellY: number) => void;
  updateCellSelection: (cellX: number, cellY: number) => void;
  endCellSelection: () => void;
  
  // Actions - Display Visibility
  toggleCellSelectionDisplay: () => void;
  toggleMapCompletionDisplay: () => void;
  toggleInheritanceChainDisplay: () => void;
  toggleRegionVisibility: (regionId: string) => void;
  setRegionVisibility: (regionId: string, visible: boolean) => void;
  
  // Actions - Regions
  loadRegions: (mapId: string) => Promise<void>;
  addRegion: (region: {
    id: string;
    mapId: string; // Parent map
    name: string;
    cells: Array<{ cellX: number; cellY: number }>; // Selected cells
    nestedMapId?: string; // Link to nested map
    environmentId?: string; // Associated environment template
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
  }) => Promise<void>;
  updateRegion: (region: {
    id: string;
    mapId: string;
    name: string;
    cells: Array<{ cellX: number; cellY: number }>;
    nestedMapId?: string;
    environmentId?: string;
    color: string;
    metadata: {
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
  }) => Promise<void>;
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
  mapNavigationStack: [],
  placements: [],
  zoom: DEFAULT_ZOOM,
  panX: DEFAULT_PAN.x,
  panY: DEFAULT_PAN.y,
  showGrid: true,
  snapToGrid: true,
  gridSize: DEFAULT_GRID_SIZE,
  selectedPlacementIds: [],
  clipboard: [],
  selectedCellBounds: null,
  selectionMode: "placement",
  isSelectingCells: false,
  selectionStartCell: null,
  regions: [],
  selectedRegionId: null,
  showCellSelectionDisplay: true,
  showMapCompletionDisplay: true,
  showInheritanceChainDisplay: true,
  visibleRegionIds: new Set<string>(), // Start with empty set - regions must be explicitly shown
  history: [],
  historyIndex: -1,
  maxHistorySize: MAX_HISTORY_SIZE,
  activeTool: "select",
  
  // Map actions
  setSelectedMap: async (map) => {
    console.log("[setSelectedMap] Called with map:", map ? { id: map.id, name: map.name, imagePath: map.imagePath } : null);
    // Preserve selectedRegionId before loading regions
    const currentSelectedRegionId = get().selectedRegionId;
    console.log("[setSelectedMap] Current selectedRegionId:", currentSelectedRegionId);
    
    console.log("[setSelectedMap] Setting map in store...");
    set({ selectedMap: map, selectedMapId: map?.id || null, placements: [] });
    
    const afterSet = get();
    console.log("[setSelectedMap] Store state after set:", {
      selectedMapId: afterSet.selectedMapId,
      selectedMap: afterSet.selectedMap ? { id: afterSet.selectedMap.id, name: afterSet.selectedMap.name } : null
    });
    
    // Don't reset viewport - let MapCanvas auto-fit
    get().clearSelection();
    get().clearHistory();
    // Load regions for this map (this will preserve selectedRegionId if valid)
    if (map?.id) {
      console.log("[setSelectedMap] Calling loadRegions for mapId:", map.id);
      await get().loadRegions(map.id);
      console.log("[setSelectedMap] loadRegions completed");
      // After loading, if we had a selected region and it's not in the loaded regions,
      // we need to check if it should be selected (e.g., if it's the region that uses this map)
      const { selectedRegionId, regions } = get();
      if (currentSelectedRegionId && !selectedRegionId) {
        // Check if the previously selected region should be selected for this map
        // This happens when selecting a region that uses this map as its parent
        const shouldSelectRegion = regions.some(r => r.id === currentSelectedRegionId);
        if (!shouldSelectRegion) {
          // The selected region might be from a different map, try to find it in all regions
          const { mapRegionClient } = await import("@/lib/api/clients");
          const allRegions = await mapRegionClient.list();
          const regionToSelect = allRegions.find(r => r.id === currentSelectedRegionId);
          if (regionToSelect && (regionToSelect.mapId === map.id || regionToSelect.nestedMapId === map.id)) {
            // This region uses this map, so select it
            get().selectRegion(currentSelectedRegionId);
          }
        }
      }
    }
  },
  
  setSelectedMapId: (id) => {
    set({ selectedMapId: id, selectedMap: null, placements: [], mapNavigationStack: [] });
    get().resetView();
    get().clearSelection();
    get().clearHistory();
  },
  
  navigateToNestedMap: async (nestedMapId, regionId, regionName) => {
    const { selectedMap } = get();
    if (!selectedMap) return;
    
    // Add current map to navigation stack
    const navigationEntry = {
      mapId: selectedMap.id,
      mapName: selectedMap.name,
      regionId,
      regionName,
    };
    
    set((state) => ({
      mapNavigationStack: [...state.mapNavigationStack, navigationEntry],
    }));
    
    // Load the nested map
    // TODO: Load from API - for now, we'll need to get it from maps list
    // This will be handled by the component that calls this
  },
  
  navigateBackToParent: async () => {
    const { mapNavigationStack } = get();
    if (mapNavigationStack.length === 0) return;
    
    // Pop the last entry
    const parentEntry = mapNavigationStack[mapNavigationStack.length - 1];
    const newStack = mapNavigationStack.slice(0, -1);
    
    set({ mapNavigationStack: newStack });
    
    // Load the parent map
    // TODO: Load from API - for now, we'll need to get it from maps list
    // This will be handled by the component that calls this
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
    
    // TODO: Calculate actual fit based on viewport and map dimensions
    // const config = selectedMap.coordinateConfig;
    // const viewportWidth = ...;
    // const viewportHeight = ...;
    // const scaleX = viewportWidth / config.imageWidth;
    // const scaleY = viewportHeight / config.imageHeight;
    // const zoom = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%
    // set({ zoom, panX: 0, panY: 0 });
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
    set({ selectedPlacementIds: [], selectedCellBounds: null });
  },
  
  selectAll: () => {
    const { placements } = get();
    set({ selectedPlacementIds: placements.map((p) => p.id) });
  },
  
  // Cell Selection actions - using bounding box for efficiency
  selectCell: (cellX, cellY, addToSelection = false) => {
    if (addToSelection) {
      set((state) => {
        if (!state.selectedCellBounds) {
          return { selectedCellBounds: { minX: cellX, minY: cellY, maxX: cellX, maxY: cellY } };
        }
        // Expand bounds to include new cell
        return {
          selectedCellBounds: {
            minX: Math.min(state.selectedCellBounds.minX, cellX),
            minY: Math.min(state.selectedCellBounds.minY, cellY),
            maxX: Math.max(state.selectedCellBounds.maxX, cellX),
            maxY: Math.max(state.selectedCellBounds.maxY, cellY),
          },
        };
      });
    } else {
      set({ selectedCellBounds: { minX: cellX, minY: cellY, maxX: cellX, maxY: cellY } });
    }
  },
  
  selectCellRange: (startCell, endCell) => {
    const minX = Math.min(startCell.cellX, endCell.cellX);
    const maxX = Math.max(startCell.cellX, endCell.cellX);
    const minY = Math.min(startCell.cellY, endCell.cellY);
    const maxY = Math.max(startCell.cellY, endCell.cellY);
    
    set({ selectedCellBounds: { minX, minY, maxX, maxY } });
  },
  
  // Select a square region (always creates a square by using the larger dimension)
  selectCellSquare: (startCell, endCell) => {
    const minX = Math.min(startCell.cellX, endCell.cellX);
    const maxX = Math.max(startCell.cellX, endCell.cellX);
    const minY = Math.min(startCell.cellY, endCell.cellY);
    const maxY = Math.max(startCell.cellY, endCell.cellY);
    
    // Make it a square by using the larger dimension for both width and height
    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    const size = Math.max(width, height);
    
    set({ selectedCellBounds: { minX, minY, maxX: minX + size - 1, maxY: minY + size - 1 } });
  },
  
  clearCellSelection: () => {
    set({ selectedCellBounds: null, isSelectingCells: false, selectionStartCell: null });
  },
  
  setSelectionMode: (mode) => {
    const state = get();
    set({ 
      selectionMode: mode,
      selectedPlacementIds: mode === "cell" ? [] : state.selectedPlacementIds,
      // Don't clear selectedCellBounds if we have a selected region - keep it visible
      selectedCellBounds: mode === "placement" && !state.selectedRegionId ? null : state.selectedCellBounds,
    });
  },
  
  startCellSelection: (cellX, cellY) => {
    set({
      isSelectingCells: true,
      selectionStartCell: { cellX, cellY },
      selectedCellBounds: { minX: cellX, minY: cellY, maxX: cellX, maxY: cellY },
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
  
  selectAllCells: () => {
    const { selectedMap } = get();
    if (!selectedMap?.coordinateConfig) return;
    
    const config = selectedMap.coordinateConfig;
    const totalCellsX = Math.floor(config.imageWidth / config.baseCellSize);
    const totalCellsY = Math.floor(config.imageHeight / config.baseCellSize);
    
    // Select all cells from (0,0) to (totalCellsX-1, totalCellsY-1)
    set({
      selectedCellBounds: {
        minX: 0,
        minY: 0,
        maxX: totalCellsX - 1,
        maxY: totalCellsY - 1,
      },
      selectionMode: "cell",
    });
  },
  
  // Region actions
  loadRegions: async (mapId) => {
    console.log("[loadRegions] Called with mapId:", mapId);
    try {
      const { selectedMap, selectedRegionId, selectedMapId } = get();
      console.log("[loadRegions] Current store state:", {
        selectedMapId,
        selectedMap: selectedMap ? { id: selectedMap.id, name: selectedMap.name } : null,
        selectedRegionId,
        currentRegionsCount: get().regions.length
      });
      
      // If selectedMap doesn't exist but selectedMapId matches, that's okay
      // We might be loading regions before the map is fully set
      // But if selectedMap exists and doesn't match, that's an error
      if (selectedMap && selectedMap.id !== mapId) {
        console.warn(`[loadRegions] Map mismatch: selectedMap.id (${selectedMap.id}) !== mapId (${mapId})`);
        set({ regions: [], selectedRegionId: null });
        return;
      }
      
      // If we don't have selectedMap, we can't create a base region
      // Wait for selectedMap to be set before loading regions
      if (!selectedMap) {
        console.warn(`[loadRegions] Cannot load regions: selectedMap is null for mapId ${mapId}, selectedMapId is ${selectedMapId}`);
        // Don't clear regions - just return and wait for map to be set
        return;
      }
      
      console.log("[loadRegions] selectedMap is valid, loading regions from database...");
      // Load regions from database
      const { mapRegionClient } = await import("@/lib/api/clients");
      const savedRegions = await mapRegionClient.list(mapId);
      console.log("[loadRegions] Loaded", savedRegions.length, "regions from database");
      
      // ALWAYS ensure a base region exists for every map
      // If no base region exists, create one that spans the entire image
      const hasBaseRegion = savedRegions.some(r => r.name === "Base Region");
      
      let finalRegions = savedRegions;
      
      if (!hasBaseRegion) {
        // If map doesn't have coordinateConfig, we can't create a base region
        if (!selectedMap.coordinateConfig) {
          console.warn(`Map ${mapId} has no coordinateConfig, cannot create base region`);
          set({ regions: savedRegions, selectedRegionId: selectedRegionId && savedRegions.some(r => r.id === selectedRegionId) ? selectedRegionId : null });
          return;
        }
        // Create base region covering all cells that fit within the image
        // Use config dimensions (image will be stretched to fit)
        const config = selectedMap.coordinateConfig;
        const totalCellsX = Math.floor(config.imageWidth / config.baseCellSize);
        const totalCellsY = Math.floor(config.imageHeight / config.baseCellSize);
        
        // Validate that cells fit properly
        if (totalCellsX <= 0 || totalCellsY <= 0) {
          console.warn(`Invalid cell calculation for map ${mapId}: ${totalCellsX}x${totalCellsY} cells`);
          set({ regions: savedRegions, selectedRegionId: selectedRegionId && savedRegions.some(r => r.id === selectedRegionId) ? selectedRegionId : null });
          return;
        }
        
        // Base region covers entire map as a square
        const baseRegionId = `${mapId}-base-region`;
        const baseRegion = {
          id: baseRegionId,
          mapId: mapId,
          name: "Base Region", // Always use "Base Region" as the name
          minX: 0,
          minY: 0,
          width: totalCellsX,
          height: totalCellsY,
          color: generateRegionColor(baseRegionId),
          metadata: {
            // Base region inherits from map's environment (empty metadata = inherits all)
          },
        };
        
        // Save base region to database
        try {
          await mapRegionClient.create(baseRegion);
        } catch (error) {
          console.error("Failed to save base region to database:", error);
          // Continue anyway
        }
        
        finalRegions = [...savedRegions, baseRegion];
      }
      
      // Preserve selectedRegionId if it's still valid (region exists in loaded regions)
      // The selected region should be preserved if it's in the loaded regions for this map
      const preserveSelectedId = selectedRegionId && finalRegions.some(r => r.id === selectedRegionId)
        ? selectedRegionId
        : null;
      
      // Auto-add all regions to visibleRegionIds so they show by default (including base region for editing)
      const newVisibleIds = new Set<string>();
      finalRegions.forEach(region => {
        // Auto-show all regions (including base region - it can be toggled but won't highlight on map)
        newVisibleIds.add(region.id);
      });
      
      console.log("[loadRegions] Setting regions in store. Final regions count:", finalRegions.length);
      console.log("[loadRegions] Auto-visible region IDs:", Array.from(newVisibleIds));
      console.log("[loadRegions] Preserving selectedRegionId:", preserveSelectedId);
      set({ 
        regions: finalRegions,
        selectedRegionId: preserveSelectedId,
        visibleRegionIds: newVisibleIds
      });
      
      const afterLoad = get();
      console.log("[loadRegions] Store state after setting regions:", {
        regionsCount: afterLoad.regions.length,
        selectedRegionId: afterLoad.selectedRegionId,
        selectedMap: afterLoad.selectedMap ? { id: afterLoad.selectedMap.id, name: afterLoad.selectedMap.name } : null
      });
    } catch (error) {
      console.error("Failed to load regions:", error);
      const { selectedRegionId, selectedMap } = get();
      // Don't clear selectedMap on error - only clear regions
      // The map should still be selected even if regions fail to load
      set({ 
        regions: [], 
        selectedRegionId: null // Clear on error
        // Keep selectedMap - don't clear it
      });
    }
  },
  
  addRegion: async (region) => {
    // Save to database first
    try {
      const { mapRegionClient } = await import("@/lib/api/clients");
      await mapRegionClient.create(region);
    } catch (error) {
      console.error("Failed to save region to database:", error);
      // Continue anyway - we still want the UI to update
    }
    
    // Update in-memory state
    set((state) => ({
      regions: [...state.regions, region],
      // Keep cells selected so region is visible, but mark region as selected
      selectedRegionId: region.id,
      // Don't clear selectedCellBounds - keep them visible for the region
    }));
  },
  
  updateRegion: async (updatedRegion) => {
    // Update in-memory state
    set((state) => ({
      regions: state.regions.map((r) =>
        r.id === updatedRegion.id ? updatedRegion : r
      ),
      // Update selected cells to match updated region (square)
      selectedCellBounds: {
        minX: updatedRegion.minX,
        minY: updatedRegion.minY,
        maxX: updatedRegion.minX + updatedRegion.width - 1,
        maxY: updatedRegion.minY + updatedRegion.height - 1,
      },
    }));
    
    // Save to database
    try {
      const { mapRegionClient } = await import("@/lib/api/clients");
      await mapRegionClient.update(updatedRegion);
    } catch (error) {
      console.error("Failed to save region to database:", error);
      // Don't throw - we still want the UI to update even if save fails
    }
  },
  
  selectRegion: (regionId) => {
    const { regions, selectedMap } = get();
    const region = regions.find((r) => r.id === regionId);
    if (region) {
      // Just select the region for viewing - don't switch to cell selection mode
      // Clear selectedCellBounds so we don't double-highlight the region
      // The region will be highlighted by the region rendering, not by cell selection
      set({ 
        selectedRegionId: regionId,
        selectedCellBounds: null, // Clear cell selection to prevent double highlighting
        // Don't change selection mode - stay in current mode (placement or cell)
      });
    } else {
      set({ selectedRegionId: null, selectedCellBounds: null });
    }
  },
  
  clearRegionSelection: () => {
    set({ selectedRegionId: null, selectedCellBounds: null });
  },
  
  // Helper: Get selected cells array from bounds
  getSelectedCells: () => {
    const { selectedCellBounds } = get();
    if (!selectedCellBounds) return [];
    
    const cells: Array<{ cellX: number; cellY: number }> = [];
    for (let x = selectedCellBounds.minX; x <= selectedCellBounds.maxX; x++) {
      for (let y = selectedCellBounds.minY; y <= selectedCellBounds.maxY; y++) {
        cells.push({ cellX: x, cellY: y });
      }
    }
    return cells;
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
  },
  
  // Display visibility toggles
  toggleCellSelectionDisplay: () => {
    set((state) => ({ showCellSelectionDisplay: !state.showCellSelectionDisplay }));
  },
  
  toggleMapCompletionDisplay: () => {
    set((state) => ({ showMapCompletionDisplay: !state.showMapCompletionDisplay }));
  },
  
  toggleInheritanceChainDisplay: () => {
    set((state) => ({ showInheritanceChainDisplay: !state.showInheritanceChainDisplay }));
  },
  
  toggleRegionVisibility: (regionId: string) => {
    set((state) => {
      const newVisibleIds = new Set(state.visibleRegionIds);
      if (newVisibleIds.has(regionId)) {
        newVisibleIds.delete(regionId);
      } else {
        newVisibleIds.add(regionId);
      }
      return { visibleRegionIds: newVisibleIds };
    });
  },
  setRegionVisibility: (regionId: string, visible: boolean) => {
    set((state) => {
      const newVisibleIds = new Set(state.visibleRegionIds);
      if (visible) {
        newVisibleIds.add(regionId);
      } else {
        newVisibleIds.delete(regionId);
      }
      return { visibleRegionIds: newVisibleIds };
    });
  },
}));

