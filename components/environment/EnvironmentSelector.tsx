// components/environment/EnvironmentSelector.tsx
// Reusable environment selector with inheritance display

"use client";

import { useMemo } from "react";
import { SearchableCombobox } from "@/components/ui/SearchableCombobox";
import { AlertTriangle } from "lucide-react";
import type { EnvironmentDefinition } from "@/lib/data/environments";
import type { MapRegion } from "@/lib/data/mapRegions";
import type { MapDefinition } from "@/lib/data/maps";

interface EnvironmentSelectorProps {
  environments: EnvironmentDefinition[];
  selectedEnvironmentId: string | null;
  onEnvironmentChange: (environmentId: string | null) => void;
  parentRegion?: MapRegion | null;
  baseRegion?: MapRegion | null;
  contextLabel?: string; // e.g., "Selecting within region:" or "Editing region within:"
  showInheritanceInfo?: boolean;
}

export function EnvironmentSelector({
  environments,
  selectedEnvironmentId,
  onEnvironmentChange,
  parentRegion,
  baseRegion,
  contextLabel = "Selecting within region:",
  showInheritanceInfo = true,
}: EnvironmentSelectorProps) {
  // Get parent region's environment if it has one, otherwise use base region's environment
  const parentRegionEnvironment = useMemo(() => {
    if (parentRegion?.environmentId) {
      return environments.find(e => e.id === parentRegion.environmentId) || null;
    }
    // If no parent region, check base region
    if (baseRegion?.environmentId) {
      return environments.find(e => e.id === baseRegion.environmentId) || null;
    }
    return null;
  }, [parentRegion, baseRegion, environments]);

  // Set default environment to inherited one if not manually selected
  const effectiveEnvironmentId = selectedEnvironmentId !== null 
    ? selectedEnvironmentId 
    : (parentRegionEnvironment?.id || null);

  return (
    <div className="p-3 bg-void/50 border border-border rounded">
      <div className="text-xs font-semibold text-text-secondary mb-2">Environment Template</div>
      
      {/* Show parent region info if selecting/editing within one */}
      {showInheritanceInfo && parentRegion && (
        <div className="mb-3 pb-3 border-b border-border">
          <div className="text-xs text-text-muted mb-1">{contextLabel}</div>
          <div className="text-sm text-text-primary font-medium mb-2">
            {parentRegion.name}
          </div>
          {parentRegionEnvironment && (
            <>
              <div className="text-xs text-text-muted mb-1">Inheriting from:</div>
              <div className="flex items-center gap-2 text-xs text-text-muted flex-wrap">
                <span className="px-2 py-0.5 bg-deep rounded border border-border">{parentRegionEnvironment.name}</span>
                <span className="px-2 py-0.5 bg-deep rounded border border-border">{parentRegionEnvironment.metadata.biome}</span>
                <span className="px-2 py-0.5 bg-deep rounded border border-border">{parentRegionEnvironment.metadata.climate}</span>
                <span className="px-2 py-0.5 bg-deep rounded border border-border">Danger: {parentRegionEnvironment.metadata.dangerLevel}</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Show base region info if no parent region */}
      {showInheritanceInfo && !parentRegion && baseRegion && (
        <div className="mb-3 pb-3 border-b border-border">
          <div className="text-xs text-text-muted mb-1">{contextLabel}</div>
          <div className="text-sm text-text-primary font-medium mb-2">
            {baseRegion.name}
          </div>
          {parentRegionEnvironment && (
            <>
              <div className="text-xs text-text-muted mb-1">Inheriting from:</div>
              <div className="flex items-center gap-2 text-xs text-text-muted flex-wrap">
                <span className="px-2 py-0.5 bg-deep rounded border border-border">{parentRegionEnvironment.name}</span>
                <span className="px-2 py-0.5 bg-deep rounded border border-border">{parentRegionEnvironment.metadata.biome}</span>
                <span className="px-2 py-0.5 bg-deep rounded border border-border">{parentRegionEnvironment.metadata.climate}</span>
                <span className="px-2 py-0.5 bg-deep rounded border border-border">Danger: {parentRegionEnvironment.metadata.dangerLevel}</span>
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Environment selector */}
      <SearchableCombobox
        options={environments.map(env => ({
          value: env.id,
          label: env.name,
          description: `${env.metadata.biome} • ${env.metadata.climate} • Danger: ${env.metadata.dangerLevel}`
        }))}
        value={effectiveEnvironmentId}
        onChange={onEnvironmentChange}
        placeholder="Select environment template..."
        searchPlaceholder="Search environments..."
      />
      
      {parentRegionEnvironment && effectiveEnvironmentId === parentRegionEnvironment.id && (
        <div className="mt-2 text-xs text-text-muted">
          Inheriting from parent region. Select a different environment to override.
        </div>
      )}
      {selectedEnvironmentId && selectedEnvironmentId !== parentRegionEnvironment?.id && (
        <div className="mt-2 text-xs text-text-muted">
          Selected environment will override parent region's environment.
        </div>
      )}
      {!effectiveEnvironmentId && !parentRegionEnvironment && (
        <div className="mt-2 p-2 bg-yellow-400/10 border border-yellow-400/30 rounded text-xs text-yellow-400">
          <AlertTriangle className="w-3 h-3 inline mr-1" />
          No environment template selected and not inheriting from parent region. Please select an environment template.
        </div>
      )}
    </div>
  );
}
