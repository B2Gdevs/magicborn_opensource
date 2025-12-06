"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Trash2, Edit, ImageIcon } from "lucide-react";
import { EFFECT_DEFS } from "@/lib/data/effects";
import type { EffectDefinition } from "@/lib/data/effects";
import { EffectForm } from "@components/effect/EffectForm";
import { effectClient } from "@/lib/api/clients";
import { Tooltip } from "@components/ui/Tooltip";

export default function EffectEditor() {
  const [effects, setEffects] = useState<EffectDefinition[]>([]);
  const [selectedEffect, setSelectedEffect] = useState<EffectDefinition | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadEffects() {
      try {
        const loadedEffects = await effectClient.list();
        setEffects(loadedEffects);
      } catch (error) {
        console.error("Failed to load effects:", error);
        // Fallback to hardcoded data
        setEffects(Object.values(EFFECT_DEFS));
      } finally {
        setLoading(false);
      }
    }
    loadEffects();
  }, []);

  const handleUpdate = async (updatedEffect: EffectDefinition) => {
    setSaving(true);
    try {
      await effectClient.update(updatedEffect);
      
      // Refresh the list
      const refreshedEffects = await effectClient.list();
      setEffects(refreshedEffects);
      setSelectedEffect(updatedEffect);
      
      setShowEditModal(false);
    } catch (error) {
      console.error("Error saving effect:", error);
      alert(`Failed to save effect: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (effect: EffectDefinition) => {
    if (!confirm(`Delete ${effect.name}?`)) return;
    
    setSaving(true);
    try {
      await effectClient.delete(effect.id);
      
      // Refresh the list
      const refreshedEffects = await effectClient.list();
      setEffects(refreshedEffects);
      
      if (selectedEffect?.id === effect.id) {
        setSelectedEffect(null);
      }
    } catch (error) {
      console.error("Error deleting effect:", error);
      alert(`Failed to delete effect: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (newEffect: EffectDefinition) => {
    setSaving(true);
    try {
      await effectClient.create(newEffect);
      
      // Refresh the list
      const refreshedEffects = await effectClient.list();
      setEffects(refreshedEffects);
      
      setShowCreateModal(false);
      setSelectedEffect(newEffect);
    } catch (error) {
      console.error("Error creating effect:", error);
      alert(`Failed to create effect: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-text-muted">Loading effects...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex h-full gap-4 overflow-hidden">
        {/* Effect List */}
        <div className="w-1/3 border-r border-border bg-shadow flex flex-col overflow-hidden">
          {/* Fixed Header */}
          <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
            <h2 className="text-xl font-bold text-glow">Effects</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn text-sm px-3 py-1"
            >
              + New Effect
            </button>
          </div>
          {/* Scrollable List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {effects.map((effect) => (
                <div
                  key={effect.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedEffect?.id === effect.id
                      ? "border-ember-glow bg-deep"
                      : "border-border hover:border-ember/50"
                  }`}
                  onClick={() => {
                    setSelectedEffect(effect);
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Image thumbnail */}
                    <div className="relative w-16 h-16 flex-shrink-0 rounded border border-border overflow-hidden bg-deep">
                      {effect.imagePath ? (
                        <Image
                          src={effect.imagePath}
                          alt={effect.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-text-muted" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
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
                        <Tooltip content="Delete effect">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(effect);
                            }}
                            className="text-text-muted hover:text-red-500 transition-colors p-1"
                            aria-label="Delete effect"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Effect Viewer */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedEffect ? (
            <div className="flex flex-col h-full">
              {/* Minimal Toolbar */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-shadow/50 flex-shrink-0">
                <h2 className="text-xl font-semibold text-glow">{selectedEffect.name}</h2>
                <Tooltip content="Edit effect">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="p-2 rounded text-text-muted hover:text-ember-glow hover:bg-deep transition-all"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </Tooltip>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-6">

              {/* Image display */}
              <div className="relative w-full aspect-video rounded-lg border border-border overflow-hidden bg-deep">
                {selectedEffect.imagePath ? (
                  <Image
                    src={selectedEffect.imagePath}
                    alt={selectedEffect.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-text-muted">
                    <ImageIcon className="w-16 h-16 mb-2 opacity-50" />
                    <p className="text-sm">No image uploaded</p>
                  </div>
                )}
              </div>

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
                {selectedEffect.iconKey && (
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-1">
                      Icon Key
                    </label>
                    <p className="text-text-primary">{selectedEffect.iconKey}</p>
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
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-text-muted">
              Select an effect to view details
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateEffectModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
          existingIds={effects.map(e => e.id)}
          existingEffects={effects}
          saving={saving}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedEffect && (
        <EditEffectModal
          effect={selectedEffect}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdate}
          existingEffects={effects}
          saving={saving}
        />
      )}
    </div>
  );
}

function EditEffectModal({
  effect,
  onClose,
  onUpdate,
  existingEffects,
  saving,
}: {
  effect: EffectDefinition;
  onClose: () => void;
  onUpdate: (effect: EffectDefinition) => void;
  existingEffects: EffectDefinition[];
  saving: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-shadow border border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-glow">Edit Effect</h3>
          <Tooltip content="Close">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="text-text-muted hover:text-text-primary transition-colors p-1 hover:bg-deep rounded"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </Tooltip>
        </div>
        
        <EffectForm
          initialValues={effect}
          existingEffects={existingEffects}
          isEdit={true}
          onSubmit={onUpdate}
          onCancel={onClose}
          saving={saving}
        />
      </div>
    </div>
  );
}

function CreateEffectModal({
  onClose,
  onCreate,
  existingIds,
  existingEffects,
  saving,
}: {
  onClose: () => void;
  onCreate: (effect: EffectDefinition) => void;
  existingIds: string[];
  existingEffects: EffectDefinition[];
  saving: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-shadow border border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-glow">Create New Effect</h3>
          <Tooltip content="Close">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="text-text-muted hover:text-text-primary transition-colors p-1 hover:bg-deep rounded"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </Tooltip>
        </div>
        
        <EffectForm
          existingEffects={existingEffects}
          existingIds={existingIds}
          isEdit={false}
          onSubmit={onCreate}
          onCancel={onClose}
          saving={saving}
        />
      </div>
    </div>
  );
}
