// components/environment/RegionEditForm.tsx
// Form for editing region coordinates and properties with full cell selection capabilities

"use client";

import { useState, useEffect, useMemo } from "react";
import { EnvironmentSelector } from "./EnvironmentSelector";
import { MapImageUpload } from "./MapImageUpload";
import { AreaInfoDisplay } from "./AreaInfoDisplay";
import { validateCellSelectionForNestedMap } from "@/lib/utils/cellSelectionValidation";
import { findParentRegion, findBaseRegion, getInheritedEnvironment } from "@/lib/utils/regionInheritance";
import type { MapRegion } from "@/lib/data/mapRegions";
import type { MapDefinition } from "@/lib/data/maps";
import type { EnvironmentDefinition } from "@/lib/data/environments";
import { mapClient } from "@/lib/api/clients";
import { useMapEditorStore } from "@/lib/store/mapEditorStore";

interface RegionEditFormProps {
  region: MapRegion;
  map: MapDefinition;
  environments?: EnvironmentDefinition[];
  maps?: MapDefinition[];
  regions?: MapRegion[];
  onSubmit: (updatedRegion: MapRegion) => void;
  onCancel: () => void;
}

export function RegionEditForm({ 
  region, 
  map, 
  environments = [], 
  maps = [], 
  regions = [],
  onSubmit, 
  onCancel 
}: RegionEditFormProps) {
  const { placements } = useMapEditorStore();
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string | null>(region.environmentId || null);
  const [regionSquare, setRegionSquare] = useState({
    minX: region.minX,
    minY: region.minY,
    width: region.width,
    height: region.height,
  });
  const [nestedMapImagePath, setNestedMapImagePath] = useState<string | null>(null);
  
  // Get nested map if it exists
  const nestedMap = region.nestedMapId ? maps.find(m => m.id === region.nestedMapId) : null;
  
  // Find parent region and base region
  const parentRegion = useMemo(() => {
    if (!region.parentRegionId) return null;
    return regions.find(r => r.id === region.parentRegionId) || null;
  }, [regions, region.parentRegionId]);
  
  const baseRegion = useMemo(() => findBaseRegion(regions, map.id), [regions, map.id]);
  
  // Get inherited environment
  const inheritedEnvironment = useMemo(() => 
    getInheritedEnvironment(parentRegion, baseRegion, environments),
    [parentRegion, baseRegion, environments]
  );
  
  // Initialize nested map image path
  useEffect(() => {
    if (nestedMap?.imagePath) {
      setNestedMapImagePath(nestedMap.imagePath);
    }
  }, [nestedMap]);
  
  // Calculate validation for current square region
  // Generate cells from square for validation
  const regionCells = useMemo(() => {
    const cells: Array<{ cellX: number; cellY: number }> = [];
    for (let y = regionSquare.minY; y < regionSquare.minY + regionSquare.height; y++) {
      for (let x = regionSquare.minX; x < regionSquare.minX + regionSquare.width; x++) {
        cells.push({ cellX: x, cellY: y });
      }
    }
    return cells;
  }, [regionSquare]);
  
  const validation = useMemo(() => {
    if (regionCells.length === 0) return null;
    return validateCellSelectionForNestedMap(regionCells, map.coordinateConfig, placements);
  }, [regionCells, map, placements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure square (use larger dimension)
    const size = Math.max(regionSquare.width, regionSquare.height);
    
    const updatedRegion: MapRegion = {
      ...region,
      minX: regionSquare.minX,
      minY: regionSquare.minY,
      width: size,
      height: size,
      environmentId: selectedEnvironmentId || undefined,
    };
    
    onSubmit(updatedRegion);
  };
  
  const { estimatedAreaInUnreal, unrealBounds } = validation || { estimatedAreaInUnreal: 0, unrealBounds: undefined };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4" id="region-edit-form">
      {/* Environment Selection */}
      <EnvironmentSelector
        environments={environments}
        selectedEnvironmentId={selectedEnvironmentId}
        onEnvironmentChange={setSelectedEnvironmentId}
        parentRegion={parentRegion}
        baseRegion={baseRegion}
        contextLabel="Editing region within:"
        showInheritanceInfo={true}
      />
      
      {/* Map Image Upload */}
      <MapImageUpload
        currentImagePath={nestedMapImagePath}
        map={map}
        onImageUploaded={(imagePath) => {
          setNestedMapImagePath(imagePath);
          // Update nested map if it exists
          if (nestedMap) {
            mapClient.update({
              ...nestedMap,
              imagePath: imagePath,
            }).catch(err => console.error("Failed to update nested map:", err));
          }
        }}
        onCellsSnapped={(cells) => {
          // Convert cells to square bounds
          if (cells.length > 0) {
            const xs = cells.map(c => c.cellX);
            const ys = cells.map(c => c.cellY);
            const minX = Math.min(...xs);
            const minY = Math.min(...ys);
            const maxX = Math.max(...xs);
            const maxY = Math.max(...ys);
            const width = maxX - minX + 1;
            const height = maxY - minY + 1;
            const size = Math.max(width, height); // Make it square
            setRegionSquare({ minX, minY, width: size, height: size });
          }
        }}
      />

      {/* Area info */}
      {validation && (
        <AreaInfoDisplay
          estimatedAreaInUnreal={estimatedAreaInUnreal}
          unrealBounds={unrealBounds}
          coordinateConfig={map.coordinateConfig}
        />
      )}
      
      {/* Region info */}
      <div className="p-2 bg-void/50 rounded text-xs">
        <div className="text-text-secondary mb-1">
          <strong>Region:</strong> {region.name}
        </div>
        <div className="text-text-muted">
          {regionCells.length} cells
          {nestedMap && " • Has nested map"}
        </div>
      </div>
    </form>
  );
}
