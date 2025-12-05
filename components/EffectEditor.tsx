"use client";

import { useState, useEffect } from "react";
import { EFFECT_DEFS } from "@/lib/data/effects";
import type { EffectDefinition } from "@/lib/data/effects";
import ResourceDocumentation from "@components/ResourceDocumentation";

export default function EffectEditor() {
  const [effects, setEffects] = useState<EffectDefinition[]>([]);
  const [selectedEffect, setSelectedEffect] = useState<EffectDefinition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setEffects(Object.values(EFFECT_DEFS));
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="text-text-muted">Loading effects...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Documentation */}
      <div className="p-4 border-b border-border bg-shadow">
        <ResourceDocumentation
          title="Effects"
          sourcePath="lib/data/effects.ts"
          outputPath="lib/data/effects.ts"
          description="Effects are status conditions that can be applied to entities (buffs, debuffs, DoTs, etc.). Each effect has a blueprint with base magnitude and duration that can be modified by runes."
          mergeStrategy="Effects are stored as a TypeScript Record. When editing, the entire EFFECT_DEFS object is regenerated. Manual edits to the file will be overwritten on save."
        />
      </div>

      <div className="flex h-full gap-4 overflow-hidden">
        {/* Effect List */}
        <div className="w-1/3 border-r border-border bg-shadow p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-glow">Effects</h2>
          </div>
          <div className="space-y-2">
            {effects.map((effect) => (
              <div
                key={effect.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedEffect?.id === effect.id
                    ? "border-ember-glow bg-deep"
                    : "border-border hover:border-ember/50"
                }`}
                onClick={() => setSelectedEffect(effect)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-ember-glow">{effect.name}</h3>
                    <p className="text-sm text-text-secondary line-clamp-1">
                      {effect.description}
                    </p>
                    <div className="flex gap-1 mt-1">
                      <span className="text-xs bg-shadow-purple/20 text-shadow-purple-glow px-2 py-0.5 rounded">
                        {effect.category}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        effect.isBuff 
                          ? "bg-moss/20 text-moss-glow" 
                          : "bg-ember/20 text-ember-glow"
                      }`}>
                        {effect.isBuff ? "Buff" : "Debuff"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Effect Viewer */}
        <div className="flex-1 p-4 overflow-y-auto">
          {selectedEffect ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-glow">{selectedEffect.name}</h2>
              <div className="card space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1">
                    Description
                  </label>
                  <p className="text-text-primary">{selectedEffect.description}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1">
                    Category
                  </label>
                  <p className="text-text-primary">{selectedEffect.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1">
                    Type
                  </label>
                  <p className="text-text-primary">
                    {selectedEffect.isBuff ? "Buff" : "Debuff"}
                  </p>
                </div>
                {selectedEffect.maxStacks && (
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-1">
                      Max Stacks
                    </label>
                    <p className="text-text-primary">{selectedEffect.maxStacks}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1">
                    Blueprint
                  </label>
                  <pre className="bg-deep border border-border rounded p-3 text-xs overflow-x-auto">
                    {JSON.stringify(selectedEffect.blueprint, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-text-muted">
              Select an effect to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

