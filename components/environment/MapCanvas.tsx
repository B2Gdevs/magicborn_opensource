// components/environment/MapCanvas.tsx
// Professional map canvas with smooth zoom/pan, keyboard shortcuts, and viewport controls

"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import { useMapEditorStore } from "@/lib/store/mapEditorStore";
import { GridLayer } from "./GridLayer";
import { StatusBar } from "./StatusBar";
import type { PixelCoordinates } from "@/lib/utils/coordinateSystem";

interface MapCanvasProps {
  width: number;
  height: number;
}

export function MapCanvas({ width, height }: MapCanvasProps) {
  const stageRef = useRef<any>(null);
  const isDragging = useRef(false);
  const lastPointerPosition = useRef({ x: 0, y: 0 });
  const spacePressed = useRef(false);
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
    showGrid,
    snapToGrid,
  } = useMapEditorStore();

  // Load map image
  const [mapImage, setMapImage] = useState<HTMLImageElement | null>(null);
  
  useEffect(() => {
    if (!selectedMap?.imagePath) {
      setMapImage(null);
      return;
    }
    
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setMapImage(img);
    img.onerror = () => {
      console.error("Failed to load map image:", selectedMap.imagePath);
      setMapImage(null);
    };
    img.src = selectedMap.imagePath.startsWith("/") 
      ? selectedMap.imagePath 
      : `/${selectedMap.imagePath}`;
  }, [selectedMap?.imagePath]);

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
  }, [zoomIn, zoomOut, resetView]);

  // Handle wheel zoom (smooth zoom to cursor)
  const handleWheel = useCallback(
    (e: any) => {
      e.evt.preventDefault();

      const stage = e.target.getStage();
      const oldScale = stage.scaleX();
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
    [setZoom, setPan]
  );

  // Handle drag (pan)
  const handleDragStart = useCallback((e: any) => {
    if (spacePressed.current || e.evt.button === 1) {
      isDragging.current = true;
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
      const pointer = stage.getPointerPosition();

      if (!pointer || !selectedMap) {
        setMouseCoords(null);
        return;
      }

      // Convert screen coordinates to map coordinates
      const mapX = (pointer.x - panX) / zoom;
      const mapY = (pointer.y - panY) / zoom;

      // Clamp to map bounds
      const clampedX = Math.max(0, Math.min(selectedMap.coordinateConfig?.imageWidth || 1000, mapX));
      const clampedY = Math.max(0, Math.min(selectedMap.coordinateConfig?.imageHeight || 1000, mapY));

      setMouseCoords({ x: clampedX, y: clampedY });
    },
    [panX, panY, zoom, selectedMap]
  );

  // Handle click (for placement)
  const handleClick = useCallback(
    (e: any) => {
      if (isDragging.current) return; // Don't place if we were dragging

      const stage = e.target.getStage();
      const pointer = stage.getPointerPosition();

      if (!pointer || !selectedMap) return;

      // Convert screen coordinates to map coordinates
      const mapX = (pointer.x - panX) / zoom;
      const mapY = (pointer.y - panY) / zoom;

      // Apply snapping if enabled
      let finalX = mapX;
      let finalY = mapY;

      if (snapToGrid) {
        const gridSize = useMapEditorStore.getState().gridSize;
        finalX = Math.round(mapX / gridSize) * gridSize;
        finalY = Math.round(mapY / gridSize) * gridSize;
      }

      // TODO: Handle placement creation based on active tool
      console.log("Click at:", { x: finalX, y: finalY });
    },
    [panX, panY, zoom, selectedMap, snapToGrid]
  );

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
        scaleX={zoom}
        scaleY={zoom}
        x={panX}
        y={panY}
        onWheel={handleWheel}
        onMouseDown={handleDragStart}
        onMouseMove={(e) => {
          handleMouseMove(e);
          handleDragMove(e);
        }}
        onMouseUp={handleDragEnd}
        onClick={handleClick}
        style={{ cursor: spacePressed.current ? "grab" : "default" }}
      >
        <Layer>
          {/* Map background image */}
          {mapImage && selectedMap && (
            <KonvaImage
              image={mapImage}
              x={0}
              y={0}
              width={selectedMap.coordinateConfig?.imageWidth || 1000}
              height={selectedMap.coordinateConfig?.imageHeight || 1000}
            />
          )}

          {/* Grid layer */}
          {showGrid && selectedMap && (
            <GridLayer
              width={selectedMap.coordinateConfig?.imageWidth || 1000}
              height={selectedMap.coordinateConfig?.imageHeight || 1000}
              gridSize={useMapEditorStore.getState().gridSize}
              zoom={zoom}
            />
          )}

          {/* Placements layer - TODO */}
        </Layer>
      </Stage>

      {/* Status bar */}
      <StatusBar mouseCoords={mouseCoords} />
    </div>
  );
}

