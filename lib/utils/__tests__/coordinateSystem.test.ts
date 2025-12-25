// lib/utils/__tests__/coordinateSystem.test.ts
// Tests for coordinate system and grid alignment

import { describe, it, expect } from "vitest";
import {
  pixelToCell,
  cellToPixel,
  getStandardConfig,
  type CoordinateSystemConfig,
} from "../coordinateSystem";
import { MapLevel } from "@/lib/core/mapEnums";

describe("Coordinate System", () => {
  describe("Standard Configurations", () => {
    it("World map should have 256×256 cells (4096px / 16px = 256)", () => {
      const config = getStandardConfig(MapLevel.World);
      expect(config.imageWidth).toBe(4096);
      expect(config.imageHeight).toBe(4096);
      expect(config.baseCellSize).toBe(16);
      
      const cellsX = Math.floor(config.imageWidth / config.baseCellSize);
      const cellsY = Math.floor(config.imageHeight / config.baseCellSize);
      expect(cellsX).toBe(256);
      expect(cellsY).toBe(256);
    });

    it("Town map should have 204×204 cells (2048px / 10px = 204)", () => {
      const config = getStandardConfig(MapLevel.Town);
      expect(config.imageWidth).toBe(2048);
      expect(config.imageHeight).toBe(2048);
      expect(config.baseCellSize).toBe(10);
      
      const cellsX = Math.floor(config.imageWidth / config.baseCellSize);
      const cellsY = Math.floor(config.imageHeight / config.baseCellSize);
      expect(cellsX).toBe(204);
      expect(cellsY).toBe(204);
    });

    it("Interior map should have 128×128 cells (1024px / 8px = 128)", () => {
      const config = getStandardConfig(MapLevel.Interior);
      expect(config.imageWidth).toBe(1024);
      expect(config.imageHeight).toBe(1024);
      expect(config.baseCellSize).toBe(8);
      
      const cellsX = Math.floor(config.imageWidth / config.baseCellSize);
      const cellsY = Math.floor(config.imageHeight / config.baseCellSize);
      expect(cellsX).toBe(128);
      expect(cellsY).toBe(128);
    });

    it("Small Interior map should have 102×102 cells (512px / 5px = 102)", () => {
      const config = getStandardConfig(MapLevel.SmallInterior);
      expect(config.imageWidth).toBe(512);
      expect(config.imageHeight).toBe(512);
      expect(config.baseCellSize).toBe(5);
      
      const cellsX = Math.floor(config.imageWidth / config.baseCellSize);
      const cellsY = Math.floor(config.imageHeight / config.baseCellSize);
      expect(cellsX).toBe(102);
      expect(cellsY).toBe(102);
    });
  });

  describe("Pixel to Cell Conversion", () => {
    it("should convert pixel (0, 0) to cell (0, 0)", () => {
      const config = getStandardConfig(MapLevel.World);
      const cell = pixelToCell({ x: 0, y: 0 }, config);
      expect(cell.cellX).toBe(0);
      expect(cell.cellY).toBe(0);
    });

    it("should convert pixel (16, 16) to cell (1, 1) for world map", () => {
      const config = getStandardConfig(MapLevel.World);
      const cell = pixelToCell({ x: 16, y: 16 }, config);
      expect(cell.cellX).toBe(1);
      expect(cell.cellY).toBe(1);
    });

    it("should convert pixel (240, 240) to cell (15, 15) for world map", () => {
      const config = getStandardConfig(MapLevel.World);
      const cell = pixelToCell({ x: 240, y: 240 }, config);
      expect(cell.cellX).toBe(15);
      expect(cell.cellY).toBe(15);
    });

    it("should convert pixel (15, 15) to cell (0, 0) for world map (floor division)", () => {
      const config = getStandardConfig(MapLevel.World);
      const cell = pixelToCell({ x: 15, y: 15 }, config);
      expect(cell.cellX).toBe(0);
      expect(cell.cellY).toBe(0);
    });

    it("should convert pixel (255, 255) to cell (15, 15) for world map", () => {
      const config = getStandardConfig(MapLevel.World);
      const cell = pixelToCell({ x: 255, y: 255 }, config);
      expect(cell.cellX).toBe(15);
      expect(cell.cellY).toBe(15);
    });

    it("zoom should not affect cell calculation", () => {
      const config = getStandardConfig(MapLevel.World);
      const cell1 = pixelToCell({ x: 240, y: 240 }, config, 1.0);
      const cell2 = pixelToCell({ x: 240, y: 240 }, config, 0.6);
      const cell3 = pixelToCell({ x: 240, y: 240 }, config, 2.0);
      expect(cell1).toEqual(cell2);
      expect(cell1).toEqual(cell3);
      expect(cell1.cellX).toBe(15);
      expect(cell1.cellY).toBe(15);
    });
  });

  describe("Cell to Pixel Conversion", () => {
    it("should convert cell (0, 0) to pixel (0, 0)", () => {
      const config = getStandardConfig(MapLevel.World);
      const pixel = cellToPixel({ cellX: 0, cellY: 0 }, config);
      expect(pixel.x).toBe(0);
      expect(pixel.y).toBe(0);
    });

    it("should convert cell (1, 1) to pixel (16, 16) for world map", () => {
      const config = getStandardConfig(MapLevel.World);
      const pixel = cellToPixel({ cellX: 1, cellY: 1 }, config);
      expect(pixel.x).toBe(16);
      expect(pixel.y).toBe(16);
    });

    it("should convert cell (15, 15) to pixel (240, 240) for world map", () => {
      const config = getStandardConfig(MapLevel.World);
      const pixel = cellToPixel({ cellX: 15, cellY: 15 }, config);
      expect(pixel.x).toBe(240);
      expect(pixel.y).toBe(240);
    });

    it("zoom should not affect pixel position", () => {
      const config = getStandardConfig(MapLevel.World);
      const pixel1 = cellToPixel({ cellX: 15, cellY: 15 }, config, 1.0);
      const pixel2 = cellToPixel({ cellX: 15, cellY: 15 }, config, 0.6);
      const pixel3 = cellToPixel({ cellX: 15, cellY: 15 }, config, 2.0);
      expect(pixel1).toEqual(pixel2);
      expect(pixel1).toEqual(pixel3);
      expect(pixel1.x).toBe(240);
      expect(pixel1.y).toBe(240);
    });
  });

  describe("Round-trip Conversion", () => {
    it("should convert pixel to cell and back to same pixel (world map)", () => {
      const config = getStandardConfig(MapLevel.World);
      const originalPixel = { x: 240, y: 240 };
      const cell = pixelToCell(originalPixel, config);
      const pixel = cellToPixel(cell, config);
      
      // Should be at cell boundary (exact match)
      expect(pixel.x).toBe(240);
      expect(pixel.y).toBe(240);
    });

    it("should convert cell to pixel and back to same cell (world map)", () => {
      const config = getStandardConfig(MapLevel.World);
      const originalCell = { cellX: 15, cellY: 15 };
      const pixel = cellToPixel(originalCell, config);
      const cell = pixelToCell(pixel, config);
      
      expect(cell.cellX).toBe(15);
      expect(cell.cellY).toBe(15);
    });

    it("should handle edge cases at map boundaries", () => {
      const config = getStandardConfig(MapLevel.World);
      const maxCellX = Math.floor(config.imageWidth / config.baseCellSize) - 1;
      const maxCellY = Math.floor(config.imageHeight / config.baseCellSize) - 1;
      
      // Test last cell
      const lastCell = { cellX: maxCellX, cellY: maxCellY };
      const pixel = cellToPixel(lastCell, config);
      const cell = pixelToCell(pixel, config);
      
      expect(cell.cellX).toBe(maxCellX);
      expect(cell.cellY).toBe(maxCellY);
    });
  });

  describe("Grid Alignment", () => {
    it("grid lines should align with cell boundaries", () => {
      const config = getStandardConfig(MapLevel.World);
      const baseCellSize = config.baseCellSize;
      
      // Grid lines should be at: 0, 16, 32, 48, ...
      // Cell boundaries are at: 0, 16, 32, 48, ...
      for (let cellX = 0; cellX < 10; cellX++) {
        const pixel = cellToPixel({ cellX, cellY: 0 }, config);
        expect(pixel.x).toBe(cellX * baseCellSize);
        expect(pixel.x % baseCellSize).toBe(0); // Should align with grid
      }
    });

    it("all cells should fit within grid boundaries", () => {
      const config = getStandardConfig(MapLevel.World);
      const baseCellSize = config.baseCellSize;
      const maxCellsX = Math.floor(config.imageWidth / baseCellSize);
      const maxCellsY = Math.floor(config.imageHeight / baseCellSize);
      
      // Test a few cells across the map
      for (let cellX = 0; cellX < maxCellsX; cellX += 32) {
        for (let cellY = 0; cellY < maxCellsY; cellY += 32) {
          const pixel = cellToPixel({ cellX, cellY }, config);
          
          // Cell should start at grid boundary
          expect(pixel.x % baseCellSize).toBe(0);
          expect(pixel.y % baseCellSize).toBe(0);
          
          // Cell should be within map bounds
          expect(pixel.x).toBeGreaterThanOrEqual(0);
          expect(pixel.y).toBeGreaterThanOrEqual(0);
          expect(pixel.x).toBeLessThan(config.imageWidth);
          expect(pixel.y).toBeLessThan(config.imageHeight);
        }
      }
    });
  });
});





