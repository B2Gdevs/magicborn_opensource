// components/environment/CellSelectionFeedback.tsx
// Provides real-time feedback and validation for cell selections

"use client";

import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, Edit, ExternalLink } from "lucide-react";
import { useMapEditorStore } from "@/lib/store/mapEditorStore";
import { validateCellSelectionForNestedMap, getRecommendedNestedMapConfig } from "@/lib/utils/cellSelectionValidation";
import { generateRegionColor } from "@/lib/data/mapRegions";

export function CellSelectionFeedback() {
  const { 
    selectedCells, 
    selectedMap, 
    placements, 
    regions, 
    selectedRegionId,
    addRegion,
    selectRegion,
    clearRegionSelection,
    setSelectedMap,
  } = useMapEditorStore();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [regionName, setRegionName] = useState("");
  
  const currentMapRegions = regions.filter((r) => r.mapId === selectedMap?.id);
  const selectedRegion = regions.find((r) => r.id === selectedRegionId);

  const validation = useMemo(() => {
    if (!selectedMap || selectedCells.length === 0) {
      return null;
    }

    return validateCellSelectionForNestedMap(selectedCells, selectedMap.coordinateConfig, placements);
  }, [selectedCells, selectedMap, placements]);

  const recommendation = useMemo(() => {
    if (!selectedMap || selectedCells.length === 0) {
      return null;
    }

    return getRecommendedNestedMapConfig(selectedCells, selectedMap.coordinateConfig);
  }, [selectedCells, selectedMap]);

  // Show region list if no active selection
  if (selectedCells.length === 0 && currentMapRegions.length > 0) {
    return (
      <div className="absolute top-4 right-4 w-96 bg-deep border border-border rounded-lg p-4 shadow-lg z-10 max-h-96 overflow-y-auto">
        <h3 className="font-semibold text-text-primary mb-3">Map Regions ({currentMapRegions.length})</h3>
        <div className="space-y-2">
          {currentMapRegions.map((region) => (
            <div
              key={region.id}
              className={`p-2 rounded border-2 cursor-pointer transition-all ${
                selectedRegionId === region.id
                  ? "border-ember-glow bg-ember-glow/10"
                  : "border-border hover:border-ember-glow/40"
              }`}
              onClick={() => {
                if (selectedRegionId === region.id) {
                  clearRegionSelection();
                } else {
                  selectRegion(region.id);
                }
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-4 h-4 rounded border-2"
                  style={{
                    backgroundColor: `${region.color}40`,
                    borderColor: region.color,
                  }}
                />
                <span className="font-semibold text-text-primary">{region.name}</span>
                {region.nestedMapId && (
                  <ExternalLink className="w-3 h-3 text-ember-glow" />
                )}
              </div>
              <div className="text-xs text-text-muted">
                {region.cells.length} cells
                {region.nestedMapId && " • Has nested map"}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!validation || selectedCells.length === 0) {
    return null;
  }

  const { valid, warnings, recommendations, cellCount, estimatedAreaInUnreal } = validation;

  return (
    <div className="absolute top-4 right-4 w-96 bg-deep border border-border rounded-lg p-4 shadow-lg z-10 max-h-96 overflow-y-auto">
      <div className="flex items-center gap-2 mb-3">
        {valid ? (
          <CheckCircle2 className="w-5 h-5 text-green-400" />
        ) : (
          <AlertCircle className="w-5 h-5 text-yellow-400" />
        )}
        <h3 className="font-semibold text-text-primary">
          Cell Selection ({cellCount} cells)
        </h3>
      </div>

      {/* Area info */}
      <div className="mb-3 p-2 bg-void rounded text-sm">
        <div className="text-text-secondary">
          <strong>Area:</strong> {(estimatedAreaInUnreal / 1000000).toFixed(2)} km²
        </div>
        {validation.unrealBounds && (
          <div className="text-text-muted text-xs mt-1">
            Bounds: {validation.unrealBounds.minX.toFixed(0)}m × {validation.unrealBounds.minY.toFixed(0)}m
            {" → "}
            {validation.unrealBounds.maxX.toFixed(0)}m × {validation.unrealBounds.maxY.toFixed(0)}m
          </div>
        )}
      </div>

      {/* Recommended nested map config */}
      {recommendation && (
        <div className="mb-3 p-2 bg-ember/10 border border-ember/30 rounded">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-ember-glow mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <div className="font-semibold text-ember-glow mb-1">Recommended Nested Map:</div>
              <div className="text-text-secondary">
                Level: <strong>{recommendation.level}</strong>
              </div>
              <div className="text-text-secondary">
                Size: <strong>{recommendation.unrealSize}m × {recommendation.unrealSize}m</strong>
              </div>
              <div className="text-text-secondary">
                Image: <strong>{recommendation.imageSize.width}×{recommendation.imageSize.height}px</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold text-yellow-400">Warnings</span>
          </div>
          <ul className="space-y-1">
            {warnings.map((warning, index) => (
              <li key={index} className="text-xs text-text-secondary flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-400">Recommendations</span>
          </div>
          <ul className="space-y-1">
            {recommendations.map((rec, index) => (
              <li key={index} className="text-xs text-text-secondary flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action hint */}
      <div className="mt-3 pt-3 border-t border-border text-xs text-text-muted">
        <strong>Tip:</strong> Use Ctrl+Click or Shift+Click to add/remove cells from selection
      </div>

      {/* Create Region/Nested Map Button */}
      {selectedCells.length > 0 && !selectedRegionId && (
        <div className="mt-3 pt-3 border-t border-border space-y-2">
          {!showCreateDialog ? (
            <>
              <button
                onClick={() => setShowCreateDialog(true)}
                className="w-full px-4 py-2 bg-ember-glow text-black rounded font-semibold hover:opacity-90 transition-opacity"
              >
                Create Region from Selection
              </button>
              <button
                onClick={() => {
                  // TODO: Open nested map creation modal
                  alert("Nested map creation will be implemented next. Selected cells: " + selectedCells.length);
                }}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded font-semibold hover:opacity-90 transition-opacity"
              >
                Create Nested Map from Selection
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={regionName}
                onChange={(e) => setRegionName(e.target.value)}
                placeholder="Region name (e.g., Frozen Loom)"
                className="w-full px-3 py-2 bg-void border border-border rounded text-text-primary"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (regionName.trim() && selectedMap) {
                      const regionId = `region-${Date.now()}`;
                      addRegion({
                        id: regionId,
                        mapId: selectedMap.id, // Parent map
                        name: regionName.trim(),
                        cells: [...selectedCells], // Selected cells define boundaries
                        color: generateRegionColor(regionId),
                        metadata: {
                          // Environment properties (override parent map's default)
                          // Will be set when environment properties form is added
                          // For now, empty - inherits world default until overridden
                        },
                      });
                      setRegionName("");
                      setShowCreateDialog(false);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-ember-glow text-black rounded font-semibold hover:opacity-90 transition-opacity"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowCreateDialog(false);
                    setRegionName("");
                  }}
                  className="px-4 py-2 bg-deep border border-border rounded text-text-primary hover:bg-shadow transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Selected Region */}
      {selectedRegion && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="mb-2 p-2 bg-void rounded">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-4 h-4 rounded border-2"
                style={{
                  backgroundColor: `${selectedRegion.color}40`,
                  borderColor: selectedRegion.color,
                }}
              />
              <span className="font-semibold text-text-primary">{selectedRegion.name}</span>
            </div>
            <div className="text-xs text-text-muted">
              {selectedRegion.cells.length} cells selected
            </div>
          </div>
          <div className="flex gap-2">
            {selectedRegion.nestedMapId ? (
              <button
                onClick={() => {
                  // TODO: Navigate to nested map
                  alert(`Navigate to nested map: ${selectedRegion.nestedMapId}`);
                }}
                className="flex-1 px-4 py-2 bg-ember-glow text-black rounded font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Edit Nested Map
              </button>
            ) : (
              <button
                onClick={() => {
                  // TODO: Create nested map for this region
                  alert("Create nested map for this region");
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded font-semibold hover:opacity-90 transition-opacity"
              >
                Create Nested Map
              </button>
            )}
            <button
              onClick={clearRegionSelection}
              className="px-4 py-2 bg-deep border border-border rounded text-text-primary hover:bg-shadow transition-colors"
            >
              Deselect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

