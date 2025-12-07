// components/environment/MapForm.tsx
// Form for creating/editing maps

"use client";

import { useState, useEffect, useMemo } from "react";
import { IdInput } from "@/components/ui/IdInput";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { environmentClient } from "@/lib/api/clients";
import type { MapDefinition } from "@/lib/data/maps";
import type { CoordinateSystemConfig } from "@/lib/utils/coordinateSystem";
import { Info, AlertTriangle, CheckCircle2 } from "lucide-react";

interface MapFormProps {
  initialValues?: MapDefinition;
  isEdit?: boolean;
  onSubmit: (map: MapDefinition) => void;
  onCancel: () => void;
  saving: boolean;
}

export function MapForm({
  initialValues,
  isEdit = false,
  onSubmit,
  onCancel,
  saving,
}: MapFormProps) {
  const [id, setId] = useState(initialValues?.id || "");
  const [name, setName] = useState(initialValues?.name || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [environmentId, setEnvironmentId] = useState(initialValues?.environmentId || "");
  const [imagePath, setImagePath] = useState(initialValues?.imagePath || "");
  const [environments, setEnvironments] = useState<Array<{ id: string; name: string }>>([]);
  const [imageWidth, setImageWidth] = useState(initialValues?.coordinateConfig?.imageWidth || 1000);
  const [imageHeight, setImageHeight] = useState(initialValues?.coordinateConfig?.imageHeight || 1000);
  const [uploadedImageWidth, setUploadedImageWidth] = useState<number | null>(null);
  const [uploadedImageHeight, setUploadedImageHeight] = useState<number | null>(null);
  const [unrealWidth, setUnrealWidth] = useState(initialValues?.coordinateConfig?.unrealWidth || 12000);
  const [unrealHeight, setUnrealHeight] = useState(initialValues?.coordinateConfig?.unrealHeight || 12000);
  const [baseCellSize, setBaseCellSize] = useState(initialValues?.coordinateConfig?.baseCellSize || 10);
  const [zoneSize, setZoneSize] = useState(initialValues?.coordinateConfig?.zoneSize || 10);
  const [mapType, setMapType] = useState<"world" | "town" | "dungeon" | "shop" | "custom">("custom");

  // Map type presets using standardized sizing (aligned with MapLevel enum)
  // These match the standards in MAP_SIZING_STANDARDS.md
  const mapPresets = {
    world: {
      name: "World Map (Elden Ring scale)",
      imageWidth: 4096,
      imageHeight: 4096,
      unrealWidth: 12000, // 12km - standardized
      unrealHeight: 12000,
      baseCellSize: 16, // Standardized: 16px cells → ~47m × 47m in Unreal
      zoneSize: 16, // Standardized: 16 cells per zone → ~750m × 750m
      description: "Massive overworld map. Cell size: ~47m × 47m. Use for huge 3D models (entire towns). Recommended: 4096x4096px or 8192x8192px",
    },
    town: {
      name: "Town/Region",
      imageWidth: 2048,
      imageHeight: 2048,
      unrealWidth: 2000, // 2km - standardized
      unrealHeight: 2000,
      baseCellSize: 10, // Standardized: 10px cells → ~9.8m × 9.8m in Unreal
      zoneSize: 10, // Standardized: 10 cells per zone → ~98m × 98m
      description: "Medium-sized area. Cell size: ~9.8m × 9.8m. Use for buildings, districts. Recommended: 2048x2048px or 4096x4096px",
    },
    dungeon: {
      name: "Dungeon/Interior",
      imageWidth: 1024,
      imageHeight: 1024,
      unrealWidth: 500, // 500m - standardized
      unrealHeight: 500,
      baseCellSize: 8, // Standardized: 8px cells → ~3.9m × 3.9m in Unreal
      zoneSize: 8, // Standardized: 8 cells per zone → ~31m × 31m
      description: "Smaller interior space. Cell size: ~3.9m × 3.9m. Use for furniture, props. Recommended: 1024x1024px or 2048x2048px",
    },
    shop: {
      name: "Shop/Building",
      imageWidth: 512,
      imageHeight: 512,
      unrealWidth: 100, // 100m - standardized
      unrealHeight: 100,
      baseCellSize: 5, // Standardized: 5px cells → ~0.98m × 0.98m in Unreal
      zoneSize: 5, // Standardized: 5 cells per zone → ~4.9m × 4.9m
      description: "Small building interior. Cell size: ~0.98m × 0.98m. Use for precise 3D prop placement. Recommended: 512x512px or 1024x1024px",
    },
    custom: {
      name: "Custom",
      imageWidth: 1000,
      imageHeight: 1000,
      unrealWidth: 12000,
      unrealHeight: 12000,
      baseCellSize: 10,
      zoneSize: 10,
      description: "Custom configuration (not recommended - use presets for proper scaling)",
    },
  };

  // Analyze image dimensions against recommendations
  const imageAnalysis = useMemo(() => {
    if (!uploadedImageWidth || !uploadedImageHeight || mapType === "custom") {
      return null;
    }

    const preset = mapPresets[mapType];
    const recommendedWidth = preset.imageWidth;
    const recommendedHeight = preset.imageHeight;
    
    // Calculate if image matches recommendations
    // Allow ±25% tolerance
    const tolerance = 0.25;
    const widthMatch = 
      uploadedImageWidth >= recommendedWidth * (1 - tolerance) &&
      uploadedImageWidth <= recommendedWidth * (1 + tolerance);
    const heightMatch = 
      uploadedImageHeight >= recommendedHeight * (1 - tolerance) &&
      uploadedImageHeight <= recommendedHeight * (1 + tolerance);
    
    // Check if image is significantly larger (good for detail)
    const isLarger = uploadedImageWidth >= recommendedWidth * 1.5 || 
                     uploadedImageHeight >= recommendedHeight * 1.5;
    
    // Check if image is significantly smaller (may lose detail)
    const isSmaller = uploadedImageWidth <= recommendedWidth * 0.5 || 
                      uploadedImageHeight <= recommendedHeight * 0.5;
    
    let status: "good" | "warning" | "error" = "good";
    let message = "";
    
    if (widthMatch && heightMatch) {
      status = "good";
      message = `Image dimensions match recommended size (${recommendedWidth}×${recommendedHeight}px)`;
    } else if (isLarger) {
      status = "good";
      message = `Image is larger than recommended (${recommendedWidth}×${recommendedHeight}px). Great for detail!`;
    } else if (isSmaller) {
      status = "error";
      message = `Image is smaller than recommended (${recommendedWidth}×${recommendedHeight}px). May lose detail at high zoom.`;
    } else {
      status = "warning";
      const widthDiff = ((uploadedImageWidth - recommendedWidth) / recommendedWidth * 100).toFixed(0);
      const heightDiff = ((uploadedImageHeight - recommendedHeight) / recommendedHeight * 100).toFixed(0);
      message = `Image dimensions (${uploadedImageWidth}×${uploadedImageHeight}px) differ from recommended (${recommendedWidth}×${recommendedHeight}px). ${widthDiff}% width, ${heightDiff}% height difference.`;
    }
    
    return {
      status,
      message,
      uploadedWidth: uploadedImageWidth,
      uploadedHeight: uploadedImageHeight,
      recommendedWidth,
      recommendedHeight,
    };
  }, [uploadedImageWidth, uploadedImageHeight, mapType]);

  // Calculate cells and zones
  const mapStats = useMemo(() => {
    if (!imageWidth || !imageHeight || !baseCellSize || !zoneSize) {
      return null;
    }

    const cellsX = Math.floor(imageWidth / baseCellSize);
    const cellsY = Math.floor(imageHeight / baseCellSize);
    const totalCells = cellsX * cellsY;

    const zonesX = Math.floor(cellsX / zoneSize);
    const zonesY = Math.floor(cellsY / zoneSize);
    const totalZones = zonesX * zonesY;

    const cellSizeInUnreal = {
      width: (unrealWidth / imageWidth) * baseCellSize,
      height: (unrealHeight / imageHeight) * baseCellSize,
    };

    const zoneSizeInUnreal = {
      width: cellSizeInUnreal.width * zoneSize,
      height: cellSizeInUnreal.height * zoneSize,
    };

    return {
      cellsX,
      cellsY,
      totalCells,
      zonesX,
      zonesY,
      totalZones,
      cellSizeInUnreal,
      zoneSizeInUnreal,
    };
  }, [imageWidth, imageHeight, baseCellSize, zoneSize, unrealWidth, unrealHeight]);

  // Apply preset when map type changes
  useEffect(() => {
    if (mapType !== "custom" && !isEdit) {
      const preset = mapPresets[mapType];
      setImageWidth(preset.imageWidth);
      setImageHeight(preset.imageHeight);
      setUnrealWidth(preset.unrealWidth);
      setUnrealHeight(preset.unrealHeight);
      setBaseCellSize(preset.baseCellSize);
      setZoneSize(preset.zoneSize);
    }
  }, [mapType, isEdit]);

  useEffect(() => {
    async function loadEnvironments() {
      try {
        const envs = await environmentClient.list();
        setEnvironments(envs.map((e) => ({ id: e.id, name: e.name })));
      } catch (error) {
        console.error("Failed to load environments:", error);
      }
    }
    loadEnvironments();
  }, []);

  // Analyze existing image dimensions on load
  useEffect(() => {
    if (imagePath && !uploadedImageWidth && !uploadedImageHeight) {
      const img = document.createElement("img");
      img.onload = () => {
        setUploadedImageWidth(img.naturalWidth);
        setUploadedImageHeight(img.naturalHeight);
      };
      img.src = imagePath;
    }
  }, [imagePath, uploadedImageWidth, uploadedImageHeight]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const coordinateConfig: CoordinateSystemConfig = {
      imageWidth,
      imageHeight,
      unrealWidth,
      unrealHeight,
      baseCellSize,
      zoneSize,
    };

    const map: MapDefinition = {
      id,
      name,
      description,
      environmentId,
      imagePath: imagePath || undefined,
      coordinateConfig,
      sceneIds: initialValues?.sceneIds || [],
      connections: initialValues?.connections || [],
      environmentalModifiers: initialValues?.environmentalModifiers,
    };

    onSubmit(map);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" id="map-form">
      <IdInput
        value={id}
        onChange={setId}
        contentType="maps"
        isEdit={isEdit}
        autoGenerateFrom={name}
        placeholder="e.g., world-map"
        label="Map ID"
        disabled={saving}
      />

      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1">
          Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
          placeholder="e.g., World Map"
          required
          disabled={saving}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1">
          Description *
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary min-h-[80px]"
          placeholder="Describe this map..."
          required
          disabled={saving}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1">
          Environment *
        </label>
        <select
          value={environmentId}
          onChange={(e) => setEnvironmentId(e.target.value)}
          className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
          required
          disabled={saving}
        >
          <option value="">Select an environment...</option>
          {environments.map((env) => (
            <option key={env.id} value={env.id}>
              {env.name}
            </option>
          ))}
        </select>
      </div>

      <ImageUpload
        currentImagePath={imagePath}
        contentType="maps"
        entityId={id || "new"}
        onImageUploaded={setImagePath}
        onImageDimensions={(width, height) => {
          setUploadedImageWidth(width);
          setUploadedImageHeight(height);
          // Auto-fill dimensions if not set
          if (!imageWidth || imageWidth === 1000) {
            setImageWidth(width);
          }
          if (!imageHeight || imageHeight === 1000) {
            setImageHeight(height);
          }
        }}
        label="Map Image"
        disabled={saving}
      />

      {/* Image Analysis */}
      {imageAnalysis && (
        <div className={`p-3 rounded border ${
          imageAnalysis.status === "good"
            ? "bg-emerald-500/10 border-emerald-500/30"
            : imageAnalysis.status === "warning"
            ? "bg-amber-500/10 border-amber-500/30"
            : "bg-red-500/10 border-red-500/30"
        }`}>
          <div className="flex items-start gap-2">
            {imageAnalysis.status === "good" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            ) : imageAnalysis.status === "warning" ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-semibold ${
                imageAnalysis.status === "good"
                  ? "text-emerald-300"
                  : imageAnalysis.status === "warning"
                  ? "text-amber-300"
                  : "text-red-300"
              }`}>
                Image Analysis
              </p>
              <p className="text-xs text-text-secondary mt-1">
                {imageAnalysis.message}
              </p>
              <div className="mt-2 text-xs text-text-muted space-y-1">
                <div>
                  <span className="font-mono">Uploaded:</span> {imageAnalysis.uploadedWidth} × {imageAnalysis.uploadedHeight}px
                </div>
                <div>
                  <span className="font-mono">Recommended:</span> {imageAnalysis.recommendedWidth} × {imageAnalysis.recommendedHeight}px
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-text-primary">Coordinate System</h3>
          {!isEdit && (
            <select
              value={mapType}
              onChange={(e) => setMapType(e.target.value as typeof mapType)}
              className="px-3 py-1.5 bg-deep border border-border rounded text-text-primary text-sm"
            >
              {Object.entries(mapPresets).map(([key, preset]) => (
                <option key={key} value={key}>
                  {preset.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {mapType !== "custom" && !isEdit && (
          <div className="mb-4 p-3 bg-deep/50 border border-border rounded text-sm text-text-secondary">
            <p>{mapPresets[mapType].description}</p>
          </div>
        )}

        {/* Map Statistics */}
        {mapStats && (
          <div className="mb-4 p-4 bg-deep/30 border border-border rounded">
            <div className="flex items-start gap-2 mb-2">
              <Info className="w-4 h-4 text-ember-glow mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-primary mb-2">Map Grid Statistics</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-text-muted">Total Cells: </span>
                    <span className="text-text-primary font-mono font-semibold">
                      {mapStats.totalCells.toLocaleString()}
                    </span>
                    <span className="text-text-muted ml-1">
                      ({mapStats.cellsX} × {mapStats.cellsY})
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted">Total Zones: </span>
                    <span className="text-text-primary font-mono font-semibold">
                      {mapStats.totalZones.toLocaleString()}
                    </span>
                    <span className="text-text-muted ml-1">
                      ({mapStats.zonesX} × {mapStats.zonesY})
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted">Cell Size (Unreal): </span>
                    <span className="text-text-primary font-mono">
                      {mapStats.cellSizeInUnreal.width.toFixed(1)}m × {mapStats.cellSizeInUnreal.height.toFixed(1)}m
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted">Zone Size (Unreal): </span>
                    <span className="text-text-primary font-mono">
                      {mapStats.zoneSizeInUnreal.width.toFixed(1)}m × {mapStats.zoneSizeInUnreal.height.toFixed(1)}m
                    </span>
                  </div>
                </div>
                <p className="text-xs text-text-muted mt-2">
                  <strong>Cells</strong> are the base grid units ({baseCellSize}px each). 
                  <strong> Zones</strong> are groups of {zoneSize}×{zoneSize} cells used for large-area placement.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Image Width (px) *
            </label>
            <input
              type="number"
              value={imageWidth}
              onChange={(e) => setImageWidth(Number(e.target.value))}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              required
              min={1}
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Image Height (px) *
            </label>
            <input
              type="number"
              value={imageHeight}
              onChange={(e) => setImageHeight(Number(e.target.value))}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              required
              min={1}
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Unreal Width (units) *
            </label>
            <input
              type="number"
              value={unrealWidth}
              onChange={(e) => setUnrealWidth(Number(e.target.value))}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              required
              min={1}
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Unreal Height (units) *
            </label>
            <input
              type="number"
              value={unrealHeight}
              onChange={(e) => setUnrealHeight(Number(e.target.value))}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              required
              min={1}
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Base Cell Size (px) *
            </label>
            <input
              type="number"
              value={baseCellSize}
              onChange={(e) => setBaseCellSize(Number(e.target.value))}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              required
              min={1}
              disabled={saving}
            />
            <p className="text-xs text-text-muted mt-1">
              Pixels per cell. Smaller = finer grid
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Zone Size (cells) *
            </label>
            <input
              type="number"
              value={zoneSize}
              onChange={(e) => setZoneSize(Number(e.target.value))}
              className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
              required
              min={1}
              disabled={saving}
            />
            <p className="text-xs text-text-muted mt-1">
              Cells per zone. Zones group cells for large placements
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}

