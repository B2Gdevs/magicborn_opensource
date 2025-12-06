// components/CreatureEditor.tsx
// Main UI component for managing creature definitions

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Trash2, Edit, ImageIcon, X, BookOpen, FileText } from "lucide-react";
import type { CreatureDefinition } from "@/lib/data/creatures";
import { CreatureForm } from "@components/creature/CreatureForm";
import { CreatureStoriesManager } from "@components/creature/CreatureStoriesManager";
import { creatureClient } from "@/lib/api/clients";
import { Tooltip } from "@components/ui/Tooltip";
import { Modal } from "@components/ui/Modal";
import { CreatureFormFooter } from "@components/creature/CreatureForm";

export default function CreatureEditor() {
  const [creatures, setCreatures] = useState<CreatureDefinition[]>([]);
  const [selectedCreature, setSelectedCreature] = useState<CreatureDefinition | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "stories">("details");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadCreatures() {
      try {
        const loadedCreatures = await creatureClient.list();
        setCreatures(loadedCreatures);
      } catch (error) {
        console.error("Failed to load creatures:", error);
        setCreatures([]);
      } finally {
        setLoading(false);
      }
    }
    loadCreatures();
  }, []);

  const handleUpdate = async (updatedCreature: CreatureDefinition) => {
    setSaving(true);
    try {
      await creatureClient.update(updatedCreature);
      
      const refreshedCreatures = await creatureClient.list();
      setCreatures(refreshedCreatures);
      setSelectedCreature(updatedCreature);
      
      setShowEditModal(false);
    } catch (error) {
      console.error("Error saving creature:", error);
      alert(`Failed to save creature: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (creature: CreatureDefinition) => {
    if (!confirm(`Delete ${creature.name}?`)) return;
    
    setSaving(true);
    try {
      await creatureClient.delete(creature.id);
      
      const refreshedCreatures = await creatureClient.list();
      setCreatures(refreshedCreatures);
      
      if (selectedCreature?.id === creature.id) {
        setSelectedCreature(null);
      }
    } catch (error) {
      console.error("Error deleting creature:", error);
      alert(`Failed to delete creature: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (newCreature: CreatureDefinition) => {
    setSaving(true);
    try {
      await creatureClient.create(newCreature);
      
      const refreshedCreatures = await creatureClient.list();
      setCreatures(refreshedCreatures);
      
      setShowCreateModal(false);
      setSelectedCreature(newCreature);
    } catch (error) {
      console.error("Error creating creature:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      // If the error is about ID already existing, provide more context
      if (errorMessage.includes("already exists")) {
        alert(`Failed to create creature: ${errorMessage}\n\nThis might happen if:\n- The ID was created in another session\n- The validation cache is out of sync\n\nTry refreshing the page or using a different ID.`);
      } else {
        alert(`Failed to create creature: ${errorMessage}`);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-text-muted">Loading creatures...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex h-full gap-4 overflow-hidden">
        {/* Creature List */}
        <div className="w-1/3 border-r border-border bg-shadow flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
            <h2 className="text-xl font-bold text-glow">Creatures</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn text-sm px-3 py-1"
            >
              + New Creature
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {creatures.map((creature) => (
                <div
                  key={creature.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${
                    selectedCreature?.id === creature.id
                      ? "border-ember-glow bg-deep"
                      : "border-border hover:border-ember/50"
                  }`}
                  onClick={() => setSelectedCreature(creature)}
                >
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-void border border-border">
                    {creature.imagePath ? (
                      <Image
                        src={creature.imagePath}
                        alt={creature.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-text-muted absolute inset-0 m-auto" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-ember-glow">{creature.name}</h3>
                    <p className="text-sm text-text-secondary line-clamp-1">
                      {creature.description}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {creature.storyIds.length > 0 && (
                        <span className="text-xs bg-shadow-purple/20 text-shadow-purple-glow px-2 py-0.5 rounded">
                          {creature.storyIds.length} Stories
                        </span>
                      )}
                    </div>
                  </div>
                  <Tooltip content="Delete creature">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(creature);
                      }}
                      className="text-text-muted hover:text-red-500 p-1 rounded"
                      aria-label="Delete creature"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </Tooltip>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Creature Detail View */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedCreature ? (
            <div className="flex flex-col h-full">
              {/* Minimal Toolbar */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-shadow/50 flex-shrink-0">
                <h2 className="text-xl font-semibold text-glow">{selectedCreature.name}</h2>
                <div className="flex items-center gap-1">
                  <Tooltip content="View creature details">
                    <button
                      onClick={() => setActiveTab("details")}
                      className={`p-2 rounded transition-all ${
                        activeTab === "details"
                          ? "bg-ember/20 text-ember-glow"
                          : "text-text-muted hover:text-ember-glow hover:bg-deep"
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </Tooltip>
                  <Tooltip content="Manage stories">
                    <button
                      onClick={() => setActiveTab("stories")}
                      className={`p-2 rounded transition-all ${
                        activeTab === "stories"
                          ? "bg-ember/20 text-ember-glow"
                          : "text-text-muted hover:text-ember-glow hover:bg-deep"
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>
                  </Tooltip>
                  <div className="w-px h-6 bg-border mx-1" />
                  <Tooltip content="Edit creature">
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="p-2 rounded text-text-muted hover:text-ember-glow hover:bg-deep transition-all"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {activeTab === "details" ? (
                  <div className="space-y-6">
                    {selectedCreature.imagePath ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-deep">
                        <Image
                          src={selectedCreature.imagePath}
                          alt={selectedCreature.name}
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
                      <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-1">
                          Description
                        </label>
                        <p className="text-text-primary whitespace-pre-wrap">{selectedCreature.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-text-secondary mb-1">
                            HP
                          </label>
                          <p className="text-text-primary">{selectedCreature.hp} / {selectedCreature.maxHp}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-text-secondary mb-1">
                            Mana
                          </label>
                          <p className="text-text-primary">{selectedCreature.mana} / {selectedCreature.maxMana}</p>
                        </div>
                      </div>

                      {Object.keys(selectedCreature.affinity).length > 0 && (
                        <div>
                          <label className="block text-sm font-semibold text-text-secondary mb-1">
                            Rune Familiarity
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(selectedCreature.affinity).map(([rune, value]) => (
                              <span
                                key={rune}
                                className="bg-ember/20 text-ember-glow px-3 py-1 rounded text-sm"
                              >
                                {rune}: {value.toFixed(2)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedCreature.elementXp && Object.keys(selectedCreature.elementXp).length > 0 && (
                        <div>
                          <label className="block text-sm font-semibold text-text-secondary mb-1">
                            Element XP
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(selectedCreature.elementXp).map(([type, value]) => (
                              <span
                                key={type}
                                className="bg-moss/20 text-moss-glow px-3 py-1 rounded text-sm"
                              >
                                {type}: {value}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedCreature.elementAffinity && Object.keys(selectedCreature.elementAffinity).length > 0 && (
                        <div>
                          <label className="block text-sm font-semibold text-text-secondary mb-1">
                            Element Affinity
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(selectedCreature.elementAffinity).map(([type, value]) => (
                              <span
                                key={type}
                                className="bg-shadow-purple/20 text-shadow-purple-glow px-3 py-1 rounded text-sm"
                              >
                                {type}: {value.toFixed(2)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <CreatureStoriesManager
                    creature={selectedCreature}
                    onCreatureUpdate={setSelectedCreature}
                    saving={saving}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-text-muted">
              Select a creature to view details or create a new one.
            </div>
          )}
        </div>
      </div>

      {/* Create Creature Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Creature"
        footer={
          <CreatureFormFooter
            isEdit={false}
            saving={saving}
            onCancel={() => setShowCreateModal(false)}
            onSubmit={() => {
              const form = document.querySelector('form') as HTMLFormElement & { submitForm?: () => void };
              if (form?.submitForm) {
                form.submitForm();
              } else {
                form?.requestSubmit();
              }
            }}
          />
        }
      >
        <CreatureForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
          saving={saving}
        />
      </Modal>

      {/* Edit Creature Modal */}
      {selectedCreature && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title={`Edit ${selectedCreature.name}`}
          footer={
            <CreatureFormFooter
              isEdit={true}
              saving={saving}
              onCancel={() => setShowEditModal(false)}
              onSubmit={() => {
                const form = document.querySelector('form') as HTMLFormElement & { submitForm?: () => void };
                if (form?.submitForm) {
                  form.submitForm();
                } else {
                  form?.requestSubmit();
                }
              }}
            />
          }
        >
          <CreatureForm
            initialValues={selectedCreature}
            isEdit
            onSubmit={handleUpdate}
            onCancel={() => setShowEditModal(false)}
            saving={saving}
          />
        </Modal>
      )}
    </div>
  );
}

