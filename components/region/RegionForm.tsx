// components/region/RegionForm.tsx
// Form for creating/editing regions (locations)

"use client";

import { useState, useRef, useEffect } from "react";
import { GridSelector } from "@components/ui/GridSelector";
import { MediaUpload, type MediaUploadRef } from "@components/ui/MediaUpload";

// Client-safe constants
const COLLECTIONS = {
    Locations: 'locations',
    Media: 'media',
} as const;

export interface RegionFormData {
    id?: string;
    name: string;
    description?: string;
    type?: "world" | "continent" | "region" | "city" | "district" | "building" | "room";
    parentLocation?: number; // Payload relationship ID
    level?: number;
    gridCells?: {
        minX?: number;
        minY?: number;
        width?: number;
        height?: number;
    };
    landmarkIcon?: number; // Payload media ID
    featuredImage?: number; // Payload media ID
    climate?: string;
    terrain?: string;
    population?: string;
}

interface RegionFormProps {
    initialValues?: Partial<RegionFormData>;
    isEdit?: boolean;
    onSubmit: (data: RegionFormData) => void;
    onCancel?: () => void;
    saving?: boolean;
    submitLabel?: string;
    projectId?: string; // For fetching parent regions
}

const REGION_TYPES = [
    { value: "world", label: "World" },
    { value: "continent", label: "Continent" },
    { value: "region", label: "Region" },
    { value: "city", label: "City" },
    { value: "district", label: "District" },
    { value: "building", label: "Building" },
    { value: "room", label: "Room" },
] as const;

export function RegionForm({
    initialValues = {},
    isEdit = false,
    onSubmit,
    onCancel,
    saving = false,
    submitLabel,
    projectId,
}: RegionFormProps) {
    const [name, setName] = useState(initialValues.name || "");
    const [description, setDescription] = useState(initialValues.description || "");
    const [type, setType] = useState<RegionFormData["type"]>(initialValues.type || "region");
    const [parentLocation, setParentLocation] = useState<number | undefined>(
        typeof initialValues.parentLocation === 'number' ? initialValues.parentLocation : undefined
    );
    const [level, setLevel] = useState(initialValues.level ?? (initialValues.parentLocation ? 1 : 0));
    const [minX, setMinX] = useState(initialValues.gridCells?.minX ?? 0);
    const [minY, setMinY] = useState(initialValues.gridCells?.minY ?? 0);
    const [width, setWidth] = useState(initialValues.gridCells?.width ?? 1);
    const [height, setHeight] = useState(initialValues.gridCells?.height ?? 1);
    const [landmarkIconId, setLandmarkIconId] = useState<number | undefined>(
        typeof initialValues.landmarkIcon === 'number'
            ? initialValues.landmarkIcon
            : typeof initialValues.landmarkIcon === 'object' && initialValues.landmarkIcon?.id
                ? initialValues.landmarkIcon.id
                : undefined
    );
    const [landmarkIconUrl, setLandmarkIconUrl] = useState<string | undefined>(undefined);
    const [featuredImageId, setFeaturedImageId] = useState<number | undefined>(
        typeof initialValues.featuredImage === 'number'
            ? initialValues.featuredImage
            : typeof initialValues.featuredImage === 'object' && initialValues.featuredImage?.id
                ? initialValues.featuredImage.id
                : undefined
    );
    const [featuredImageUrl, setFeaturedImageUrl] = useState<string | undefined>(undefined);
    const [climate, setClimate] = useState(initialValues.climate || "");
    const [terrain, setTerrain] = useState(initialValues.terrain || "");
    const [population, setPopulation] = useState(initialValues.population || "");
    const [parentRegions, setParentRegions] = useState<Array<{ id: number; name: string; level: number }>>([]);
    const [occupiedCells, setOccupiedCells] = useState<Set<string>>(new Set());
    const [gridValidationError, setGridValidationError] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const featuredImageUploadRef = useRef<MediaUploadRef>(null);
    const landmarkIconUploadRef = useRef<MediaUploadRef>(null);

    // Fetch parent regions and calculate occupied cells
    useEffect(() => {
        if (projectId) {
            fetch(`/api/payload/${COLLECTIONS.Locations}?where[project][equals]=${projectId}&limit=100`)
                .then(res => res.json())
                .then(data => {
                    const regions = data.docs?.map((doc: any) => ({
                        id: doc.id,
                        name: doc.name,
                        level: doc.level ?? 0,
                    })) || [];
                    setParentRegions(regions);

                    // Calculate occupied cells for regions with the same parent (or no parent if this is top-level)
                    const occupied = new Set<string>();
                    const currentParentId = parentLocation || null;
                    const currentEditId = isEdit ? (initialValues as any)?.id : null;

                    data.docs?.forEach((doc: any) => {
                        // Skip current region being edited
                        if (currentEditId && String(doc.id) === String(currentEditId)) return;

                        // Only check regions with the same parent
                        const docParentId = doc.parentLocation?.id || doc.parentLocation || null;
                        if (docParentId !== currentParentId) return;

                        // Add all cells for this region to occupied set
                        const gridCells = doc.gridCells;
                        if (gridCells?.minX !== undefined && gridCells?.minY !== undefined &&
                            gridCells?.width && gridCells?.height) {
                            for (let x = gridCells.minX; x < gridCells.minX + gridCells.width; x++) {
                                for (let y = gridCells.minY; y < gridCells.minY + gridCells.height; y++) {
                                    if (x >= 0 && x < 8 && y >= 0 && y < 8) {
                                        occupied.add(`${x},${y}`);
                                    }
                                }
                            }
                        }
                    });

                    setOccupiedCells(occupied);
                })
                .catch(err => console.error("Failed to fetch parent regions:", err));
        }
    }, [projectId, parentLocation, isEdit, initialValues]);

    // Auto-calculate level from parent
    useEffect(() => {
        if (parentLocation) {
            const parent = parentRegions.find(r => r.id === parentLocation);
            if (parent) {
                setLevel(parent.level + 1);
            }
        } else {
            setLevel(0);
        }
    }, [parentLocation, parentRegions]);

    // Fetch media URLs when editing (only on mount, not after uploads)
    useEffect(() => {
        if (landmarkIconId) {
            fetch(`/api/payload/${COLLECTIONS.Media}/${landmarkIconId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.url) {
                        // Normalize URL
                        const url = data.url;
                        if (url.startsWith('http://localhost') || url.startsWith('https://')) {
                            try {
                                const urlObj = new URL(url);
                                setLandmarkIconUrl(urlObj.pathname);
                            } catch {
                                setLandmarkIconUrl(url);
                            }
                        } else {
                            setLandmarkIconUrl(url.startsWith('/') ? url : `/${url}`);
                        }
                    }
                })
                .catch(err => console.error("Failed to fetch landmark icon:", err));
        } else {
            setLandmarkIconUrl(undefined);
        }
    }, [landmarkIconId]);

    useEffect(() => {
        if (featuredImageId) {
            fetch(`/api/payload/${COLLECTIONS.Media}/${featuredImageId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.url) {
                        // Normalize URL
                        const url = data.url;
                        if (url.startsWith('http://localhost') || url.startsWith('https://')) {
                            try {
                                const urlObj = new URL(url);
                                setFeaturedImageUrl(urlObj.pathname);
                            } catch {
                                setFeaturedImageUrl(url);
                            }
                        } else {
                            setFeaturedImageUrl(url.startsWith('/') ? url : `/${url}`);
                        }
                    }
                })
                .catch(err => console.error("Failed to fetch featured image:", err));
        } else {
            setFeaturedImageUrl(undefined);
        }
    }, [featuredImageId]);

    // Validate grid selection for overlaps
    const validateGridSelection = (): string | null => {
        // Check boundaries
        if (minX < 0 || minX > 7 || minY < 0 || minY > 7) {
            return "Cell coordinates must be between 0 and 7";
        }
        if (width < 1 || width > 8 || height < 1 || height > 8) {
            return "Width and height must be between 1 and 8";
        }
        if (minX + width > 8 || minY + height > 8) {
            return "Region extends beyond grid boundaries (8x8)";
        }

        // Check for overlaps with occupied cells
        const overlappingCells: string[] = [];
        for (let x = minX; x < minX + width; x++) {
            for (let y = minY; y < minY + height; y++) {
                const cellKey = `${x},${y}`;
                if (occupiedCells.has(cellKey)) {
                    overlappingCells.push(`(${x}, ${y})`);
                }
            }
        }

        if (overlappingCells.length > 0) {
            return `Selected cells overlap with existing regions: ${overlappingCells.slice(0, 5).join(", ")}${overlappingCells.length > 5 ? "..." : ""}`;
        }

        return null;
    };

    // Validate and prepare region data
    const prepareRegion = async (): Promise<RegionFormData | null> => {
        if (!name.trim()) {
            alert("Name is required");
            return null;
        }

        // Validate grid cells
        const gridError = validateGridSelection();
        if (gridError) {
            alert(gridError);
            setGridValidationError(gridError);
            return null;
        }
        setGridValidationError(null);

        // Upload pending images before submitting
        let finalFeaturedImageId = featuredImageId;
        let finalLandmarkIconId = landmarkIconId;

        try {
            if (featuredImageUploadRef.current) {
                const uploadedId = await featuredImageUploadRef.current.uploadFile();
                if (uploadedId) {
                    finalFeaturedImageId = uploadedId;
                }
            }
            if (landmarkIconUploadRef.current) {
                const uploadedId = await landmarkIconUploadRef.current.uploadFile();
                if (uploadedId) {
                    finalLandmarkIconId = uploadedId;
                }
            }
        } catch (error) {
            alert(`Failed to upload images: ${error instanceof Error ? error.message : "Unknown error"}`);
            return null;
        }

        return {
            name: name.trim(),
            description: description.trim() || undefined,
            type,
            parentLocation: parentLocation || undefined,
            level,
            gridCells: {
                minX,
                minY,
                width,
                height,
            },
            landmarkIcon: finalLandmarkIconId,
            featuredImage: finalFeaturedImageId,
            climate: climate.trim() || undefined,
            terrain: terrain.trim() || undefined,
            population: population.trim() || undefined,
        };
    };

    // Expose validation function for external submission (used by footer)
    useEffect(() => {
        if (formRef.current) {
            (formRef.current as any).validateAndSubmit = async () => {
                const region = await prepareRegion();
                if (region) {
                    onSubmit(region);
                }
            };
        }
    }, [name, description, type, parentLocation, level, minX, minY, width, height, landmarkIconId, featuredImageId, climate, terrain, population, onSubmit]);

    return (
        <form ref={formRef} className="space-y-4">
            {/* Region Image - Compact */}
            <div>
                <MediaUpload
                    ref={featuredImageUploadRef}
                    currentMediaId={featuredImageId}
                    currentMediaUrl={featuredImageUrl}
                    onMediaUploaded={(mediaId) => {
                        setFeaturedImageId(mediaId);
                        if (!mediaId) {
                            setFeaturedImageUrl(undefined);
                        }
                    }}
                    label="Region Image"
                    disabled={saving}
                    compact
                />
            </div>

            {/* Landmark Icon - Compact */}
            <div>
                <MediaUpload
                    ref={landmarkIconUploadRef}
                    currentMediaId={landmarkIconId}
                    currentMediaUrl={landmarkIconUrl}
                    onMediaUploaded={(mediaId) => {
                        setLandmarkIconId(mediaId);
                        if (!mediaId) {
                            setLandmarkIconUrl(undefined);
                        }
                    }}
                    label="Landmark Icon"
                    disabled={saving}
                    compact
                />
                <p className="text-xs text-text-muted mt-1">
                    Icon displayed on the map for this region
                </p>
            </div>

            <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">
                    Name <span className="text-ember">*</span>
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
                    placeholder="e.g., The Ember Wastes"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-1">
                        Type
                    </label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value as RegionFormData["type"])}
                        className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
                    >
                        {REGION_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-1">
                        Level
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={level}
                        onChange={(e) => setLevel(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
                        title="Hierarchy level (0 = world, 1 = continent, etc.)"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">
                    Parent Region
                </label>
                <select
                    value={parentLocation || ""}
                    onChange={(e) => setParentLocation(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
                >
                    <option value="">None (Top Level)</option>
                    {parentRegions
                        .filter(r => !isEdit || r.id !== (initialValues as any)?.id)
                        .map((region) => (
                            <option key={region.id} value={region.id}>
                                {region.name} (Level {region.level})
                            </option>
                        ))}
                </select>
                <p className="text-xs text-text-muted mt-1">
                    Select a parent region to create a nested/hierarchical structure
                </p>
            </div>

            <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">
                    Description
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary min-h-[80px]"
                    placeholder="A vast desert of crimson sand..."
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-1">
                        Climate
                    </label>
                    <input
                        type="text"
                        value={climate}
                        onChange={(e) => setClimate(e.target.value)}
                        className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
                        placeholder="e.g., Arid"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-1">
                        Terrain
                    </label>
                    <input
                        type="text"
                        value={terrain}
                        onChange={(e) => setTerrain(e.target.value)}
                        className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
                        placeholder="e.g., Desert"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">
                    Population
                </label>
                <input
                    type="text"
                    value={population}
                    onChange={(e) => setPopulation(e.target.value)}
                    className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
                    placeholder="e.g., Sparse nomadic tribes"
                />
            </div>

            {/* Grid Cell Coordinates */}
            <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-glow">Grid Placement (8×8 Grid)</h3>
                    {occupiedCells.size > 0 && (
                        <span className="text-xs text-text-muted">
                            {occupiedCells.size} cell{occupiedCells.size !== 1 ? 's' : ''} occupied
                        </span>
                    )}
                </div>
                <GridSelector
                    minX={minX}
                    minY={minY}
                    width={width}
                    height={height}
                    onSelectionChange={(newMinX, newMinY, newWidth, newHeight) => {
                        setMinX(newMinX);
                        setMinY(newMinY);
                        setWidth(newWidth);
                        setHeight(newHeight);
                        setGridValidationError(null); // Clear error on change
                    }}
                    disabled={saving}
                    gridSize={8}
                    occupiedCells={occupiedCells}
                    currentEditId={(initialValues as any)?.id}
                />
                {gridValidationError && (
                    <p className="text-xs text-red-400 mt-2">{gridValidationError}</p>
                )}
                <p className="text-xs text-text-muted mt-2">
                    Red cells are occupied. Select only vacant cells.
                </p>
            </div>


        </form>
    );
}

export function RegionFormFooter({
    isEdit,
    saving,
    submitLabel,
    onCancel,
    onSubmit,
}: {
    isEdit: boolean;
    saving: boolean;
    submitLabel?: string;
    onCancel?: () => void;
    onSubmit: () => void;
}) {
    const handleSubmit = async () => {
        // Find the form and call its validateAndSubmit method
        const form = document.querySelector('form') as HTMLFormElement & { validateAndSubmit?: () => Promise<void> };
        if (form?.validateAndSubmit) {
            await form.validateAndSubmit();
        } else {
            onSubmit();
        }
    };

    return (
        <div className="flex gap-3">
            <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-ember hover:bg-ember-dark text-white rounded-lg font-semibold disabled:opacity-50"
            >
                {saving ? "Saving..." : submitLabel || (isEdit ? "Update Region" : "Create Region")}
            </button>
            {onCancel && (
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={saving}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold disabled:opacity-50"
                >
                    Cancel
                </button>
            )}
        </div>
    );
}

