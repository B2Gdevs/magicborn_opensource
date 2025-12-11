// components/environment/CellSelectionFeedback.tsx
// Provides real-time feedback and validation for cell selections

"use client";

import React, { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, Edit, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useMapEditorStore } from "@/lib/store/mapEditorStore";
import { validateCellSelectionForNestedMap } from "@/lib/utils/cellSelectionValidation";
import { generateRegionColor } from "@/lib/data/mapRegions";
import type { EnvironmentDefinition } from "@/lib/data/environments";
import type { MapDefinition } from "@/lib/data/maps";
import { RegionEditForm } from "./RegionEditForm";
import { Modal } from "@/components/ui/Modal";
import { EnvironmentSelector } from "./EnvironmentSelector";
import { MapImageUpload } from "./MapImageUpload";
import { AreaInfoDisplay } from "./AreaInfoDisplay";
import { getCellCount } from "@/lib/utils/cellUtils";
import { pixelToCell } from "@/lib/utils/coordinateSystem";
import { findParentRegion, findBaseRegion, getInheritedEnvironment } from "@/lib/utils/regionInheritance";

interface CellSelectionFeedbackProps {
  environments?: EnvironmentDefinition[];
  maps?: MapDefinition[];
  refreshAllRegions?: (regions: any[]) => void;
}

export function CellSelectionFeedback({ environments = [], maps = [], refreshAllRegions }: CellSelectionFeedbackProps) {
  const { 
    selectedCellBounds,
    getSelectedCells,
    selectedMap, 
    placements, 
    regions, 
    selectedRegionId,
    addRegion,
    updateRegion,
    selectRegion,
    clearRegionSelection,
    clearCellSelection,
    setSelectedMap,
    showCellSelectionDisplay,
    selectAllCells,
  } = useMapEditorStore();
  
  // Get selected cells array from bounds
  const selectedCells = useMemo(() => getSelectedCells(), [selectedCellBounds, getSelectedCells]);
  
  const [isMinimized, setIsMinimized] = useState(false);
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingRegion, setEditingRegion] = useState<typeof regions[0] | null>(null);
  const [regionName, setRegionName] = useState("");
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string | null>(null);
  
  const currentMapRegions = regions.filter((r) => r.mapId === selectedMap?.id);
  const selectedRegion = regions.find((r) => r.id === selectedRegionId);
  
  // Get base region for this map
  const baseRegion = useMemo(() => {
    if (!selectedMap) return null;
    return regions.find(
      r => r.mapId === selectedMap.id && r.name === "Base Region"
    ) || null;
  }, [regions, selectedMap]);
  
  // Check if we're selecting within an existing region (for nested regions)
  const parentRegion = useMemo(() => {
    if (!selectedMap || selectedCells.length === 0) return null;
    return findParentRegion(selectedCells, regions, selectedMap.id);
  }, [regions, selectedMap, selectedCells]);
  
  // Get inherited environment
  const parentRegionEnvironment = useMemo(() => 
    getInheritedEnvironment(parentRegion, baseRegion, environments),
    [parentRegion, baseRegion, environments]
  );
  
  // Get the image to display in the drop zone
  const displayImagePath = useMemo(() => {
    if (!selectedMap) return null;
    
    // If we're selecting the base region, show the map's image
    if (baseRegion && selectedCells.length > 0) {
      // Check if selected cells match base region
      const selectedCellSet = new Set(selectedCells.map(c => `${c.cellX},${c.cellY}`));
      const baseRegionCellSet = new Set(baseRegion.cells.map(c => `${c.cellX},${c.cellY}`));
      const isSelectingBaseRegion = selectedCells.length === baseRegion.cells.length &&
        selectedCells.every(c => baseRegionCellSet.has(`${c.cellX},${c.cellY}`));
      
      if (isSelectingBaseRegion) {
        return selectedMap.imagePath || null;
      }
    }
    
    // If we're selecting a region with a nested map, show the nested map's image
    if (parentRegion?.nestedMapId) {
      const nestedMap = maps.find(m => m.id === parentRegion.nestedMapId);
      return nestedMap?.imagePath || null;
    }
    
    return null;
  }, [selectedMap, baseRegion, selectedCells, parentRegion, maps]);
  
  // Set default environment to inherited one if not manually selected
  const effectiveEnvironmentId = useMemo(() => 
    selectedEnvironmentId !== null 
      ? selectedEnvironmentId 
      : (parentRegionEnvironment?.id || null),
    [selectedEnvironmentId, parentRegionEnvironment]
  );

  // Handle image file upload - snaps cells to square
  const handleImageUploaded = (imagePath: string) => {
    // Image upload is handled by MapImageUpload component
    // This callback can be used for additional logic if needed
  };
  
  const handleCellsSnapped = (cells: Array<{ cellX: number; cellY: number }>) => {
    if (cells.length === 0) return;
    
    // Convert cells to bounds for selection
    const xs = cells.map(c => c.cellX);
    const ys = cells.map(c => c.cellY);
    useMapEditorStore.getState().selectCellRange(
      { cellX: Math.min(...xs), cellY: Math.min(...ys) },
      { cellX: Math.max(...xs), cellY: Math.max(...ys) }
    );
  };

  const validation = useMemo(() => {
    if (!selectedMap || selectedCells.length === 0) {
      return null;
    }

    return validateCellSelectionForNestedMap(selectedCells, selectedMap.coordinateConfig, placements);
  }, [selectedCells, selectedMap, placements]);


  // Show region list if no active selection
  if (selectedCells.length === 0 && currentMapRegions.length > 0) {
    return (
      <>
        <div className="absolute top-4 right-4 w-96 bg-deep border border-border rounded-lg p-4 shadow-lg z-10 max-h-96 overflow-y-auto">
          <h3 className="font-semibold text-text-primary mb-3">Map Regions ({currentMapRegions.length})</h3>
          <div className="space-y-2">
            {currentMapRegions.map((region) => {
              // Base region is not selectable - it's just the entire map
              const isBaseRegion = region.name === "Base Region";
              
              return (
              <div
                key={region.id}
                className={`p-2 rounded border-2 transition-all ${
                  isBaseRegion
                    ? "border-border opacity-50 cursor-not-allowed"
                    : selectedRegionId === region.id
                    ? "border-ember-glow bg-ember-glow/10 cursor-pointer"
                    : "border-border hover:border-ember-glow/40 cursor-pointer"
                }`}
                onClick={() => {
                  if (isBaseRegion) return; // Base region is not selectable
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
                {!isBaseRegion && (
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Store the region to edit and open dialog without selecting it on the map
                        setEditingRegion(region);
                        setShowEditDialog(true);
                      }}
                      className="px-2 py-1 text-xs bg-deep border border-border rounded text-text-primary hover:bg-shadow transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </div>
        
        {/* Edit Region Modal - rendered here so it's available when showing region list */}
        {editingRegion && selectedMap && (
          <Modal
            isOpen={showEditDialog}
            onClose={() => {
              setShowEditDialog(false);
              setEditingRegion(null);
            }}
            title={`Edit Region: ${editingRegion.name}`}
            footer={
              <div className="flex gap-2">
                <button
                  type="submit"
                  form="region-edit-form"
                  className="px-4 py-2 bg-ember-glow text-black rounded font-semibold hover:opacity-90 transition-opacity"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setShowEditDialog(false);
                    setEditingRegion(null);
                  }}
                  className="px-4 py-2 bg-deep border border-border rounded text-text-primary hover:bg-shadow transition-colors"
                >
                  Cancel
                </button>
              </div>
            }
          >
            <RegionEditForm
              region={editingRegion}
              map={selectedMap}
              environments={environments}
              maps={maps}
              regions={regions}
              onSubmit={async (updatedRegion) => {
                await updateRegion(updatedRegion);
                // Refresh all regions after update
                const { mapRegionClient } = await import("@/lib/api/clients");
                const allRegionsList = await mapRegionClient.list().catch((err) => {
                  console.error("Failed to load regions:", err);
                  return [];
                });
                if (refreshAllRegions) {
                  refreshAllRegions(allRegionsList);
                }
                setShowEditDialog(false);
                setEditingRegion(null);
              }}
              onCancel={() => {
                setShowEditDialog(false);
                setEditingRegion(null);
              }}
            />
          </Modal>
        )}
      </>
    );
  }

  if (!showCellSelectionDisplay || !validation || selectedCells.length === 0) {
    return null;
  }

  const { valid, warnings, recommendations, cellCount, estimatedAreaInUnreal } = validation;

  return (
    <div className="absolute top-4 right-4 w-96 bg-deep border border-border rounded-lg shadow-lg z-10">
      {/* Header with minimize button */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          {valid ? (
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-400" />
          )}
          <h3 className="font-semibold text-text-primary">
            Cell Selection ({selectedCellBounds ? getCellCount(selectedCellBounds) : 0} cells)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={selectAllCells}
            className="px-2 py-1 text-xs rounded border border-border hover:bg-deep hover:border-ember-glow/40 text-text-muted hover:text-ember-glow transition-colors"
            title="Select all cells (Ctrl/Cmd+A)"
          >
            Select All
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded hover:bg-shadow text-text-muted hover:text-text-primary transition-colors"
          >
            {isMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <div className="flex flex-col max-h-96">
          <div className="flex-1 overflow-y-auto p-4">
          {/* Environment Selection */}
          <EnvironmentSelector
            environments={environments}
            selectedEnvironmentId={selectedEnvironmentId}
            onEnvironmentChange={async (value) => {
              setSelectedEnvironmentId(value);
              
              // If we have a selected region, update it immediately
              if (selectedRegion && selectedMap) {
                await updateRegion({
                  ...selectedRegion,
                  environmentId: value || undefined,
                });
              }
              // If we're selecting the base region, update it immediately
              else if (baseRegion && selectedMap && selectedCells.length > 0) {
                // Check if selected cells match base region
                const selectedCellSet = new Set(selectedCells.map(c => `${c.cellX},${c.cellY}`));
                const baseRegionCellSet = new Set(baseRegion.cells.map(c => `${c.cellX},${c.cellY}`));
                const isSelectingBaseRegion = selectedCells.length === baseRegion.cells.length &&
                  selectedCells.every(c => baseRegionCellSet.has(`${c.cellX},${c.cellY}`));
                
                if (isSelectingBaseRegion) {
                  await updateRegion({
                    ...baseRegion,
                    environmentId: value || undefined,
                  });
                }
              }
            }}
            parentRegion={parentRegion}
            baseRegion={baseRegion}
            contextLabel="Selecting within region:"
            showInheritanceInfo={true}
          />
          
          {/* Map Image Upload */}
          {selectedMap && (
            <MapImageUpload
              currentImagePath={displayImagePath}
              map={selectedMap}
              onImageUploaded={handleImageUploaded}
              onCellsSnapped={handleCellsSnapped}
            />
          )}

          {/* Area info */}
          <AreaInfoDisplay
            estimatedAreaInUnreal={estimatedAreaInUnreal}
            unrealBounds={validation.unrealBounds}
          />


      {/* Warnings (filter out performance warnings) */}
      {warnings.filter(w => !w.toLowerCase().includes('performance') && !w.toLowerCase().includes('very large')).length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold text-yellow-400">Warnings</span>
          </div>
          <ul className="space-y-1">
            {warnings
              .filter(w => !w.toLowerCase().includes('performance') && !w.toLowerCase().includes('very large'))
              .map((warning, index) => (
                <li key={index} className="text-xs text-text-secondary flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  <span>{warning}</span>
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Action hint */}
      <div className="mt-3 pt-3 border-t border-border text-xs text-text-muted">
        <strong>Tip:</strong> Use Ctrl+Click or Shift+Click to add/remove cells from selection
      </div>
          </div>
          
          {/* Edit Selected Region - Buttons always at bottom */}
          {selectedRegion && selectedMap && selectedRegion.name !== "Base Region" && (
            <div className="border-t border-border p-4 bg-deep/50">
              <div className="mb-3 p-2 bg-void rounded">
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
                <div className="text-xs text-text-muted space-y-1">
                  <div>{selectedRegion.cells.length} cells selected</div>
                  {selectedRegion.nestedMapId && (() => {
                    const nestedMap = maps.find(m => m.id === selectedRegion.nestedMapId);
                    return (
                      <div className="text-text-secondary">
                        Has nested map: {nestedMap?.name || selectedRegion.nestedMapId}
                        {nestedMap?.imagePath && (
                          <span className="text-text-muted ml-1">({nestedMap.imagePath})</span>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEditDialog(true)}
                  className="flex-1 px-4 py-2 bg-ember-glow text-black rounded font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Coordinates
                </button>
                {selectedRegion.nestedMapId ? (
                  <button
                    onClick={() => {
                      // TODO: Navigate to nested map
                      alert(`Navigate to nested map: ${selectedRegion.nestedMapId}`);
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Nested Map
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      // TODO: Create nested map for this region
                      alert("Create nested map for this region");
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded font-semibold hover:opacity-90 transition-opacity"
                  >
                    Create Map
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
          
          {/* Create Region Button - Always at bottom */}
          {selectedCells.length > 0 && !selectedRegionId && (
            <div className="border-t border-border p-4 bg-deep/50">
              {!showCreateDialog ? (
                <button
                  onClick={() => setShowCreateDialog(true)}
                  className="w-full px-4 py-2 bg-ember-glow text-black rounded font-semibold hover:opacity-90 transition-opacity"
                >
                  Create Region from Selection
                </button>
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
                      onClick={async () => {
                        if (regionName.trim() && selectedMap) {
                          const regionId = `region-${Date.now()}`;
                          await addRegion({
                            id: regionId,
                            mapId: selectedMap.id, // Parent map
                            name: regionName.trim(),
                            cells: selectedCells, // Selected cells define boundaries
                            color: generateRegionColor(regionId),
                            environmentId: effectiveEnvironmentId || undefined,
                            metadata: {
                              // Environment properties (override parent map's default)
                              // Will be set when environment properties form is added
                              // For now, empty - inherits world default until overridden
                            },
                          });
                          // Clear cell selection after creating region
                          clearCellSelection();
                          setSelectedEnvironmentId(null); // Reset after creation
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
        </div>
      )}

      {/* Edit Region Modal */}
      {editingRegion && selectedMap && (
        <Modal
          isOpen={showEditDialog}
          onClose={() => {
            setShowEditDialog(false);
            setEditingRegion(null);
          }}
          title={`Edit Region: ${editingRegion.name}`}
          footer={
            <div className="flex gap-2">
              <button
                type="submit"
                form="region-edit-form"
                className="px-4 py-2 bg-ember-glow text-black rounded font-semibold hover:opacity-90 transition-opacity"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setShowEditDialog(false);
                  setEditingRegion(null);
                }}
                className="px-4 py-2 bg-deep border border-border rounded text-text-primary hover:bg-shadow transition-colors"
              >
                Cancel
              </button>
            </div>
          }
        >
          <RegionEditForm
            region={editingRegion}
            map={selectedMap}
            environments={environments}
            maps={maps}
            regions={regions}
            onSubmit={async (updatedRegion) => {
              await updateRegion(updatedRegion);
              // Refresh all regions after update
              const { mapRegionClient } = await import("@/lib/api/clients");
              const allRegionsList = await mapRegionClient.list().catch((err) => {
                console.error("Failed to load regions:", err);
                return [];
              });
              if (refreshAllRegions) {
                refreshAllRegions(allRegionsList);
              }
              setShowEditDialog(false);
              setEditingRegion(null);
            }}
            onCancel={() => {
              setShowEditDialog(false);
              setEditingRegion(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

