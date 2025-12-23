// components/region/RegionForm.tsx
// Form for creating/editing regions (locations) with React Hook Form

"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { GridSelector } from "@components/ui/GridSelector";
import { MediaUpload, type MediaUploadRef } from "@components/ui/MediaUpload";
import { BasicInfoSection } from "@components/ui/BasicInfoSection";
import { useIdValidation } from "@/lib/hooks/useIdValidation";
import { MapPin, User, Save, X } from "lucide-react";

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
    editEntryId?: number;
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

// Validation schema
const regionSchema = z.object({
    id: z.string().min(1, "ID is required").regex(/^[a-z0-9_-]+$/, "ID must be lowercase letters, numbers, underscores, and hyphens only"),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional().default(""),
    type: z.enum(["world", "continent", "region", "city", "district", "building", "room"]).default("region"),
    parentLocation: z.number().optional(),
    level: z.number().min(0).default(0),
    climate: z.string().optional(),
    terrain: z.string().optional(),
    population: z.string().optional(),
    imageMediaId: z.number().optional(),
    landmarkIconMediaId: z.number().optional(),
});

type RegionFormDataInput = z.infer<typeof regionSchema>;

// Helper to convert name to ID
function nameToId(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

// Check ID uniqueness
async function checkIdUniqueness(
    id: string,
    projectId?: string,
    excludeId?: number
): Promise<{ isUnique: boolean; error?: string }> {
    if (!id.trim()) {
        return { isUnique: true };
    }

    const normalizedId = id.trim().toLowerCase();

    try {
        const queryParts: string[] = [];
        queryParts.push(`where[slug][equals]=${encodeURIComponent(normalizedId)}`);
        
        if (projectId) {
            const projectIdNum = typeof projectId === 'string' ? parseInt(projectId, 10) : projectId;
            if (!isNaN(projectIdNum)) {
                queryParts.push(`where[project][equals]=${projectIdNum}`);
            }
        }
        
        if (excludeId) {
            queryParts.push(`where[id][not_equals]=${excludeId}`);
        }
        
        queryParts.push('limit=1');
        
        const queryString = queryParts.join('&');
        const url = `/api/payload/locations?${queryString}`;
        
        const res = await fetch(url);
        
        if (!res.ok) {
            return { isUnique: true };
        }
        
        const data = await res.json();
        const docs = data.docs || data.results || (Array.isArray(data) ? data : []);
        
        if (!Array.isArray(docs) || docs.length === 0) {
            return { isUnique: true };
        }
        
        const matchingDoc = docs.find((doc: any) => {
            const docSlug = doc.slug?.toLowerCase()?.trim();
            return docSlug === normalizedId;
        });
        
        if (matchingDoc) {
            return { 
                isUnique: false, 
                error: `A region with ID "${id}" already exists${projectId ? ' in this project' : ''}. Please choose a different ID.` 
            };
        }
        
        return { isUnique: true };
    } catch (error) {
        console.error("Error checking ID uniqueness:", error);
        return { isUnique: true };
    }
}

// Form sections for sidebar navigation
type FormSection = "basic" | "properties" | "grid";

// Get form sections
const getFormSections = (): Array<{ id: FormSection; label: string; icon: typeof User }> => {
    return [
        { id: "basic", label: "Basic Info", icon: User },
        { id: "properties", label: "Region Properties", icon: MapPin },
        { id: "grid", label: "Grid Placement", icon: MapPin },
    ];
};

export function RegionForm({
    initialValues = {},
    isEdit = false,
    onSubmit,
    onCancel,
    saving = false,
    submitLabel,
    projectId,
    editEntryId,
}: RegionFormProps) {
    const [activeSection, setActiveSection] = useState<FormSection>("basic");
    const [imageMediaId, setImageMediaId] = useState<number | undefined>(
        typeof initialValues.featuredImage === 'number'
            ? initialValues.featuredImage
            : typeof initialValues.featuredImage === 'object' && initialValues.featuredImage && 'id' in initialValues.featuredImage
                ? (initialValues.featuredImage as { id: number }).id
                : undefined
    );
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
    const [landmarkIconMediaId, setLandmarkIconMediaId] = useState<number | undefined>(
        typeof initialValues.landmarkIcon === 'number'
            ? initialValues.landmarkIcon
            : typeof initialValues.landmarkIcon === 'object' && initialValues.landmarkIcon && 'id' in initialValues.landmarkIcon
                ? (initialValues.landmarkIcon as { id: number }).id
                : undefined
    );
    const [landmarkIconUrl, setLandmarkIconUrl] = useState<string | undefined>(undefined);
    const imageUploadRef = useRef<MediaUploadRef | null>(null);
    const landmarkIconUploadRef = useRef<MediaUploadRef | null>(null);
    
    // Grid and parent region state (not in form schema, managed separately)
    const [minX, setMinX] = useState(initialValues.gridCells?.minX ?? 0);
    const [minY, setMinY] = useState(initialValues.gridCells?.minY ?? 0);
    const [width, setWidth] = useState(initialValues.gridCells?.width ?? 1);
    const [height, setHeight] = useState(initialValues.gridCells?.height ?? 1);
    const [parentRegions, setParentRegions] = useState<Array<{ id: number; name: string; level: number }>>([]);
    const [occupiedCells, setOccupiedCells] = useState<Set<string>>(new Set());
    const [gridValidationError, setGridValidationError] = useState<string | null>(null);

    // Initialize ID from initial values or generate from name
    const initialId = initialValues.id || (initialValues.name ? nameToId(initialValues.name) : "");

    const form = useForm({
        resolver: zodResolver(regionSchema),
        defaultValues: {
            id: initialId,
            name: initialValues.name || "",
            description: initialValues.description || "",
            type: initialValues.type || "region",
            parentLocation: typeof initialValues.parentLocation === 'number' ? initialValues.parentLocation : undefined,
            level: initialValues.level ?? (initialValues.parentLocation ? 1 : 0),
            climate: initialValues.climate || "",
            terrain: initialValues.terrain || "",
            population: initialValues.population || "",
            imageMediaId,
            landmarkIconMediaId,
        },
    });

    const { register, handleSubmit, watch, setValue, setError, clearErrors, formState: { errors } } = form;
    const name = watch("name");
    const id = watch("id");
    const parentLocation = watch("parentLocation");

    // Use reusable ID validation hook
    const { idValidation, validatingId } = useIdValidation({
        id,
        isEdit,
        projectId,
        editEntryId,
        checkIdUniqueness,
        setError,
        clearErrors,
    });

    // Fetch image URLs when editing
    useEffect(() => {
        if (imageMediaId && isEdit) {
            fetch(`/api/payload/${COLLECTIONS.Media}/${imageMediaId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.url) {
                        const url = data.url;
                        if (url.startsWith('http://localhost') || url.startsWith('https://')) {
                            try {
                                const urlObj = new URL(url);
                                setImageUrl(urlObj.pathname);
                            } catch {
                                setImageUrl(url);
                            }
                        } else {
                            setImageUrl(url.startsWith('/') ? url : `/${url}`);
                        }
                    }
                })
                .catch(err => console.error("Failed to fetch image:", err));
        } else if (!imageMediaId) {
            setImageUrl(undefined);
        }
    }, [imageMediaId, isEdit]);

    useEffect(() => {
        if (landmarkIconMediaId && isEdit) {
            fetch(`/api/payload/${COLLECTIONS.Media}/${landmarkIconMediaId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.url) {
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
        } else if (!landmarkIconMediaId) {
            setLandmarkIconUrl(undefined);
        }
    }, [landmarkIconMediaId, isEdit]);

    // Auto-generate ID from name
    useEffect(() => {
        if (!isEdit && name && !id) {
            const generatedId = nameToId(name);
            setValue("id", generatedId);
        }
    }, [name, isEdit, id, setValue]);

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
                    // Normalize current parent ID (handle both number and undefined)
                    const currentParentId = typeof parentLocation === 'number' ? parentLocation : null;
                    const currentEditId = isEdit ? editEntryId : null;

                    data.docs?.forEach((doc: any) => {
                        // Skip current region being edited
                        if (currentEditId && String(doc.id) === String(currentEditId)) return;

                        // Only check regions with the same parent (handle both number and object formats)
                        const docParentId = typeof doc.parentLocation === 'object' && doc.parentLocation?.id
                            ? doc.parentLocation.id
                            : typeof doc.parentLocation === 'number'
                            ? doc.parentLocation
                            : null;
                        
                        // Compare normalized parent IDs
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

                    // Always create a new Set to ensure React detects the change
                    setOccupiedCells(new Set(occupied));
                })
                .catch(err => console.error("Failed to fetch parent regions:", err));
        }
    }, [projectId, parentLocation, isEdit, editEntryId]);

    // Auto-calculate level from parent
    useEffect(() => {
        if (parentLocation) {
            const parent = parentRegions.find(r => r.id === parentLocation);
            if (parent) {
                setValue("level", parent.level + 1);
            }
        } else {
            setValue("level", 0);
        }
    }, [parentLocation, parentRegions, setValue]);


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

    // Scroll to section when active section changes
    useEffect(() => {
        const sectionElement = document.getElementById(`section-${activeSection}`);
        if (sectionElement) {
            sectionElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [activeSection]);

    // Track active section based on scroll position
    const formContentRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const formContent = formContentRef.current;
        if (!formContent) return;

        const handleScroll = () => {
            const sections = getFormSections();
            const scrollPosition = formContent.scrollTop + 100; // Offset for sticky header

            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                const element = document.getElementById(`section-${section.id}`);
                if (element && formContent.contains(element)) {
                    const offsetTop = element.offsetTop - formContent.offsetTop;
                    if (scrollPosition >= offsetTop) {
                        setActiveSection(section.id);
                        break;
                    }
                }
            }
        };

        formContent.addEventListener("scroll", handleScroll);
        return () => formContent.removeEventListener("scroll", handleScroll);
    }, []);

    const sections = getFormSections();

    const onSubmitForm = async (data: RegionFormDataInput) => {
        // Validate grid cells
        const gridError = validateGridSelection();
        if (gridError) {
            alert(gridError);
            setGridValidationError(gridError);
            return;
        }
        setGridValidationError(null);

        // Check ID validation one more time before submitting
        if (!isEdit && idValidation && !idValidation.isUnique) {
            alert(idValidation.error || "ID validation failed. Please choose a different ID.");
            return;
        }

        // Upload pending images before submitting
        let finalImageMediaId = imageMediaId;
        let finalLandmarkIconMediaId = landmarkIconMediaId;
        try {
            if (imageUploadRef.current) {
                const uploadedId = await imageUploadRef.current.uploadFile();
                if (uploadedId) {
                    finalImageMediaId = uploadedId;
                }
            }
            if (landmarkIconUploadRef.current) {
                const uploadedId = await landmarkIconUploadRef.current.uploadFile();
                if (uploadedId) {
                    finalLandmarkIconMediaId = uploadedId;
                }
            }
        } catch (error) {
            alert(`Failed to upload images: ${error instanceof Error ? error.message : "Unknown error"}`);
            return;
        }

        const regionData: RegionFormData = {
            id: data.id.trim(),
            name: data.name.trim(),
            description: data.description?.trim() || undefined,
            type: data.type,
            parentLocation: data.parentLocation,
            level: data.level,
            gridCells: {
                minX,
                minY,
                width,
                height,
            },
            landmarkIcon: finalLandmarkIconMediaId,
            featuredImage: finalImageMediaId,
            climate: data.climate?.trim() || undefined,
            terrain: data.terrain?.trim() || undefined,
            population: data.population?.trim() || undefined,
        };

        onSubmit(regionData);
    };

    return (
        <div className="flex h-full">
            {/* Sidebar Navigation */}
            <aside className="w-64 border-r border-border bg-shadow flex-shrink-0">
                <nav className="p-4 space-y-1 sticky top-0">
                    {sections.map((section) => {
                        const Icon = section.icon;
                        const isActive = activeSection === section.id;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                    isActive
                                        ? "bg-deep text-ember-glow"
                                        : "text-text-muted hover:text-text-primary hover:bg-deep/50"
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-sm font-medium">{section.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </aside>

            {/* Form Content */}
            <div ref={formContentRef} className="flex-1 overflow-y-auto">
                <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6 p-6">
                    {/* Basic Info Section */}
                    <BasicInfoSection
                        register={register}
                        watch={watch}
                        setValue={setValue}
                        errors={errors}
                        idValue={id}
                        idPlaceholder="e.g., ember-wastes"
                        isEdit={isEdit}
                        idValidation={idValidation}
                        validatingId={validatingId}
                        onIdChange={(newId) => {
                            setValue("id", newId);
                        }}
                        nameValue={name}
                        namePlaceholder="e.g., The Ember Wastes"
                        autoGenerateIdFromName={true}
                        descriptionValue={watch("description") || ""}
                        descriptionPlaceholder="A vast desert of crimson sand..."
                        imageMediaId={imageMediaId}
                        imageUrl={imageUrl}
                        onImageUploaded={(mediaId) => {
                            setImageMediaId(mediaId);
                            setValue("imageMediaId", mediaId);
                            if (!mediaId) {
                                setImageUrl(undefined);
                            }
                        }}
                        imageUploadRef={imageUploadRef}
                        landmarkIconMediaId={landmarkIconMediaId}
                        landmarkIconUrl={landmarkIconUrl}
                        onLandmarkIconUploaded={(mediaId) => {
                            setLandmarkIconMediaId(mediaId);
                            setValue("landmarkIconMediaId", mediaId);
                            if (!mediaId) {
                                setLandmarkIconUrl(undefined);
                            }
                        }}
                        landmarkIconUploadRef={landmarkIconUploadRef}
                        showLandmarkIcon={true}
                        saving={saving}
                        projectId={projectId}
                        editEntryId={editEntryId}
                    />

                    {/* Region-Specific Fields */}
                    <section id="section-properties" className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin className="w-5 h-5 text-ember-glow" />
                            <h2 className="text-xl font-bold text-glow">Region Properties</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
                                    <span>Type</span>
                                </label>
                                <select
                                    {...register("type")}
                                    className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
                                >
                                    {REGION_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
                                    <span>Level</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    {...register("level", { valueAsNumber: true })}
                                    className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
                                    title="Hierarchy level (0 = world, 1 = continent, etc.)"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
                                <span>Parent Region</span>
                            </label>
                            <select
                                {...register("parentLocation", { 
                                    setValueAs: (v) => v === "" ? undefined : parseInt(v, 10)
                                })}
                                className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
                            >
                                <option value="">None (Top Level)</option>
                                {parentRegions
                                    .filter(r => !isEdit || r.id !== editEntryId)
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

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
                                    <span>Climate</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("climate")}
                                    className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
                                    placeholder="e.g., Arid"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
                                    <span>Terrain</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("terrain")}
                                    className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
                                    placeholder="e.g., Desert"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-1">
                                <span>Population</span>
                            </label>
                            <input
                                type="text"
                                {...register("population")}
                                className="w-full px-3 py-2 bg-deep border border-border rounded text-text-primary"
                                placeholder="e.g., Sparse nomadic tribes"
                            />
                        </div>
                    </section>

                    {/* Grid Cell Coordinates */}
                    <section id="section-grid" className="space-y-4 border-t border-border pt-4">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin className="w-5 h-5 text-ember-glow" />
                            <h2 className="text-xl font-bold text-glow">Grid Placement</h2>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-glow">8×8 Grid</h3>
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
                                // Validate that the new selection doesn't overlap with occupied cells
                                const overlappingCells: string[] = [];
                                for (let x = newMinX; x < newMinX + newWidth; x++) {
                                    for (let y = newMinY; y < newMinY + newHeight; y++) {
                                        const cellKey = `${x},${y}`;
                                        if (occupiedCells.has(cellKey)) {
                                            overlappingCells.push(`(${x}, ${y})`);
                                        }
                                    }
                                }

                                if (overlappingCells.length > 0) {
                                    setGridValidationError(
                                        `Cannot select occupied cells: ${overlappingCells.slice(0, 5).join(", ")}${overlappingCells.length > 5 ? "..." : ""}`
                                    );
                                    return; // Don't update selection if it overlaps
                                }

                                setMinX(newMinX);
                                setMinY(newMinY);
                                setWidth(newWidth);
                                setHeight(newHeight);
                                setGridValidationError(null); // Clear error on change
                            }}
                            disabled={saving}
                            gridSize={8}
                            occupiedCells={occupiedCells}
                            currentEditId={editEntryId}
                        />
                        {gridValidationError && (
                            <p className="text-xs text-red-400 mt-2">{gridValidationError}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500/30 border border-red-500/70 rounded"></div>
                                <span>Occupied by other regions</span>
                            </div>
                            {occupiedCells.size > 0 && (
                                <span className="text-red-400">
                                    {occupiedCells.size} cell{occupiedCells.size !== 1 ? 's' : ''} occupied
                                </span>
                            )}
                        </div>
                    </section>
                </form>
            </div>
        </div>
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
        const form = document.querySelector('form') as HTMLFormElement;
        if (form) {
            form.requestSubmit();
        } else {
            onSubmit();
        }
    };

    return (
        <div className="flex items-center justify-end gap-2">
            {onCancel && (
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={saving}
                    className="px-3 py-1.5 border border-border/50 text-text-secondary hover:border-border hover:text-text-primary hover:bg-deep/50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                    <X className="w-4 h-4" />
                    <span className="text-xs font-medium">Cancel</span>
                </button>
            )}
            <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="px-3 py-1.5 bg-ember/90 hover:bg-ember border border-ember/50 text-void rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm hover:shadow-md"
            >
                <Save className="w-4 h-4" />
                <span className="text-xs font-medium">{saving ? "Saving..." : submitLabel || (isEdit ? "Update" : "Create")}</span>
            </button>
        </div>
    );
}

