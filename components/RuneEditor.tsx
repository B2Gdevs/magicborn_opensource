"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Trash2, Edit, ImageIcon, X } from "lucide-react";
import type { RuneDef } from "@/lib/packages/runes";
import { getRUNES } from "@/lib/packages/runes";
import { RuneForm } from "@components/rune/RuneForm";
import { runeClient } from "@/lib/api/clients";
import { Tooltip } from "@components/ui/Tooltip";

export default function RuneEditor() {
  const [runes, setRunes] = useState<RuneDef[]>([]);
  const [selectedRune, setSelectedRune] = useState<RuneDef | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadRunes() {
      try {
        const loadedRunes = await runeClient.list();
        setRunes(loadedRunes);
      } catch (error) {
        console.error("Failed to load runes:", error);
        // Fallback to hardcoded data
        const fallbackRunes = Object.values(getRUNES());
        setRunes(fallbackRunes);
      } finally {
        setLoading(false);
      }
    }
    loadRunes();
  }, []);

  const handleUpdate = async (updatedRune: RuneDef) => {
    setSaving(true);
    try {
      await runeClient.update(updatedRune);
      
      // Refresh the list
      const refreshedRunes = await runeClient.list();
      setRunes(refreshedRunes);
      setSelectedRune(updatedRune);
      
      setShowEditModal(false);
    } catch (error) {
      console.error("Error saving rune:", error);
      alert(`Failed to save rune: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (rune: RuneDef) => {
    if (!confirm(`Delete ${rune.concept} (${rune.code})?`)) return;
    
    setSaving(true);
    try {
      await runeClient.delete(rune.code);
      
      // Refresh the list
      const refreshedRunes = await runeClient.list();
      setRunes(refreshedRunes);
      
      if (selectedRune?.code === rune.code) {
        setSelectedRune(null);
      }
    } catch (error) {
      console.error("Error deleting rune:", error);
      alert(`Failed to delete rune: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (newRune: RuneDef) => {
    setSaving(true);
    try {
      await runeClient.create(newRune);
      
      // Refresh the list
      const refreshedRunes = await runeClient.list();
      setRunes(refreshedRunes);
      
      setShowCreateModal(false);
      setSelectedRune(newRune);
    } catch (error) {
      console.error("Error creating rune:", error);
      alert(`Failed to create rune: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-text-muted">Loading runes...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Modals */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-void border border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <Tooltip content="Close">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 text-text-muted hover:text-text-primary"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </Tooltip>
            <h2 className="text-2xl font-bold text-glow mb-4">Create New Rune</h2>
            <RuneForm
              existingRunes={runes}
              onSubmit={handleCreate}
              onCancel={() => setShowCreateModal(false)}
              saving={saving}
            />
          </div>
        </div>
      )}

      {showEditModal && selectedRune && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-void border border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <Tooltip content="Close">
              <button
                onClick={() => setShowEditModal(false)}
                className="absolute top-4 right-4 text-text-muted hover:text-text-primary"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </Tooltip>
            <h2 className="text-2xl font-bold text-glow mb-4">Edit Rune</h2>
            <RuneForm
              initialValues={selectedRune}
              existingRunes={runes}
              isEdit={true}
              onSubmit={handleUpdate}
              onCancel={() => setShowEditModal(false)}
              saving={saving}
            />
          </div>
        </div>
      )}

      <div className="flex h-full gap-4 overflow-hidden">
        {/* Rune List */}
        <div className="w-1/3 border-r border-border bg-shadow flex flex-col overflow-hidden">
          {/* Fixed Header */}
          <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
            <h2 className="text-xl font-bold text-glow">Runes</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn text-sm px-3 py-1"
            >
              + New Rune
            </button>
          </div>
          {/* Scrollable List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {runes.map((rune) => (
                <div
                  key={rune.code}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${
                    selectedRune?.code === rune.code
                      ? "border-ember-glow bg-deep"
                      : "border-border hover:border-ember/50"
                  }`}
                  onClick={() => {
                    setSelectedRune(rune);
                  }}
                >
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-void border border-border">
                    {rune.imagePath ? (
                      <Image
                        src={rune.imagePath}
                        alt={rune.concept}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-text-muted absolute inset-0 m-auto" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-ember-glow">
                      {rune.code} - {rune.concept}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      Power: {rune.powerFactor} | Control: {rune.controlFactor} | Mana: {rune.manaCost}
                    </p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {rune.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-ember/20 text-ember-glow px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Tooltip content="Delete rune">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(rune);
                      }}
                      className="text-text-muted hover:text-red-500 p-1 rounded"
                      aria-label="Delete rune"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </Tooltip>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rune Detail View */}
        <div className="flex-1 p-4 overflow-y-auto">
          {selectedRune ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-glow">
                  {selectedRune.code} - {selectedRune.concept}
                </h2>
                <button onClick={() => setShowEditModal(true)} className="btn">
                  <Edit className="w-5 h-5 mr-2" /> Edit
                </button>
              </div>

              {selectedRune.imagePath ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-deep">
                  <Image
                    src={selectedRune.imagePath}
                    alt={selectedRune.concept}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="relative w-full aspect-video rounded-lg border border-dashed border-border bg-deep flex items-center justify-center text-text-muted">
                  <ImageIcon className="w-16 h-16 mb-2" />
                  <p className="text-lg">No image uploaded</p>
                </div>
              )}

              <div className="card space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                  {selectedRune.dotAffinity !== undefined && (
                    <div>
                      <label className="block text-sm font-semibold text-text-secondary mb-1">
                        DOT Affinity
                      </label>
                      <p className="text-text-primary">{selectedRune.dotAffinity}</p>
                    </div>
                  )}
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

                {selectedRune.ccInstant && selectedRune.ccInstant.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-1">
                      Crowd Control (Instant)
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {selectedRune.ccInstant.map((cc) => (
                        <span
                          key={cc}
                          className="bg-ember/20 text-ember-glow px-3 py-1 rounded"
                        >
                          {cc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRune.pen && Object.keys(selectedRune.pen).length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-1">
                      Penetration
                    </label>
                    <pre className="bg-deep border border-border rounded p-3 text-xs overflow-x-auto">
                      {JSON.stringify(selectedRune.pen, null, 2)}
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

                {selectedRune.overchargeEffects && selectedRune.overchargeEffects.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-1">
                      Overcharge Effects
                    </label>
                    <pre className="bg-deep border border-border rounded p-3 text-xs overflow-x-auto">
                      {JSON.stringify(selectedRune.overchargeEffects, null, 2)}
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
