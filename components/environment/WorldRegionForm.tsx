// components/environment/WorldRegionForm.tsx
// Form for creating a World Region (creates environment + map + region together)

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { IdInput } from "@/components/ui/IdInput";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { SearchableCombobox } from "@/components/ui/SearchableCombobox";
import { environmentClient } from "@/lib/api/clients";
import type { EnvironmentDefinition } from "@/lib/data/environments";
import type { MapDefinition } from "@/lib/data/maps";
import type { MapRegion } from "@/lib/data/mapRegions";
import type { CoordinateSystemConfig } from "@/lib/utils/coordinateSystem";
import { Info, AlertTriangle, CheckCircle2, Plus, X } from "lucide-react";

interface WorldRegionFormProps {
  onSubmit: (data: { environment: EnvironmentDefinition; map: MapDefinition; region: MapRegion }) => void;
  onCancel: () => void;
  saving: boolean;
  existingEnvironments?: EnvironmentDefinition[];
}

export function WorldRegionForm({
  onSubmit,
  onCancel,
  saving,
  existingEnvironments = [],
}: WorldRegionFormProps) {
  // Region/Environment shared fields
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imagePath, setImagePath] = useState("");
  
  // Environment selection
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string | null>(null);
  const [showCreateEnvironment, setShowCreateEnvironment] = useState(false);
  const [environments, setEnvironments] = useState<EnvironmentDefinition[]>(existingEnvironments);
  
  // New environment fields (for inline creation)
  const [newEnvId, setNewEnvId] = useState("");
  const [newEnvName, setNewEnvName] = useState("");
  const [newEnvBiome, setNewEnvBiome] = useState("Plains");
  const [newEnvClimate, setNewEnvClimate] = useState("Temperate");
  const [newEnvDangerLevel, setNewEnvDangerLevel] = useState(0);
  
  // Map-specific fields
  const [uploadedImageWidth, setUploadedImageWidth] = useState<number | null>(null);
  const [uploadedImageHeight, setUploadedImageHeight] = useState<number | null>(null);
  const [unrealWidth, setUnrealWidth] = useState(12000);
  const [unrealHeight, setUnrealHeight] = useState(12000);
  const [baseCellSize, setBaseCellSize] = useState(16);
  const [zoneSize, setZoneSize] = useState(16);
  
  // No auto-creation - user must select or create an environment

  // Auto-generate ID from name (debounced to prevent lag)
  const idGenerationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    // Clear any pending ID generation
    if (idGenerationTimeoutRef.current) {
      clearTimeout(idGenerationTimeoutRef.current);
    }

    // Only auto-generate if name exists and id is empty
    if (name && !id) {
      // Debounce ID generation to prevent lag while typing
      idGenerationTimeoutRef.current = setTimeout(() => {
        const generatedId = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        setId(generatedId);
      }, 300); // 300ms debounce
    }

    return () => {
      if (idGenerationTimeoutRef.current) {
        clearTimeout(idGenerationTimeoutRef.current);
      }
    };
  }, [name, id]);

  // Image dimensions are read-only (from uploaded image)
  const imageWidth = uploadedImageWidth || 4096;
  const imageHeight = uploadedImageHeight || 4096;

  const handleImageUploaded = (path: string) => {
    setImagePath(path);
  };

  const handleImageDimensions = (width: number, height: number) => {
    setUploadedImageWidth(width);
    setUploadedImageHeight(height);
  };
  
  const handleCreateNewEnvironment = async () => {
    if (!newEnvId || !newEnvName) {
      alert("Please enter an ID and name for the new environment");
      return;
    }
    
    try {
      const newEnv: EnvironmentDefinition = {
        id: newEnvId,
        name: newEnvName,
        description: `Environment for ${newEnvName}`,
        mapIds: [],
        storyIds: [],
        metadata: {
          biome: newEnvBiome,
          climate: newEnvClimate,
          dangerLevel: newEnvDangerLevel,
        },
      };
      
      // Save to database
      await environmentClient.create(newEnv);
      
      // Add to local list and select it
      setEnvironments([...environments, newEnv]);
      setSelectedEnvironmentId(newEnv.id);
      setShowCreateEnvironment(false);
      
      // Reset form
      setNewEnvId("");
      setNewEnvName("");
      setNewEnvBiome("Plains");
      setNewEnvClimate("Temperate");
      setNewEnvDangerLevel(0);
    } catch (error) {
      console.error("Failed to create environment:", error);
      alert("Failed to create environment. Please try again.");
    }
  };

  // Memoize ID onChange to prevent unnecessary re-renders
  const handleIdChange = useCallback((newId: string) => {
    setId(newId);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !name || !imagePath) {
      alert("Please fill in all required fields (ID, Name, and Map Image)");
      return;
    }
    
    if (!selectedEnvironmentId) {
      alert("Please select or create an environment");
      return;
    }

    // Get selected environment
    const environment = environments.find(e => e.id === selectedEnvironmentId);
    if (!environment) {
      alert("Selected environment not found");
      return;
    }

    // Create map
    const coordinateConfig: CoordinateSystemConfig = {
      imageWidth,
      imageHeight,
      unrealWidth,
      unrealHeight,
      baseCellSize,
      zoneSize,
    };

    const map: MapDefinition = {
      id: `${id}-map`,
      environmentId: environment.id,
      name: `${name} Map`,
      description: description || `Map for ${name}`,
      imagePath,
      coordinateConfig,
      sceneIds: [],
      connections: [],
      environmentalModifiers: [],
    };

    // Create region (base region covering entire map)
    const totalCellsX = Math.floor(imageWidth / baseCellSize);
    const totalCellsY = Math.floor(imageHeight / baseCellSize);
    const allCells: Array<{ cellX: number; cellY: number }> = [];
    for (let y = 0; y < totalCellsY; y++) {
      for (let x = 0; x < totalCellsX; x++) {
        allCells.push({ cellX: x, cellY: y });
      }
    }

    const { generateRegionColor } = require("@/lib/data/mapRegions");
    const region: MapRegion = {
      id: `${id}-region`,
      mapId: map.id,
      name: "Base Region",
      description: `Base region for ${name}`,
      cells: allCells,
      environmentId: environment.id,
      color: generateRegionColor(`${id}-region`),
      metadata: {},
    };

    onSubmit({ environment, map, region });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" id="world-region-form">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">World Region Details</h3>
        
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Region Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              e.stopPropagation();
              setName(e.target.value);
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
            placeholder="e.g., World, Kingdom of Huld"
            className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
            required
            autoFocus
          />
          <p className="mt-1 text-xs text-text-muted">
            This will be used for the region, map, and environment names
          </p>
        </div>

        <IdInput
          label="Region ID"
          value={id}
          onChange={handleIdChange}
          placeholder="Auto-generated from name"
          contentType="maps"
        />

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe this world region..."
            rows={3}
            className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Environment <span className="text-red-400">*</span></h3>
          <div className="flex items-start gap-2">
            <div className="flex-1">
              {!showCreateEnvironment ? (
                <SearchableCombobox
                  options={environments.map(env => ({
                    value: env.id,
                    label: env.name,
                    description: `${env.metadata.biome} • ${env.metadata.climate} • Danger: ${env.metadata.dangerLevel}`,
                  }))}
                  value={selectedEnvironmentId}
                  onChange={setSelectedEnvironmentId}
                  placeholder={environments.length === 0 ? "No environments available. Click + to create one." : "Select environment..."}
                  searchPlaceholder="Search environments..."
                  disabled={saving}
                />
              ) : (
                <div className="p-4 bg-void/50 border border-border rounded space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-text-primary">Create New Environment</h4>
                    <button
                      type="button"
                      onClick={() => setShowCreateEnvironment(false)}
                      className="p-1 rounded hover:bg-shadow text-text-muted hover:text-text-primary"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Environment ID <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newEnvId}
                      onChange={(e) => setNewEnvId(e.target.value)}
                      placeholder="e.g., frozen-loom"
                      className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Environment Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newEnvName}
                      onChange={(e) => setNewEnvName(e.target.value)}
                      placeholder="e.g., Frozen Loom"
                      className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Biome
                    </label>
                    <select
                      value={newEnvBiome}
                      onChange={(e) => setNewEnvBiome(e.target.value)}
                      className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
                    >
                      <option value="Plains">Plains</option>
                      <option value="Forest">Forest</option>
                      <option value="Mountain">Mountain</option>
                      <option value="Desert">Desert</option>
                      <option value="Swamp">Swamp</option>
                      <option value="Coast">Coast</option>
                      <option value="Interior">Interior</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Climate
                    </label>
                    <select
                      value={newEnvClimate}
                      onChange={(e) => setNewEnvClimate(e.target.value)}
                      className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
                    >
                      <option value="Temperate">Temperate</option>
                      <option value="Cold">Cold</option>
                      <option value="Warm">Warm</option>
                      <option value="Humid">Humid</option>
                      <option value="Arid">Arid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Danger Level (0-5)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      value={newEnvDangerLevel}
                      onChange={(e) => setNewEnvDangerLevel(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleCreateNewEnvironment}
                    disabled={!newEnvId || !newEnvName || saving}
                    className="w-full px-4 py-2 bg-ember-glow text-black rounded font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Environment
                  </button>
                </div>
              )}
            </div>
            {!showCreateEnvironment && (
              <button
                type="button"
                onClick={() => setShowCreateEnvironment(true)}
                className="flex items-center justify-center w-10 h-10 bg-deep border border-border rounded hover:bg-shadow text-text-primary transition-colors flex-shrink-0"
                title="Create new environment"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">Map Image <span className="text-red-400">*</span></h3>
        
        <ImageUpload
          currentImagePath={imagePath}
          contentType="maps"
          entityId={id || "new-world-region"}
          onImageUploaded={handleImageUploaded}
          onImageDimensions={handleImageDimensions}
          label="World Map Image"
          disabled={saving}
        />

        {imagePath && uploadedImageWidth && uploadedImageHeight && (
          <div className="p-3 bg-void/50 border border-border rounded text-xs">
            <div className="flex items-center gap-2 text-text-muted">
              <Info className="w-4 h-4" />
              <span>
                Image: {uploadedImageWidth}×{uploadedImageHeight}px
                <span className="ml-2">
                  → {Math.floor(uploadedImageWidth / baseCellSize)}×{Math.floor(uploadedImageHeight / baseCellSize)} cells
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">World Map Configuration</h3>
        
        {imagePath && uploadedImageWidth && uploadedImageHeight ? (
          <div className="p-3 bg-void/50 border border-border rounded text-xs space-y-2">
            <div className="flex items-center gap-2 text-text-muted">
              <Info className="w-4 h-4" />
              <span>Image Dimensions: {uploadedImageWidth}×{uploadedImageHeight}px (read-only)</span>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-void/50 border border-border rounded text-xs">
            <div className="flex items-center gap-2 text-text-muted">
              <Info className="w-4 h-4" />
              <span>Upload a map image to see dimensions</span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              World Width (meters) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={unrealWidth}
              onChange={(e) => setUnrealWidth(parseInt(e.target.value) || 12000)}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              min="100"
              step="100"
              required
            />
            <p className="mt-1 text-xs text-text-muted">
              Total world width in Unreal Engine meters (e.g., 12000 = 12km)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              World Height (meters) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={unrealHeight}
              onChange={(e) => setUnrealHeight(parseInt(e.target.value) || 12000)}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              min="100"
              step="100"
              required
            />
            <p className="mt-1 text-xs text-text-muted">
              Total world height in Unreal Engine meters (e.g., 12000 = 12km)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Cell Size (pixels) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={baseCellSize}
              onChange={(e) => setBaseCellSize(parseInt(e.target.value) || 16)}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              min="1"
              required
            />
            <p className="mt-1 text-xs text-text-muted">
              Size of each cell in pixels (e.g., 16px = 16×16 pixel cells)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Zone Size (cells)
            </label>
            <input
              type="number"
              value={zoneSize}
              onChange={(e) => setZoneSize(parseInt(e.target.value) || 16)}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              min="1"
            />
            <p className="mt-1 text-xs text-text-muted">
              Number of cells per zone (for performance optimization)
            </p>
          </div>
        </div>

        {imagePath && uploadedImageWidth && uploadedImageHeight && (
          <div className="p-3 bg-void/50 border border-border rounded text-xs">
            <div className="flex items-start gap-2 text-text-muted">
              <Info className="w-4 h-4 mt-0.5" />
              <div className="space-y-1">
                <p>
                  <strong>World Region:</strong> {unrealWidth / 1000}km × {unrealHeight / 1000}km
                </p>
                <p>
                  <strong>Grid:</strong> {Math.floor(uploadedImageWidth / baseCellSize)}×{Math.floor(uploadedImageHeight / baseCellSize)} cells
                </p>
                <p>
                  <strong>Cell Size in World:</strong> ~{Math.round((unrealWidth / Math.floor(uploadedImageWidth / baseCellSize)) * 100) / 100}m × ~{Math.round((unrealHeight / Math.floor(uploadedImageHeight / baseCellSize)) * 100) / 100}m per cell
                </p>
                <p className="mt-2 text-text-secondary">
                  When you create regions on this map, they will represent smaller areas within this {unrealWidth / 1000}km × {unrealHeight / 1000}km world.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}

