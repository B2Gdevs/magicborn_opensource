// components/environment/InheritanceChainDisplay.tsx
// Shows the full inheritance chain for the selected region

"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { useMapEditorStore } from "@/lib/store/mapEditorStore";
import type { EnvironmentDefinition } from "@/lib/data/environments";
import type { MapDefinition } from "@/lib/data/maps";

interface InheritanceChainDisplayProps {
  environments: EnvironmentDefinition[];
  maps: MapDefinition[];
}

export function InheritanceChainDisplay({ environments, maps }: InheritanceChainDisplayProps) {
  const {
    selectedMap,
    selectedRegionId,
    regions,
    showInheritanceChainDisplay,
  } = useMapEditorStore();
  
  const [isMinimized, setIsMinimized] = useState(false);
  
  const selectedRegion = useMemo(() => {
    if (!selectedRegionId) return null;
    return regions.find(r => r.id === selectedRegionId);
  }, [regions, selectedRegionId]);
  
  const inheritanceChain = useMemo(() => {
    if (!selectedMap || !selectedRegion) return null;
    
    const chain: Array<{
      type: "region";
      name: string;
      environment?: EnvironmentDefinition;
      overrides?: {
        biome?: string;
        climate?: string;
        dangerLevel?: number;
      };
    }> = [];
    
    // Regions are independent - only show region's environment
    const regionEnvironment = selectedRegion.environmentId 
      ? environments.find(e => e.id === selectedRegion.environmentId)
      : undefined;
    
    const hasOverrides = selectedRegion.metadata?.biome || 
                        selectedRegion.metadata?.climate || 
                        selectedRegion.metadata?.dangerLevel !== undefined;
    
    chain.push({
      type: "region",
      name: selectedRegion.name,
      environment: regionEnvironment,
      overrides: hasOverrides ? {
        biome: selectedRegion.metadata?.biome,
        climate: selectedRegion.metadata?.climate,
        dangerLevel: selectedRegion.metadata?.dangerLevel,
      } : undefined,
    });
    
    return chain;
  }, [selectedMap, selectedRegion, environments]);
  
  if (!showInheritanceChainDisplay || !selectedRegion || !inheritanceChain) {
    return null;
  }
  
  return (
    <div className="absolute top-4 left-4 w-96 bg-deep border border-border rounded-lg shadow-lg z-10">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-text-primary">Inheritance Chain</h3>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="p-1 rounded hover:bg-shadow text-text-muted hover:text-text-primary transition-colors"
        >
          {isMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>
      
      {!isMinimized && (
        <div className="p-4 space-y-3">
          {inheritanceChain.map((item, index) => {
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="px-2 py-1 rounded text-xs font-semibold bg-ember-glow/20 text-ember-glow border border-ember-glow/40">
                    Region
                  </div>
                  <span className="font-medium text-text-primary">{item.name}</span>
                </div>
                
                {item.environment ? (
                  <div className="ml-4 pl-3 border-l-2 border-border">
                    <div className="text-xs text-text-muted mb-1">Environment Template:</div>
                    <div className="text-sm text-text-primary font-medium mb-1">{item.environment.name}</div>
                    <div className="flex items-center gap-2 text-xs text-text-muted flex-wrap">
                      <span className="px-2 py-0.5 bg-void rounded border border-border">
                        {item.environment.metadata.biome}
                      </span>
                      <span className="px-2 py-0.5 bg-void rounded border border-border">
                        {item.environment.metadata.climate}
                      </span>
                      <span className="px-2 py-0.5 bg-void rounded border border-border">
                        Danger: {item.environment.metadata.dangerLevel}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="ml-4 pl-3 border-l-2 border-border">
                    <div className="text-xs text-text-muted">No environment template assigned</div>
                  </div>
                )}
                
                {item.overrides && (
                  <div className="ml-4 pl-3 border-l-2 border-ember-glow/40">
                    <div className="text-xs text-ember-glow mb-1">Property Overrides:</div>
                    <div className="flex items-center gap-2 text-xs text-text-muted flex-wrap">
                      {item.overrides.biome && (
                        <span className="px-2 py-0.5 bg-ember-glow/10 rounded border border-ember-glow/30 text-ember-glow">
                          {item.overrides.biome}
                        </span>
                      )}
                      {item.overrides.climate && (
                        <span className="px-2 py-0.5 bg-ember-glow/10 rounded border border-ember-glow/30 text-ember-glow">
                          {item.overrides.climate}
                        </span>
                      )}
                      {item.overrides.dangerLevel !== undefined && (
                        <span className="px-2 py-0.5 bg-ember-glow/10 rounded border border-ember-glow/30 text-ember-glow">
                          Danger: {item.overrides.dangerLevel}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

