// components/environment/MapCompletionIndicator.tsx
// Shows map completion percentage compared to Elden Ring

"use client";

import { useMemo } from "react";
import { useMapEditorStore } from "@/lib/store/mapEditorStore";
import { calculateMapCompletion } from "@/lib/utils/mapCompletion";
import { BarChart3 } from "lucide-react";

export function MapCompletionIndicator() {
  const { selectedMap, regions, placements, showMapCompletionDisplay } = useMapEditorStore();

  const completion = useMemo(() => {
    if (!selectedMap) return null;
    return calculateMapCompletion(selectedMap, regions, placements);
  }, [selectedMap, regions, placements]);

  if (!showMapCompletionDisplay || !completion || !selectedMap) return null;

  const { completionPercentage, eldenRingComparison, totalCells, cellsWithContent } = completion;
  
  // Check if we should hide - only 1 region and it's the base region (inheriting, no overrides)
  const mapRegions = regions.filter(r => r.mapId === selectedMap.id);
  const baseRegion = mapRegions.find(r => 
    r.name === "Base Region" &&
    !r.metadata?.biome && 
    !r.metadata?.climate && 
    r.metadata?.dangerLevel === undefined
  );
  
  // Hide if only base region exists (no real content regions)
  if (mapRegions.length === 1 && baseRegion) {
    return null;
  }

  return (
    <div className="absolute top-4 left-4 bg-deep border border-border rounded-lg p-3 shadow-lg z-10 min-w-64">
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="w-4 h-4 text-ember-glow" />
        <h3 className="font-semibold text-text-primary text-sm">Map Completion</h3>
      </div>

      {/* Completion Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-text-secondary">Completion</span>
          <span className="font-semibold text-text-primary">{completionPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full h-2 bg-void rounded-full overflow-hidden">
          <div
            className="h-full bg-ember-glow transition-all"
            style={{ width: `${Math.min(completionPercentage, 100)}%` }}
          />
        </div>
        <div className="text-xs text-text-muted mt-1">
          {cellsWithContent} / {totalCells} cells with content
        </div>
      </div>

      {/* Elden Ring Comparison (only for world maps) */}
      {eldenRingComparison.eldenRingCells > 0 && (
        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-text-secondary">vs Elden Ring</span>
            <span className="font-semibold text-text-primary">
              {eldenRingComparison.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="text-xs text-text-muted">
            Elden Ring: ~{eldenRingComparison.eldenRingCells.toLocaleString()} cells
            <br />
            Our Map: {eldenRingComparison.ourCells.toLocaleString()} cells
          </div>
        </div>
      )}

      {/* Regions Summary */}
      {regions.length > 0 && (
        <div className="pt-3 border-t border-border">
          <div className="text-xs text-text-secondary">
            <strong>{regions.length}</strong> region{regions.length !== 1 ? "s" : ""} defined
          </div>
        </div>
      )}
    </div>
  );
}

