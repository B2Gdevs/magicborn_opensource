// components/environment/MapCanvas.tsx
// Professional map canvas with smooth zoom/pan, keyboard shortcuts, and viewport controls

"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import { useMapEditorStore } from "@/lib/store/mapEditorStore";
import { GridLayer } from "./GridLayer";
import { StatusBar } from "./StatusBar";
import { CellSelectionLayer } from "./CellSelectionLayer";
import { CellSelectionFeedback } from "./CellSelectionFeedback";
import type { EnvironmentDefinition } from "@/lib/data/environments";
import { MapCompletionIndicator } from "./MapCompletionIndicator";
import type { MapDefinition } from "@/lib/data/maps";
import type { PixelCoordinates } from "@/lib/utils/coordinateSystem";
import { pixelToCell } from "@/lib/utils/coordinateSystem";
import { AlertTriangle } from "lucide-react";

interface MapCanvasProps {
  width: number;
  height: number;
  environments?: EnvironmentDefinition[];
  maps?: MapDefinition[];
}

export function MapCanvas({ width, height, environments = [], maps = [] }: MapCanvasProps) {
  const stageRef = useRef<any>(null);
  const isDragging = useRef(false);
  const lastPointerPosition = useRef({ x: 0, y: 0 });
  const spacePressed = useRef(false);
  const justFinishedCellDrag = useRef(false); // Track if we just finished a cell drag
  const [mouseCoords, setMouseCoords] = useState<PixelCoordinates | null>(null);

  const {
    selectedMap,
    zoom,
    panX,
    panY,
    setZoom,
    setPan,
    zoomIn,
    zoomOut,
    resetView,
    fitToViewport,
    showGrid,
    snapToGrid,
    selectionMode,
    selectCell,
    startCellSelection,
    updateCellSelection,
    endCellSelection,
    isSelectingCells,
    regions,
    selectRegion,
    selectAllCells,
  } = useMapEditorStore();
  
  // Lock zoom to 100% when in cell selection mode
  // Use a more lenient check to handle floating point precision
  useEffect(() => {
    if (selectionMode === "cell" && Math.abs(zoom - 1.0) > 0.001) {
      setZoom(1.0);
    }
  }, [selectionMode, zoom, setZoom]);
  
  // Auto-fit viewport when map loads (only on initial load, not when selection mode changes)
  const hasAutoFitted = useRef<string | null>(null);
  useEffect(() => {
    if (selectedMap && width > 0 && height > 0 && selectionMode !== "cell" && hasAutoFitted.current !== selectedMap.id) {
      const config = selectedMap.coordinateConfig;
      const scaleX = width / config.imageWidth;
      const scaleY = height / config.imageHeight;
      const fitZoom = Math.min(scaleX, scaleY, 1.0); // Don't zoom in beyond 100%
      
      // Center the map
      const centerX = (width - config.imageWidth * fitZoom) / 2;
      const centerY = (height - config.imageHeight * fitZoom) / 2;
      
      setZoom(fitZoom);
      setPan(centerX, centerY);
      hasAutoFitted.current = selectedMap.id;
    }
  }, [selectedMap?.id, width, height, setZoom, setPan, selectionMode]);
  
  // When entering cell selection mode, set zoom to 100% and center map
  useEffect(() => {
    if (selectionMode === "cell" && selectedMap && width > 0 && height > 0) {
      setZoom(1.0);
      // Center the map at 100% zoom
      const config = selectedMap.coordinateConfig;
      const centerX = (width - config.imageWidth) / 2;
      const centerY = (height - config.imageHeight) / 2;
      setPan(centerX, centerY);
    }
  }, [selectionMode, selectedMap?.id, width, height, setZoom, setPan]);

  // Load map image
  const [mapImage, setMapImage] = useState<HTMLImageElement | null>(null);
  const [imageSizeWarning, setImageSizeWarning] = useState<string | null>(null);
  
  useEffect(() => {
    if (!selectedMap?.imagePath) {
      setMapImage(null);
      setImageSizeWarning(null);
      return;
    }
    
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setMapImage(img);
      
      // Validate image size matches config
      const config = selectedMap.coordinateConfig;
      const expectedWidth = config.imageWidth;
      const expectedHeight = config.imageHeight;
      const actualWidth = img.naturalWidth;
      const actualHeight = img.naturalHeight;
      
      // Calculate expected cells based on config
      const expectedCellsX = Math.floor(config.imageWidth / config.baseCellSize);
      const expectedCellsY = Math.floor(config.imageHeight / config.baseCellSize);
      
      // Calculate pixels per cell in actual image
      // If image is smaller than config, we'll stretch it, so calculate based on actual
      const pixelsPerCellX = actualWidth / expectedCellsX;
      const pixelsPerCellY = actualHeight / expectedCellsY;
      const minPixelsPerCell = Math.min(pixelsPerCellX, pixelsPerCellY);
      
      // Warn if resolution is too low
      // Less than 1 pixel per cell = severe stretching
      // Less than 2 pixels per cell = low quality (recommended minimum)
      if (minPixelsPerCell < 1) {
        const recommendedWidth = expectedCellsX * 2; // 2px per cell minimum
        const recommendedHeight = expectedCellsY * 2;
        setImageSizeWarning(
          `⚠️ Low Resolution: Image is ${actualWidth}×${actualHeight}px (${minPixelsPerCell.toFixed(2)}px/cell). ` +
          `Image will be stretched to ${config.imageWidth}×${config.imageHeight}px for ${expectedCellsX}×${expectedCellsY} cells. ` +
          `Recommended: ${recommendedWidth}×${recommendedHeight}px (2px/cell) or higher for better clarity.`
        );
      } else if (minPixelsPerCell < 2) {
        const recommendedWidth = expectedCellsX * 2;
        const recommendedHeight = expectedCellsY * 2;
        setImageSizeWarning(
          `⚠️ Low Resolution: ${minPixelsPerCell.toFixed(1)} pixels per cell. ` +
          `Recommended: ${recommendedWidth}×${recommendedHeight}px (2px/cell) or higher for better clarity. ` +
          `Image will be stretched to fit ${config.imageWidth}×${config.imageHeight}px.`
        );
      } else {
        setImageSizeWarning(null);
      }
    };
    img.onerror = () => {
      console.error("Failed to load map image:", selectedMap.imagePath);
      setMapImage(null);
      setImageSizeWarning(null);
    };
    img.src = selectedMap.imagePath.startsWith("/") 
      ? selectedMap.imagePath 
      : `/${selectedMap.imagePath}`;
  }, [selectedMap?.imagePath, selectedMap?.coordinateConfig]);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for shortcuts
      if (e.key === "g" || e.key === "G") {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          useMapEditorStore.getState().toggleGrid();
        }
      }
      if (e.key === "s" || e.key === "S") {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          useMapEditorStore.getState().toggleSnap();
        }
      }
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zoomIn();
      }
      if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        zoomOut();
      }
      if (e.key === "0") {
        e.preventDefault();
        resetView();
      }
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        useMapEditorStore.getState().fitToViewport();
      }
      // Ctrl/Cmd+A to select all cells (when in cell selection mode)
      if ((e.ctrlKey || e.metaKey) && e.key === "a" && selectionMode === "cell") {
        e.preventDefault();
        selectAllCells();
      }
      if (e.key === " ") {
        e.preventDefault();
        spacePressed.current = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === " ") {
        spacePressed.current = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [zoomIn, zoomOut, resetView, selectionMode, selectAllCells]);

  // Disable wheel zoom in cell selection mode (locked to 100%)
  const handleWheel = useCallback(
    (e: any) => {
      // Don't allow zooming in cell selection mode - prevent all wheel behavior
      if (selectionMode === "cell") {
        e.evt.preventDefault();
        e.evt.stopPropagation();
        return;
      }
      
      e.evt.preventDefault();

      const stage = e.target.getStage();
      const oldScale = stage.scaleX();
      // Use getPointerPosition for screen coordinates (needed for zoom calculation)
      const pointer = stage.getPointerPosition();

      if (!pointer) return;

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      // Calculate new zoom
      const scaleBy = 1.1;
      let newZoom = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
      
      // Clamp zoom (0.1 to 10)
      newZoom = Math.max(0.1, Math.min(10, newZoom));

      setZoom(newZoom);

      const newPos = {
        x: pointer.x - mousePointTo.x * newZoom,
        y: pointer.y - mousePointTo.y * newZoom,
      };

      setPan(newPos.x, newPos.y);
    },
    [selectionMode, setZoom, setPan]
  );

  // Handle drag (pan)
  const handleDragStart = useCallback((e: any) => {
    if (spacePressed.current || e.evt.button === 1) {
      isDragging.current = true;
      // Use getPointerPosition for screen coordinates (needed for pan calculation)
      const pointer = e.target.getStage().getPointerPosition();
      if (pointer) {
        lastPointerPosition.current = pointer;
      }
    }
  }, []);

  const handleDragMove = useCallback(
    (e: any) => {
      if (!isDragging.current) return;

      const stage = e.target.getStage();
      // Use getPointerPosition for screen coordinates (needed for pan calculation)
      const pointer = stage.getPointerPosition();

      if (!pointer) return;

      const dx = pointer.x - lastPointerPosition.current.x;
      const dy = pointer.y - lastPointerPosition.current.y;

      setPan(panX + dx, panY + dy);
      lastPointerPosition.current = pointer;
    },
    [panX, panY, setPan]
  );

  const handleDragEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Handle mouse move (update coordinates for status bar)
  const handleMouseMove = useCallback(
    (e: any) => {
      const stage = e.target.getStage();
      if (!stage || !selectedMap) {
        setMouseCoords(null);
        return;
      }

      // Use getRelativePointerPosition - automatically accounts for Stage transform (zoom/pan)
      const pointer = stage.getRelativePointerPosition();
      if (!pointer) {
        setMouseCoords(null);
        return;
      }

      // Pointer is already in map coordinates (accounting for zoom/pan transform)
      const mapX = pointer.x;
      const mapY = pointer.y;

      // Clamp to map bounds
      const config = selectedMap.coordinateConfig;
      const clampedX = Math.max(0, Math.min(config.imageWidth, mapX));
      const clampedY = Math.max(0, Math.min(config.imageHeight, mapY));

      setMouseCoords({ x: clampedX, y: clampedY });
    },
    [selectedMap]
  );

  // Handle click (for placement or cell selection)
  const handleClick = useCallback(
    (e: any) => {
      if (isDragging.current) return; // Don't place if we were dragging
      
      // If we just finished a cell drag, don't overwrite the selection
      if (justFinishedCellDrag.current) {
        justFinishedCellDrag.current = false;
        return;
      }

      const stage = e.target.getStage();
      if (!stage || !selectedMap) return;

      // Use getRelativePointerPosition - automatically accounts for Stage transform (zoom/pan)
      const pointer = stage.getRelativePointerPosition();
      if (!pointer) return;

      // Pointer is already in map coordinates (accounting for zoom/pan transform)
      const mapX = pointer.x;
      const mapY = pointer.y;

      // Clamp to map bounds
      const config = selectedMap.coordinateConfig;
      const clampedX = Math.max(0, Math.min(config.imageWidth, mapX));
      const clampedY = Math.max(0, Math.min(config.imageHeight, mapY));

      // Handle cell selection mode
      if (selectionMode === "cell") {
        const cell = pixelToCell({ x: clampedX, y: clampedY }, config);
        
        // Check if clicking on an existing region
        const clickedRegion = regions
          .filter((r) => r.mapId === selectedMap.id)
          .find((region) =>
            region.cells.some((c) => c.cellX === cell.cellX && c.cellY === cell.cellY)
          );
        
        if (clickedRegion) {
          // Clicked on a region - select it for editing
          selectRegion(clickedRegion.id);
          return;
        }
        
        // Otherwise, normal cell selection (single click, not drag)
        const isCtrlOrShift = e.evt.ctrlKey || e.evt.shiftKey;
        selectCell(cell.cellX, cell.cellY, isCtrlOrShift);
        return;
      }

      // Apply snapping if enabled (for placement mode)
      let finalX = clampedX;
      let finalY = clampedY;

      if (snapToGrid) {
        const gridSize = useMapEditorStore.getState().gridSize;
        finalX = Math.round(clampedX / gridSize) * gridSize;
        finalY = Math.round(clampedY / gridSize) * gridSize;
      }

      // TODO: Handle placement creation based on active tool
      console.log("Click at:", { x: finalX, y: finalY });
    },
    [selectedMap, snapToGrid, selectionMode, selectCell, regions, selectRegion, pixelToCell]
  );

  // Handle mouse down (start cell selection drag or pan)
  const handleMouseDown = useCallback(
    (e: any) => {
      const stage = e.target.getStage();
      if (!stage || !selectedMap) return;
      
      // Allow panning with space or middle mouse button even in cell selection mode
      if (spacePressed.current || e.evt.button === 1) {
        isDragging.current = true;
        const pointer = stage.getPointerPosition();
        if (pointer) {
          lastPointerPosition.current = pointer;
        }
        return;
      }
      
      if (selectionMode !== "cell") return;

      // Use getRelativePointerPosition - automatically accounts for Stage transform (zoom/pan)
      const pointer = stage.getRelativePointerPosition();
      if (!pointer) return;

      // Pointer is already in map coordinates (accounting for zoom/pan transform)
      const mapX = pointer.x;
      const mapY = pointer.y;

      // Clamp to map bounds
      const config = selectedMap.coordinateConfig;
      const clampedX = Math.max(0, Math.min(config.imageWidth, mapX));
      const clampedY = Math.max(0, Math.min(config.imageHeight, mapY));

      const cell = pixelToCell({ x: clampedX, y: clampedY }, config);
      
      // Start cell selection (for drag)
      if (!e.evt.ctrlKey && !e.evt.shiftKey) {
        startCellSelection(cell.cellX, cell.cellY);
      }
    },
    [selectedMap, selectionMode, startCellSelection]
  );

  // Handle mouse move (update cell selection during drag)
  const handleMouseMoveForSelection = useCallback(
    (e: any) => {
      if (!isSelectingCells || !selectedMap) return;

      const stage = e.target.getStage();
      if (!stage) return;

      // Use getRelativePointerPosition - automatically accounts for Stage transform (zoom/pan)
      const pointer = stage.getRelativePointerPosition();
      if (!pointer) return;

      // Pointer is already in map coordinates (accounting for zoom/pan transform)
      const mapX = pointer.x;
      const mapY = pointer.y;

      // Clamp to map bounds
      const config = selectedMap.coordinateConfig;
      const clampedX = Math.max(0, Math.min(config.imageWidth, mapX));
      const clampedY = Math.max(0, Math.min(config.imageHeight, mapY));

      const cell = pixelToCell({ x: clampedX, y: clampedY }, config);
      updateCellSelection(cell.cellX, cell.cellY);
    },
    [selectedMap, isSelectingCells, updateCellSelection]
  );

  // Handle mouse up (end cell selection drag)
  const handleMouseUp = useCallback(() => {
    if (isSelectingCells) {
      // Mark that we just finished a drag so click handler doesn't overwrite
      justFinishedCellDrag.current = true;
      endCellSelection();
      // Clear the flag after a short delay to allow click event to be ignored
      setTimeout(() => {
        justFinishedCellDrag.current = false;
      }, 100);
    }
  }, [isSelectingCells, endCellSelection]);

  if (!selectedMap) {
    return (
      <div className="flex items-center justify-center h-full bg-deep text-text-muted">
        <div className="text-center">
          <p className="mb-2">No map selected</p>
          <p className="text-xs opacity-50">Select a map from the dropdown above</p>
        </div>
      </div>
    );
  }

  if (width <= 0 || height <= 0) {
    return (
      <div className="flex items-center justify-center h-full bg-deep text-text-muted">
        <div className="text-center">
          <p className="mb-2">Invalid canvas dimensions</p>
          <p className="text-xs opacity-50">Width: {width}, Height: {height}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-deep">
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        scaleX={selectionMode === "cell" ? 1.0 : zoom}
        scaleY={selectionMode === "cell" ? 1.0 : zoom}
        x={panX}
        y={panY}
        onWheel={handleWheel}
        onMouseDown={(e) => {
          handleMouseDown(e);
          handleDragStart(e);
        }}
        onMouseMove={(e) => {
          handleMouseMove(e);
          handleMouseMoveForSelection(e);
          handleDragMove(e);
        }}
        onMouseUp={(e) => {
          handleMouseUp();
          handleDragEnd();
        }}
        onClick={handleClick}
        style={{ cursor: spacePressed.current ? "grab" : "default" }}
      >
        <Layer>
          {/* Map background image - always stretch to config dimensions */}
          {mapImage && selectedMap && (
            <KonvaImage
              image={mapImage}
              x={0}
              y={0}
              width={selectedMap.coordinateConfig.imageWidth}
              height={selectedMap.coordinateConfig.imageHeight}
              // Stretch image to fit config dimensions
              // This allows lower resolution images to still work with coordinate system
            />
          )}

          {/* Grid layer - use config dimensions */}
          {showGrid && selectedMap && (
            <GridLayer
              width={selectedMap.coordinateConfig.imageWidth}
              height={selectedMap.coordinateConfig.imageHeight}
              gridSize={useMapEditorStore.getState().gridSize}
              zoom={zoom}
            />
          )}

          {/* Cell selection layer - pass actual image for validation */}
          {/* Use effective zoom: 1.0 in cell selection mode, otherwise use store zoom */}
          {mapImage && <CellSelectionLayer zoom={selectionMode === "cell" ? 1.0 : zoom} actualImageWidth={mapImage.naturalWidth} actualImageHeight={mapImage.naturalHeight} />}

          {/* Placements layer - TODO */}
        </Layer>
      </Stage>

      {/* Image size warning */}
      {imageSizeWarning && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500/90 border border-yellow-400 rounded-lg p-3 shadow-lg z-50 max-w-2xl">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-900 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-yellow-900 mb-1">Image Size Mismatch</div>
              <div className="text-sm text-yellow-800">{imageSizeWarning}</div>
            </div>
          </div>
        </div>
      )}

      {/* Status bar */}
      <StatusBar mouseCoords={mouseCoords} />

      {/* Cell selection feedback */}
      <CellSelectionFeedback environments={environments} maps={maps} />

      {/* Map completion indicator */}
      <MapCompletionIndicator />
    </div>
  );
}

