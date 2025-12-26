"use client";

import { useState, useCallback, useEffect } from "react";

interface GridSelectorProps {
  minX: number;
  minY: number;
  width: number;
  height: number;
  onSelectionChange: (minX: number, minY: number, width: number, height: number) => void;
  disabled?: boolean;
  gridSize?: number; // Default 8x8
  occupiedCells?: Set<string>; // Set of "x,y" strings for occupied cells
  currentEditId?: number; // ID of region being edited (to exclude from occupied check)
}

export function GridSelector({
  minX,
  minY,
  width,
  height,
  onSelectionChange,
  disabled = false,
  gridSize = 8,
  occupiedCells = new Set(),
  currentEditId,
}: GridSelectorProps) {
  const [selecting, setSelecting] = useState(false);
  const [startCell, setStartCell] = useState<{ x: number; y: number } | null>(null);
  const [hoverCell, setHoverCell] = useState<{ x: number; y: number } | null>(null);

  const getCellState = useCallback((x: number, y: number) => {
    const cellKey = `${x},${y}`;
    const isOccupied = occupiedCells.has(cellKey);
    
    // Check if cell is in current selection
    const inSelection = x >= minX && x < minX + width && y >= minY && y < minY + height;
    
    // Check if cell is in hover selection (when dragging)
    let inHover = false;
    if (selecting && startCell && hoverCell) {
      const hoverMinX = Math.min(startCell.x, hoverCell.x);
      const hoverMaxX = Math.max(startCell.x, hoverCell.x);
      const hoverMinY = Math.min(startCell.y, hoverCell.y);
      const hoverMaxY = Math.max(startCell.y, hoverCell.y);
      inHover = x >= hoverMinX && x <= hoverMaxX && y >= hoverMinY && y <= hoverMaxY;
    }

    return { inSelection, inHover, isOccupied };
  }, [minX, minY, width, height, selecting, startCell, hoverCell, occupiedCells]);


  const handleCellClick = (x: number, y: number) => {
    if (disabled) return;
    const cellKey = `${x},${y}`;
    if (occupiedCells.has(cellKey)) return; // Don't allow clicking occupied cells
    onSelectionChange(x, y, 1, 1);
  };

  const handleCellMouseDown = (x: number, y: number) => {
    if (disabled) return;
    const cellKey = `${x},${y}`;
    if (occupiedCells.has(cellKey)) return; // Don't allow starting selection on occupied cells
    setSelecting(true);
    setStartCell({ x, y });
    setHoverCell({ x, y });
  };

  const handleCellMouseEnter = (x: number, y: number) => {
    if (disabled || !selecting) return;
    const cellKey = `${x},${y}`;
    if (occupiedCells.has(cellKey)) return; // Don't allow extending selection over occupied cells
    setHoverCell({ x, y });
  };

  const handleMouseUp = () => {
    if (!selecting || !startCell || !hoverCell) return;
    
    const newMinX = Math.min(startCell.x, hoverCell.x);
    const newMinY = Math.min(startCell.y, hoverCell.y);
    const newMaxX = Math.max(startCell.x, hoverCell.x);
    const newMaxY = Math.max(startCell.y, hoverCell.y);
    const newWidth = newMaxX - newMinX + 1;
    const newHeight = newMaxY - newMinY + 1;

    // Validate that the selection doesn't include any occupied cells
    const hasOccupiedCells = Array.from({ length: newWidth }).some((_, dx) => {
      return Array.from({ length: newHeight }).some((_, dy) => {
        const x = newMinX + dx;
        const y = newMinY + dy;
        const cellKey = `${x},${y}`;
        return occupiedCells.has(cellKey);
      });
    });

    // Only allow selection if no occupied cells are included
    if (!hasOccupiedCells) {
      onSelectionChange(newMinX, newMinY, newWidth, newHeight);
    }
    
    setSelecting(false);
    setStartCell(null);
    setHoverCell(null);
  };

  return (
    <div className="space-y-2">
      <div
        className="grid gap-0.5 p-2 bg-deep border border-border rounded-lg"
        style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          if (selecting) {
            setSelecting(false);
            setStartCell(null);
            setHoverCell(null);
          }
        }}
      >
        {Array.from({ length: gridSize * gridSize }).map((_, index) => {
          const x = index % gridSize;
          const y = Math.floor(index / gridSize);
          const { inSelection, inHover, isOccupied } = getCellState(x, y);
          
          // Occupied cells should always show as occupied, even if in selection
          // This ensures visual feedback is clear
          const showAsOccupied = isOccupied;
          const showAsSelected = !isOccupied && inSelection;
          const showAsHover = !isOccupied && inHover && !inSelection;
          
          return (
            <button
              key={`${x}-${y}`}
              type="button"
              onClick={() => handleCellClick(x, y)}
              onMouseDown={() => handleCellMouseDown(x, y)}
              onMouseEnter={() => handleCellMouseEnter(x, y)}
              disabled={disabled || isOccupied}
              className={`
                aspect-square min-w-[24px] min-h-[24px] border rounded
                transition-all
                ${showAsOccupied
                  ? "bg-red-500/40 border-red-500/80 cursor-not-allowed"
                  : showAsSelected
                  ? "bg-ember/40 border-ember-glow"
                  : showAsHover
                  ? "bg-ember/20 border-ember/50"
                  : "bg-deep/50 hover:bg-deep border-border/30"
                }
                ${disabled ? "cursor-not-allowed opacity-50" : showAsOccupied ? "cursor-not-allowed" : "cursor-pointer"}
              `}
              title={isOccupied ? `Cell (${x}, ${y}) - Occupied by another region` : `Cell (${x}, ${y})`}
            />
          );
        })}
      </div>
      <div className="text-xs text-text-muted text-center">
        Selected: ({minX}, {minY}) to ({minX + width - 1}, {minY + height - 1}) • {width}×{height} cells
      </div>
    </div>
  );
}

