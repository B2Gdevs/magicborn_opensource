// components/environment/EnvironmentEditor.tsx
// Professional environment editor with map canvas, keyboard shortcuts, and context menus

"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useMapEditorStore } from "@/lib/store/mapEditorStore";
import { mapClient } from "@/lib/api/clients";
import { mapPlacementClient } from "@/lib/api/clients";
import type { MapDefinition } from "@/lib/data/maps";
import { useHotkeys } from "react-hotkeys-hook";
import { MapForm } from "./MapForm";
import { WorldRegionForm } from "./WorldRegionForm";
import { EnvironmentForm } from "./EnvironmentForm";
import { Modal } from "@/components/ui/Modal";
import { Tooltip } from "@/components/ui/Tooltip";
import { SearchableCombobox } from "@/components/ui/SearchableCombobox";
import { Plus, X, Globe, Map, Info, ChevronDown } from "lucide-react";
import { environmentClient } from "@/lib/api/clients";
import type { EnvironmentDefinition } from "@/lib/data/environments";

// Dynamically import MapCanvas to avoid SSR issues with Konva
const MapCanvas = dynamic(() => import("./MapCanvas").then((mod) => ({ default: mod.MapCanvas })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-deep text-text-muted">
      <p>Loading map canvas...</p>
    </div>
  ),
});
import * as ContextMenu from "@radix-ui/react-context-menu";
import { 
  Trash2, 
  Copy, 
  ClipboardPaste, 
  Move, 
  Grid, 
  MousePointer,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Square,
  HelpCircle
} from "lucide-react";

export default function EnvironmentEditor() {
  const [environments, setEnvironments] = useState<EnvironmentDefinition[]>([]);
  const [maps, setMaps] = useState<MapDefinition[]>([]);
  const [allRegions, setAllRegions] = useState<any[]>([]); // All regions from all maps
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"maps" | "environments">("maps");
  const [showCreateEnvironmentModal, setShowCreateEnvironmentModal] = useState(false);
  const [showEditEnvironmentModal, setShowEditEnvironmentModal] = useState(false);
  const [selectedEnvironmentForEdit, setSelectedEnvironmentForEdit] = useState<EnvironmentDefinition | null>(null);
  const [showCreateWorldRegionModal, setShowCreateWorldRegionModal] = useState(false);
  const [showCreateMapModal, setShowCreateMapModal] = useState(false);
  const [showEditMapModal, setShowEditMapModal] = useState(false);
  const [selectedMapForEdit, setSelectedMapForEdit] = useState<MapDefinition | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDisplayDropdown, setShowDisplayDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    selectedMap,
    selectedMapId,
    setSelectedMap,
    regions,
    selectedRegionId,
    selectRegion,
    placements,
    zoom,
    panX,
    panY,
    showGrid,
    snapToGrid,
    selectionMode,
    selectedCellBounds,
    getSelectedCells,
    toggleGrid,
    toggleSnap,
    setSelectionMode,
    clearCellSelection,
    zoomIn,
    zoomOut,
    resetView,
    fitToViewport,
    copySelected,
    paste,
    deleteSelectedPlacements,
    canUndo,
    canRedo,
    undo,
    redo,
    showCellSelectionDisplay,
    showMapCompletionDisplay,
    showRegions,
    toggleCellSelectionDisplay,
    toggleMapCompletionDisplay,
    toggleRegions,
  } = useMapEditorStore();

  // Load environments, maps, and all regions on mount
  useEffect(() => {
    async function loadData() {
      try {
        setError(null);
        setLoading(true);
        const [loadedEnvironments, loadedMaps] = await Promise.all([
          environmentClient.list().catch((err) => {
            console.error("Failed to load environments:", err);
            return [];
          }),
          mapClient.list().catch((err) => {
            console.error("Failed to load maps:", err);
            return [];
          }),
        ]);
        setEnvironments(loadedEnvironments);
        setMaps(loadedMaps);
        
        // Load all regions from all maps
        const { mapRegionClient } = await import("@/lib/api/clients");
        const allRegionsList = await mapRegionClient.list().catch((err) => {
          console.error("Failed to load regions:", err);
          return [];
        });
        setAllRegions(allRegionsList);
        
        // Load placements for selected map
        if (selectedMapId) {
          try {
            const loadedPlacements = await mapPlacementClient.list(selectedMapId);
            useMapEditorStore.getState().setPlacements(loadedPlacements);
          } catch (err) {
            console.error("Failed to load placements:", err);
            // Don't fail the whole component if placements fail
          }
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to load data";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedMapId]);

  // Load placements when map changes
  useEffect(() => {
    async function loadPlacements() {
      if (!selectedMapId) {
        useMapEditorStore.getState().setPlacements([]);
        return;
      }
      
      try {
        const loadedPlacements = await mapPlacementClient.list(selectedMapId);
        useMapEditorStore.getState().setPlacements(loadedPlacements);
      } catch (error) {
        console.error("Failed to load placements:", error);
        // Don't fail the whole component if placements fail
      }
    }
    loadPlacements();
  }, [selectedMapId]);

  // Refresh all regions list when regions change in the store
  useEffect(() => {
    async function refreshAllRegions() {
      if (maps.length === 0) return;
      
      const { mapRegionClient } = await import("@/lib/api/clients");
      const allRegionsList = await mapRegionClient.list().catch((err) => {
        console.error("Failed to load regions:", err);
        return [];
      });
      setAllRegions(allRegionsList);
    }
    
    // Refresh when regions in store change (debounced)
    const timeoutId = setTimeout(() => {
      refreshAllRegions();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [regions, maps]);

  const handleCreateEnvironment = async (environment: EnvironmentDefinition) => {
    setSaving(true);
    try {
      await environmentClient.create(environment);
      const refreshedEnvironments = await environmentClient.list();
      setEnvironments(refreshedEnvironments);
      setShowCreateEnvironmentModal(false);
    } catch (error) {
      console.error("Error creating environment:", error);
      alert(`Failed to create environment: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEnvironment = async (environment: EnvironmentDefinition) => {
    setSaving(true);
    try {
      await environmentClient.update(environment);
      const refreshedEnvironments = await environmentClient.list();
      setEnvironments(refreshedEnvironments);
      setShowEditEnvironmentModal(false);
      setSelectedEnvironmentForEdit(null);
    } catch (error) {
      console.error("Error updating environment:", error);
      alert(`Failed to update environment: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEnvironment = async (environment: EnvironmentDefinition) => {
    if (!confirm(`Delete ${environment.name}? This will not delete associated maps, but they will need to be reassigned to another environment.`)) return;
    
    setSaving(true);
    try {
      await environmentClient.delete(environment.id);
      const refreshedEnvironments = await environmentClient.list();
      setEnvironments(refreshedEnvironments);
    } catch (error) {
      console.error("Error deleting environment:", error);
      alert(`Failed to delete environment: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateWorldRegion = async (data: { environment: EnvironmentDefinition; map: MapDefinition; region: any }) => {
    setSaving(true);
    try {
      // Create environment first
      await environmentClient.create(data.environment);
      
      // Create map
      await mapClient.create(data.map);
      
      // Update environment's mapIds
      const updatedEnvironment: EnvironmentDefinition = {
        ...data.environment,
        mapIds: [data.map.id],
      };
      await environmentClient.update(updatedEnvironment);
      
      // Create region
      const { mapRegionClient } = await import("@/lib/api/clients");
      await mapRegionClient.create(data.region);
      
      // Refresh data
      const [refreshedEnvironments, refreshedMaps, refreshedRegions] = await Promise.all([
        environmentClient.list(),
        mapClient.list(),
        mapRegionClient.list(),
      ]);
      setEnvironments(refreshedEnvironments);
      setMaps(refreshedMaps);
      setAllRegions(refreshedRegions);
      
      // Select the new map and base region
      setSelectedMap(data.map);
      selectRegion(data.region.id);
      
      // Set zoom to 100% and switch to cell selection mode for immediate editing
      // This will be handled by MapCanvas's effect when selectionMode changes to "cell"
      const store = useMapEditorStore.getState();
      store.setZoom(1.0);
      store.setSelectionMode("cell");
      // MapCanvas will handle centering when entering cell selection mode
      
      setShowCreateWorldRegionModal(false);
    } catch (error) {
      console.error("Error creating world region:", error);
      alert(`Failed to create world region: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateMap = async (map: MapDefinition) => {
    setSaving(true);
    try {
      await mapClient.create(map);
      const refreshedMaps = await mapClient.list();
      setMaps(refreshedMaps);
      
      // Update environment's mapIds
      const environment = environments.find((e) => e.id === map.environmentId);
      if (environment) {
        const updatedEnvironment: EnvironmentDefinition = {
          ...environment,
          mapIds: [...environment.mapIds, map.id],
        };
        await environmentClient.update(updatedEnvironment);
        const refreshedEnvironments = await environmentClient.list();
        setEnvironments(refreshedEnvironments);
      }
      
      setSelectedMap(map);
      setShowCreateMapModal(false);
    } catch (error) {
      console.error("Error creating map:", error);
      alert(`Failed to create map: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateMap = async (map: MapDefinition) => {
    setSaving(true);
    try {
      await mapClient.update(map);
      const refreshedMaps = await mapClient.list();
      setMaps(refreshedMaps);
      setSelectedMap(map);
      setShowEditMapModal(false);
      setSelectedMapForEdit(null);
    } catch (error) {
      console.error("Error updating map:", error);
      alert(`Failed to update map: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMap = async (map: MapDefinition) => {
    if (!confirm(`Delete ${map.name}? This will also delete all regions associated with this map.`)) return;
    
    setSaving(true);
    try {
      // Delete all regions for this map
      const { mapRegionClient } = await import("@/lib/api/clients");
      const regions = await mapRegionClient.list(map.id);
      for (const region of regions) {
        await mapRegionClient.delete(region.id);
      }
      
      // Delete the map
      await mapClient.delete(map.id);
      
      // Update environment's mapIds
      const environment = environments.find((e) => e.id === map.environmentId);
      if (environment) {
        const updatedEnvironment: EnvironmentDefinition = {
          ...environment,
          mapIds: environment.mapIds.filter((id) => id !== map.id),
        };
        await environmentClient.update(updatedEnvironment);
      }
      
      // Refresh data
      const [refreshedMaps, refreshedEnvironments] = await Promise.all([
        mapClient.list(),
        environmentClient.list(),
      ]);
      setMaps(refreshedMaps);
      setEnvironments(refreshedEnvironments);
      
      // Clear selection if deleted map was selected
      if (selectedMap?.id === map.id) {
        setSelectedMap(null);
        useMapEditorStore.getState().setSelectedMap(null);
      }
    } catch (error) {
      console.error("Error deleting map:", error);
      alert(`Failed to delete map: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  // Keyboard shortcuts
  useHotkeys("g", () => toggleGrid(), { preventDefault: true });
  useHotkeys("s", () => toggleSnap(), { preventDefault: true });
  useHotkeys("equal", () => zoomIn(), { preventDefault: true }); // + key
  useHotkeys("minus", () => zoomOut(), { preventDefault: true }); // - key
  useHotkeys("0", () => resetView(), { preventDefault: true });
  useHotkeys("f", () => fitToViewport(), { preventDefault: true });
  useHotkeys("ctrl+c", () => copySelected(), { preventDefault: true });
  useHotkeys("ctrl+v", () => paste(), { preventDefault: true });
  useHotkeys("ctrl+z", () => undo(), { preventDefault: true, enabled: canUndo() });
  useHotkeys("ctrl+shift+z", () => redo(), { preventDefault: true, enabled: canRedo() });
  useHotkeys("delete", () => deleteSelectedPlacements(), { preventDefault: true });
  useHotkeys("escape", () => useMapEditorStore.getState().clearSelection(), { preventDefault: true });

  // Get container dimensions
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth || window.innerWidth;
        const height = containerRef.current.clientHeight || window.innerHeight;
        
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    };
    
    // Initial update
    updateDimensions();
    
    // Use ResizeObserver for better dimension tracking
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(updateDimensions);
      resizeObserver.observe(containerRef.current);
    }
    
    // Fallback to window resize
    window.addEventListener("resize", updateDimensions);
    
    // Also try after a short delay in case container isn't ready yet
    const timeoutId = setTimeout(updateDimensions, 100);
    
    return () => {
      window.removeEventListener("resize", updateDimensions);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      clearTimeout(timeoutId);
    };
  }, [activeSection]); // Re-run when section changes

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-deep text-text-muted">
        <p>Loading environments and maps...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-deep text-text-muted gap-4">
        <p className="text-red-500">Error: {error}</p>
        <button
          onClick={async () => {
            setLoading(true);
            setError(null);
            try {
              // Reload both environments and maps
              const [loadedEnvironments, loadedMaps] = await Promise.all([
                environmentClient.list(),
                mapClient.list(),
              ]);
              setEnvironments(loadedEnvironments);
              setMaps(loadedMaps);
              
              // Load placements for selected map
              if (selectedMapId) {
                try {
                  const loadedPlacements = await mapPlacementClient.list(selectedMapId);
                  useMapEditorStore.getState().setPlacements(loadedPlacements);
                } catch (err) {
                  console.error("Failed to load placements:", err);
                }
              }
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed to load data");
            } finally {
              setLoading(false);
            }
          }}
          className="px-4 py-2 bg-ember-glow text-black rounded font-semibold hover:opacity-90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-deep">
      {/* Section Tabs */}
      <div className="border-b border-border bg-shadow px-4 py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSection("maps")}
            className={`px-4 py-2 rounded text-sm font-semibold transition-all flex items-center gap-2 ${
              activeSection === "maps"
                ? "bg-ember-glow text-black"
                : "bg-deep text-text-muted hover:text-text-primary"
            }`}
          >
            <Map className="w-4 h-4" />
            Maps
          </button>
          <button
            onClick={() => setActiveSection("environments")}
            className={`px-4 py-2 rounded text-sm font-semibold transition-all flex items-center gap-2 ${
              activeSection === "environments"
                ? "bg-ember-glow text-black"
                : "bg-deep text-text-muted hover:text-text-primary"
            }`}
          >
            <Globe className="w-4 h-4" />
            Environments
          </button>
        </div>
      </div>

      {/* Environments Section */}
      {activeSection === "environments" && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-glow">Environments</h2>
              <button
                onClick={() => setShowCreateEnvironmentModal(true)}
                className="px-4 py-2 bg-ember-glow text-black rounded font-semibold hover:opacity-90 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Environment
              </button>
            </div>
            <p className="text-sm text-text-muted mb-4">
              Environments define characteristics (biome, climate, danger level) that can be applied to maps. 
              Maps have a default environment, and regions can override with different environment properties.
            </p>
          </div>

          {environments.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <Globe className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No environments yet</p>
              <p className="text-sm">Create environments that can be applied to maps</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {environments.map((env) => (
                <div
                  key={env.id}
                  className="bg-shadow border border-border rounded-lg p-4 hover:border-ember/50 transition-colors"
                >
                  {env.imagePath && (
                    <div className="w-full h-24 mb-3 rounded overflow-hidden bg-deep border border-border">
                      <img
                        src={env.imagePath}
                        alt={env.name}
                        className="w-full h-full object-cover opacity-60"
                      />
                    </div>
                  )}
                  <h3 className="font-semibold text-text-primary mb-1">{env.name}</h3>
                  <p className="text-sm text-text-muted mb-3 line-clamp-2">{env.description}</p>
                  <div className="flex items-center gap-2 text-xs text-text-muted mb-3 flex-wrap">
                    <span className="px-2 py-1 bg-deep rounded border border-border">{env.metadata.biome}</span>
                    <span className="px-2 py-1 bg-deep rounded border border-border">{env.metadata.climate}</span>
                    <span className="px-2 py-1 bg-deep rounded border border-border">Danger: {env.metadata.dangerLevel}</span>
                  </div>
                  {env.mapIds && env.mapIds.length > 0 && (
                    <div className="text-xs text-text-muted mb-3">
                      Used by {env.mapIds.length} map{env.mapIds.length !== 1 ? 's' : ''}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedEnvironmentForEdit(env);
                        setShowEditEnvironmentModal(true);
                      }}
                      className="px-3 py-1.5 bg-deep border border-border rounded text-text-primary text-sm hover:bg-shadow transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEnvironment(env)}
                      className="px-3 py-1.5 bg-deep border border-border rounded text-red-400 text-sm hover:bg-shadow transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Maps Section */}
      {activeSection === "maps" && (
        <div className="flex-1 flex flex-col bg-deep">
          {/* Toolbar */}
          <div className="border-b border-border bg-shadow px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              {/* Help Button */}
              <Tooltip content="Open User Guide - Learn how to use the Map Editor">
                <button
                  onClick={() => {
                    window.open("/developer/user-guides/MAP_EDITOR_USER_GUIDE.md", "_blank");
                  }}
                  className="p-2 rounded text-text-muted hover:text-ember-glow hover:bg-deep transition-all"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </Tooltip>
              
              <div className="w-px h-6 bg-border mx-1" />

              {/* Region selector - show all regions */}
              {(() => {
                // Show all regions, including base regions and nested regions
                const regionOptions = allRegions.map(region => {
                  // Determine which map this region uses
                  let map: MapDefinition | undefined;
                  let mapLabel: string;
                  
                  if (region.nestedMapId) {
                    // Region has its own nested map
                    map = maps.find(m => m.id === region.nestedMapId);
                    mapLabel = map ? map.name : "Unknown map";
                  } else {
                    // Region uses its parent map
                    map = maps.find(m => m.id === region.mapId);
                    mapLabel = map ? map.name : "Unknown map";
                  }
                  
                  // Get parent region info if it exists
                  const parentRegion = region.parentRegionId 
                    ? allRegions.find(r => r.id === region.parentRegionId)
                    : null;
                  
                  const env = region.environmentId 
                    ? environments.find(e => e.id === region.environmentId)
                    : null;
                  const envInfo = env 
                    ? `${env.metadata.biome} • ${env.metadata.climate} • Danger: ${env.metadata.dangerLevel}`
                    : "No environment";
                  
                  // Build description with parent region info if available
                  let description = envInfo;
                  if (parentRegion) {
                    description = `${description} • Parent: ${parentRegion.name}`;
                  }
                  
                  return {
                    value: region.id,
                    label: `${region.name} (${mapLabel})`,
                    description: description
                  };
                });
                
                // Find the "world region" for default selection (top-level region, not "Base Region")
                const worldRegion = allRegions.find(r => {
                  if (r.name === "Base Region") return false; // Skip base region
                  if (r.nestedMapId) return false; // Must not have nested map
                  if (!r.mapId) return false; // Must have parent map
                  const parentMap = maps.find(m => m.id === r.mapId);
                  return parentMap && parentMap.imagePath && parentMap.imagePath.trim() !== '';
                });
                
                return (
                  <div className="w-64">
                    <SearchableCombobox
                      options={regionOptions}
                      value={selectedRegionId || (worldRegion ? worldRegion.id : null)}
                      onChange={async (regionId) => {
                        if (!regionId) {
                          selectRegion(null);
                          useMapEditorStore.getState().setSelectedMap(null);
                          return;
                        }
                        
                        const region = allRegions.find(r => r.id === regionId);
                        if (!region) {
                          console.error(`Region ${regionId} not found`);
                          return;
                        }
                        
                        // Determine which map to load for this region
                        // Priority: nestedMapId > mapId
                        let mapToLoad: MapDefinition | undefined;
                        
                        if (region.nestedMapId) {
                          mapToLoad = maps.find(m => m.id === region.nestedMapId);
                        } else if (region.mapId) {
                          mapToLoad = maps.find(m => m.id === region.mapId);
                        }
                        
                        if (mapToLoad) {
                          // Select the region first (this sets selectedRegionId in the store)
                          selectRegion(regionId);
                          // Then load the map (this will call loadRegions, which should preserve selectedRegionId)
                          await setSelectedMap(mapToLoad);
                          // After loading, ensure the region is still selected
                          // (loadRegions should preserve it, but ensure it's set)
                          const store = useMapEditorStore.getState();
                          if (store.selectedRegionId !== regionId) {
                            selectRegion(regionId);
                          }
                          // Refresh all regions list to keep it fresh
                          const { mapRegionClient } = await import("@/lib/api/clients");
                          const allRegionsList = await mapRegionClient.list().catch((err) => {
                            console.error("Failed to load regions:", err);
                            return [];
                          });
                          setAllRegions(allRegionsList);
                        } else {
                          console.error(`Map not found for region ${regionId} (${region.name}). nestedMapId: ${region.nestedMapId}, mapId: ${region.mapId}`);
                        }
                      }}
                      placeholder="Select a region to edit..."
                      searchPlaceholder="Search regions..."
                    />
                  </div>
                );
              })()}
              
              {/* Environment info for selected map (from base region) */}
              {selectedMap && (() => {
                // Get base region for this map
                const baseRegion = useMapEditorStore.getState().regions.find(
                  r => r.mapId === selectedMap.id && r.name === "Base Region"
                );
                const mapEnvironment = baseRegion?.environmentId 
                  ? environments.find(e => e.id === baseRegion.environmentId)
                  : null;
                return mapEnvironment ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-deep/50 border border-border rounded text-xs">
                    <Globe className="w-3 h-3 text-text-muted" />
                    <span className="text-text-muted">Environment:</span>
                    <span className="text-text-primary font-medium">{mapEnvironment.name}</span>
                    <span className="text-text-muted">•</span>
                    <span className="text-text-muted">{mapEnvironment.metadata.biome}</span>
                    <span className="text-text-muted">•</span>
                    <span className="text-text-muted">Danger: {mapEnvironment.metadata.dangerLevel}</span>
                  </div>
                ) : null;
              })()}
              
              <button
                onClick={() => setShowCreateWorldRegionModal(true)}
                className="px-3 py-1.5 bg-ember-glow text-black rounded text-sm font-semibold hover:opacity-90 flex items-center gap-1"
                title="Create World Region (creates environment + map + region)"
              >
                <Plus className="w-4 h-4" />
                New World Region
              </button>
              
              {selectedMap && (
                <>
                  <div className="w-px h-6 bg-border mx-1" />
                  <button
                    onClick={() => {
                      setSelectedMapForEdit(selectedMap);
                      setShowEditMapModal(true);
                    }}
                    className="px-3 py-1.5 bg-deep border border-border rounded text-text-primary text-sm hover:bg-shadow transition-colors"
                    title="Edit Map"
                  >
                    Edit Map
                  </button>
                  <button
                    onClick={() => handleDeleteMap(selectedMap)}
                    className="px-3 py-1.5 bg-deep border border-border rounded text-red-400 text-sm hover:bg-shadow transition-colors"
                    title="Delete Map"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Tool buttons */}
              <Tooltip content="Toggle Grid Overlay - Show/hide grid lines (G key)">
                <button
                  onClick={toggleGrid}
                  className={`p-2 rounded text-text-muted hover:text-ember-glow hover:bg-deep transition-all ${
                    showGrid ? "text-ember-glow bg-deep" : ""
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
              </Tooltip>
              
              {showGrid && (
                <Tooltip content="Toggle Snap to Grid - Snap placements to grid cells (S key)">
                  <button
                    onClick={toggleSnap}
                    className={`p-2 rounded text-text-muted hover:text-ember-glow hover:bg-deep transition-all ${
                      snapToGrid ? "text-ember-glow bg-deep" : ""
                    }`}
                  >
                    <MousePointer className="w-4 h-4" />
                  </button>
                </Tooltip>
              )}

              <div className="w-px h-6 bg-border mx-1" />

              {/* Cell Selection Mode Toggle */}
              <Tooltip content="Cell Selection Mode - Click and drag to select cells for creating nested maps/environments">
                <button
                  onClick={() => {
                    if (selectionMode === "cell") {
                      setSelectionMode("placement");
                      clearCellSelection();
                    } else {
                      setSelectionMode("cell");
                    }
                  }}
                  className={`p-2 rounded transition-all border-2 ${
                    selectionMode === "cell"
                      ? "text-blue-400 bg-blue-400/20 border-blue-400/60"
                      : "text-text-muted hover:text-blue-400 hover:bg-deep border-transparent"
                  }`}
                >
                  <Square className="w-4 h-4" />
                </button>
              </Tooltip>

              {/* Placement Mode Toggle */}
              <Tooltip content="Placement Mode - Click on map to place items (props, landmarks, spawn points)">
                <button
                  onClick={() => setSelectionMode("placement")}
                  className={`p-2 rounded transition-all border-2 ${
                    selectionMode === "placement"
                      ? "text-ember-glow bg-ember-glow/20 border-ember-glow/60"
                      : "text-text-muted hover:text-ember-glow hover:bg-deep border-transparent"
                  }`}
                >
                  <MousePointer className="w-4 h-4" />
                </button>
              </Tooltip>

              <div className="w-px h-6 bg-border mx-1" />

              <Tooltip content="Zoom In - Increase zoom level (+ key)">
                <button
                  onClick={zoomIn}
                  className="p-2 rounded text-text-muted hover:text-ember-glow hover:bg-deep transition-all"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </Tooltip>
              
              <Tooltip content="Zoom Out - Decrease zoom level (- key)">
                <button
                  onClick={zoomOut}
                  className="p-2 rounded text-text-muted hover:text-ember-glow hover:bg-deep transition-all"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
              </Tooltip>
              
              <Tooltip content="Reset View - Reset zoom and pan to default (0 key)">
                <button
                  onClick={resetView}
                  className="p-2 rounded text-text-muted hover:text-ember-glow hover:bg-deep transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </Tooltip>
              
              <Tooltip content="Fit to Viewport - Fit entire map to viewport (F key)">
                <button
                  onClick={fitToViewport}
                  className="p-2 rounded text-text-muted hover:text-ember-glow hover:bg-deep transition-all"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </Tooltip>

              <div className="w-px h-6 bg-border mx-1" />

              {/* Display Visibility Dropdown */}
              <div className="relative">
                <Tooltip content="Toggle Info Displays - Show/hide information panels">
                  <button
                    className="p-2 rounded text-text-muted hover:text-ember-glow hover:bg-deep transition-all relative"
                    onClick={() => setShowDisplayDropdown(!showDisplayDropdown)}
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </Tooltip>
                {showDisplayDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowDisplayDropdown(false)}
                    />
                    <div className="absolute top-full right-0 mt-1 w-48 bg-shadow border border-border rounded-lg shadow-lg z-50 p-1">
                      <label className="flex items-center gap-2 px-3 py-2 hover:bg-deep rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showCellSelectionDisplay}
                          onChange={toggleCellSelectionDisplay}
                          className="rounded border-border"
                        />
                        <span className="text-sm text-text-primary">Cell Selection</span>
                      </label>
                      <label className="flex items-center gap-2 px-3 py-2 hover:bg-deep rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showMapCompletionDisplay}
                          onChange={toggleMapCompletionDisplay}
                          className="rounded border-border"
                        />
                        <span className="text-sm text-text-primary">Map Completion</span>
                      </label>
                      <label className="flex items-center gap-2 px-3 py-2 hover:bg-deep rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showRegions}
                          onChange={toggleRegions}
                          className="rounded border-border"
                        />
                        <span className="text-sm text-text-primary">Regions</span>
                      </label>
                    </div>
                  </>
                )}
              </div>

              <div className="w-px h-6 bg-border mx-1" />

              <Tooltip content="Copy Selected - Copy selected placements to clipboard (Ctrl+C)">
                <button
                  onClick={copySelected}
                  className="p-2 rounded text-text-muted hover:text-ember-glow hover:bg-deep transition-all"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </Tooltip>
              
              <Tooltip content="Paste - Paste copied placements at cursor position (Ctrl+V)">
                <button
                  onClick={() => paste()}
                  className="p-2 rounded text-text-muted hover:text-ember-glow hover:bg-deep transition-all"
                >
                  <ClipboardPaste className="w-4 h-4" />
                </button>
              </Tooltip>
              
              <Tooltip content="Delete Selected - Delete selected placements (Delete key)">
                <button
                  onClick={deleteSelectedPlacements}
                  className="p-2 rounded text-text-muted hover:text-red-400 hover:bg-deep transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Map Canvas with Context Menu */}
          <div ref={containerRef} className="flex-1 relative overflow-hidden min-h-[400px]">
        <ErrorBoundary
          fallback={
            <div className="flex items-center justify-center h-full bg-deep text-red-500">
              <div className="text-center">
                <p className="mb-2">Error loading map canvas</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-ember-glow text-black rounded"
                >
                  Reload
                </button>
              </div>
            </div>
          }
        >
          <ContextMenu.Root>
            <ContextMenu.Trigger asChild>
              <div className="w-full h-full">
                {dimensions.width > 0 && dimensions.height > 0 ? (
                  <MapCanvas width={dimensions.width} height={dimensions.height - 32} environments={environments} maps={maps} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full bg-deep text-text-muted gap-2">
                    <div className="w-8 h-8 border-4 border-ember border-t-transparent rounded-full animate-spin"></div>
                    <p>Initializing canvas...</p>
                    <p className="text-xs opacity-50">Container: {containerRef.current ? `${containerRef.current.clientWidth}×${containerRef.current.clientHeight}` : "not mounted"}</p>
                  </div>
                )}
              </div>
            </ContextMenu.Trigger>
          
          <ContextMenu.Portal>
            <ContextMenu.Content
              className="min-w-[200px] bg-shadow border border-border rounded-lg shadow-lg p-1 z-50"
            >
              <ContextMenu.Item
                className="px-3 py-2 text-sm text-text-primary rounded hover:bg-deep cursor-pointer flex items-center gap-2"
                onSelect={() => paste()}
              >
                <ClipboardPaste className="w-4 h-4" />
                Paste
              </ContextMenu.Item>
              
              <ContextMenu.Separator className="h-px bg-border my-1" />
              
              <ContextMenu.Item
                className="px-3 py-2 text-sm text-text-primary rounded hover:bg-deep cursor-pointer flex items-center gap-2"
                onSelect={zoomIn}
              >
                <ZoomIn className="w-4 h-4" />
                Zoom In
              </ContextMenu.Item>
              
              <ContextMenu.Item
                className="px-3 py-2 text-sm text-text-primary rounded hover:bg-deep cursor-pointer flex items-center gap-2"
                onSelect={zoomOut}
              >
                <ZoomOut className="w-4 h-4" />
                Zoom Out
              </ContextMenu.Item>
              
              <ContextMenu.Item
                className="px-3 py-2 text-sm text-text-primary rounded hover:bg-deep cursor-pointer flex items-center gap-2"
                onSelect={resetView}
              >
                <RotateCcw className="w-4 h-4" />
                Reset View
              </ContextMenu.Item>
              
              <ContextMenu.Separator className="h-px bg-border my-1" />
              
              <ContextMenu.Item
                className="px-3 py-2 text-sm text-text-primary rounded hover:bg-deep cursor-pointer flex items-center gap-2"
                onSelect={toggleGrid}
              >
                <Grid className="w-4 h-4" />
                {showGrid ? "Hide Grid" : "Show Grid"}
              </ContextMenu.Item>
              
              {showGrid && (
                <ContextMenu.Item
                  className="px-3 py-2 text-sm text-text-primary rounded hover:bg-deep cursor-pointer flex items-center gap-2"
                  onSelect={toggleSnap}
                >
                  <MousePointer className="w-4 h-4" />
                  {snapToGrid ? "Disable Snap" : "Enable Snap"}
                </ContextMenu.Item>
              )}
            </ContextMenu.Content>
          </ContextMenu.Portal>
        </ContextMenu.Root>
        </ErrorBoundary>
          </div>
        </div>
      )}

      {/* Create Environment Modal */}
      <Modal
        isOpen={showCreateEnvironmentModal}
        onClose={() => setShowCreateEnvironmentModal(false)}
        title="Create Environment"
        footer={
          <div className="flex gap-2">
            <button
              type="submit"
              form="environment-form"
              disabled={saving}
              className="px-4 py-2 bg-ember-glow text-black rounded font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Create Template"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateEnvironmentModal(false)}
              disabled={saving}
              className="px-4 py-2 bg-deep border border-border rounded text-text-primary hover:bg-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        }
      >
        <EnvironmentForm
          onSubmit={handleCreateEnvironment}
          onCancel={() => setShowCreateEnvironmentModal(false)}
          saving={saving}
        />
      </Modal>

      {/* Edit Environment Modal */}
      {selectedEnvironmentForEdit && (
        <Modal
          isOpen={showEditEnvironmentModal}
          onClose={() => {
            setShowEditEnvironmentModal(false);
            setSelectedEnvironmentForEdit(null);
          }}
          title={`Edit Environment: ${selectedEnvironmentForEdit.name}`}
          footer={
            <div className="flex gap-2">
              <button
                type="submit"
                form="environment-form"
                disabled={saving}
                className="px-4 py-2 bg-ember-glow text-black rounded font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Update Environment"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEditEnvironmentModal(false);
                  setSelectedEnvironmentForEdit(null);
                }}
                disabled={saving}
                className="px-4 py-2 bg-deep border border-border rounded text-text-primary hover:bg-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          }
        >
          <EnvironmentForm
            initialValues={selectedEnvironmentForEdit}
            isEdit={true}
            onSubmit={handleUpdateEnvironment}
            onCancel={() => {
              setShowEditEnvironmentModal(false);
              setSelectedEnvironmentForEdit(null);
            }}
            saving={saving}
          />
        </Modal>
      )}

      {/* Create World Region Modal */}
      <Modal
        isOpen={showCreateWorldRegionModal}
        onClose={() => setShowCreateWorldRegionModal(false)}
        title="Create World Region"
        footer={
          <div className="flex gap-2">
            <button
              type="submit"
              form="world-region-form"
              disabled={saving}
              className="px-4 py-2 bg-ember-glow text-black rounded font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Creating..." : "Create World Region"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateWorldRegionModal(false)}
              disabled={saving}
              className="px-4 py-2 bg-deep border border-border rounded text-text-primary hover:bg-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        }
      >
        <WorldRegionForm
          onSubmit={handleCreateWorldRegion}
          onCancel={() => setShowCreateWorldRegionModal(false)}
          saving={saving}
          existingEnvironments={environments}
        />
      </Modal>

      {/* Create Map Modal (for nested maps) */}
      <Modal
        isOpen={showCreateMapModal}
        onClose={() => setShowCreateMapModal(false)}
        title="Create New Map"
        footer={
          <div className="flex gap-2">
            <button
              type="submit"
              form="map-form"
              disabled={saving}
              className="px-4 py-2 bg-ember-glow text-black rounded font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Create Map"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateMapModal(false)}
              disabled={saving}
              className="px-4 py-2 bg-deep border border-border rounded text-text-primary hover:bg-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        }
      >
        <MapForm
          onSubmit={handleCreateMap}
          onCancel={() => setShowCreateMapModal(false)}
          saving={saving}
        />
      </Modal>

      {/* Edit Map Modal */}
      {selectedMapForEdit && (
        <Modal
          isOpen={showEditMapModal}
          onClose={() => {
            setShowEditMapModal(false);
            setSelectedMapForEdit(null);
          }}
          title={`Edit ${selectedMapForEdit.name}`}
          footer={
            <div className="flex gap-2">
              <button
                type="submit"
                form="map-form"
                disabled={saving}
                className="px-4 py-2 bg-ember-glow text-black rounded font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Update Map"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEditMapModal(false);
                  setSelectedMapForEdit(null);
                }}
                disabled={saving}
                className="px-4 py-2 bg-deep border border-border rounded text-text-primary hover:bg-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          }
        >
          <MapForm
            initialValues={selectedMapForEdit}
            isEdit={true}
            onSubmit={handleUpdateMap}
            onCancel={() => {
              setShowEditMapModal(false);
              setSelectedMapForEdit(null);
            }}
            saving={saving}
          />
        </Modal>
      )}
    </div>
  );
}

// Simple Error Boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("MapCanvas error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

