// components/environment/GridLayer.tsx
// Professional grid layer with sub-grid support and smooth rendering

"use client";

import { Line } from "react-konva";

interface GridLayerProps {
  width: number;
  height: number;
  gridSize: number;
  zoom: number;
}

export function GridLayer({ width, height, gridSize, zoom }: GridLayerProps) {
  // Calculate effective grid size (adjusts with zoom)
  const effectiveGridSize = gridSize * zoom;
  
  // Show sub-grid when zoomed in enough
  const showSubGrid = zoom > 2;
  const subGridSize = gridSize / 5;
  
  // Generate grid lines
  const lines: Array<{ x1: number; y1: number; x2: number; y2: number; opacity: number }> = [];
  
  // Vertical lines
  for (let x = 0; x <= width; x += gridSize) {
    lines.push({
      x1: x,
      y1: 0,
      x2: x,
      y2: height,
      opacity: 0.3,
    });
  }
  
  // Horizontal lines
  for (let y = 0; y <= height; y += gridSize) {
    lines.push({
      x1: 0,
      y1: y,
      x2: width,
      y2: y,
      opacity: 0.3,
    });
  }
  
  // Sub-grid lines (when zoomed in)
  const subGridLines: Array<{ x1: number; y1: number; x2: number; y2: number; opacity: number }> = [];
  
  if (showSubGrid) {
    // Vertical sub-grid lines
    for (let x = 0; x <= width; x += subGridSize) {
      // Skip main grid lines
      if (x % gridSize !== 0) {
        subGridLines.push({
          x1: x,
          y1: 0,
          x2: x,
          y2: height,
          opacity: 0.1,
        });
      }
    }
    
    // Horizontal sub-grid lines
    for (let y = 0; y <= height; y += subGridSize) {
      // Skip main grid lines
      if (y % gridSize !== 0) {
        subGridLines.push({
          x1: 0,
          y1: y,
          x2: width,
          y2: y,
          opacity: 0.1,
        });
      }
    }
  }
  
  return (
    <>
      {/* Sub-grid lines (dimmer) */}
      {showSubGrid &&
        subGridLines.map((line, i) => (
          <Line
            key={`subgrid-${i}`}
            points={[line.x1, line.y1, line.x2, line.y2]}
            stroke="#4a5568"
            strokeWidth={0.5}
            opacity={line.opacity}
            listening={false}
          />
        ))}
      
      {/* Main grid lines */}
      {lines.map((line, i) => (
        <Line
          key={`grid-${i}`}
          points={[line.x1, line.y1, line.x2, line.y2]}
          stroke="#718096"
          strokeWidth={1}
          opacity={line.opacity}
          listening={false}
        />
      ))}
    </>
  );
}

