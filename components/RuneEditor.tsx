"use client";

import { useState, useEffect } from "react";
import { RUNES, listRunes } from "@/lib/packages/runes";
import type { RuneDef } from "@/lib/packages/runes";
import type { RuneCode } from "@core/types";
import ResourceDocumentation from "@components/ResourceDocumentation";

export default function RuneEditor() {
  const [runes, setRunes] = useState<RuneDef[]>([]);
  const [selectedRune, setSelectedRune] = useState<RuneDef | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setRunes(listRunes());
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="text-text-muted">Loading runes...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Documentation */}
      <div className="p-4 border-b border-border bg-shadow">
        <ResourceDocumentation
          title="Runes"
          sourcePath="lib/packages/runes/index.ts"
          outputPath="lib/packages/runes/index.ts"
          description="Runes are the fundamental building blocks of spells. Each rune has power/control factors, damage types, effects, and other properties that combine to create spells."
          mergeStrategy="Runes are stored as a TypeScript Record in the RUNES constant. When editing, the entire RUNES object is regenerated. Manual edits to the file will be overwritten on save."
        />
      </div>

      <div className="flex h-full gap-4 overflow-hidden">
        {/* Rune List */}
        <div className="w-1/3 border-r border-border bg-shadow p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-glow">Runes</h2>
          </div>
          <div className="space-y-2">
            {runes.map((rune) => (
              <div
                key={rune.code}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedRune?.code === rune.code
                    ? "border-ember-glow bg-deep"
                    : "border-border hover:border-ember/50"
                }`}
                onClick={() => setSelectedRune(rune)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-ember-glow">
                      {rune.code} - {rune.concept}
                    </h3>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {rune.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-ember/20 text-ember-glow px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rune Viewer */}
        <div className="flex-1 p-4 overflow-y-auto">
          {selectedRune ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-glow">
                {selectedRune.code} - {selectedRune.concept}
              </h2>
              <div className="card space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1">
                    Power Factor
                  </label>
                  <p className="text-text-primary">{selectedRune.powerFactor}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1">
                    Control Factor
                  </label>
                  <p className="text-text-primary">{selectedRune.controlFactor}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1">
                    Instability Base
                  </label>
                  <p className="text-text-primary">{selectedRune.instabilityBase}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1">
                    Mana Cost
                  </label>
                  <p className="text-text-primary">{selectedRune.manaCost}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1">
                    Tags
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {selectedRune.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-shadow-purple/20 text-shadow-purple-glow px-3 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                {selectedRune.damage && Object.keys(selectedRune.damage).length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-1">
                      Damage
                    </label>
                    <pre className="bg-deep border border-border rounded p-3 text-xs overflow-x-auto">
                      {JSON.stringify(selectedRune.damage, null, 2)}
                    </pre>
                  </div>
                )}
                {selectedRune.effects && selectedRune.effects.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-1">
                      Effects
                    </label>
                    <pre className="bg-deep border border-border rounded p-3 text-xs overflow-x-auto">
                      {JSON.stringify(selectedRune.effects, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-text-muted">
              Select a rune to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

