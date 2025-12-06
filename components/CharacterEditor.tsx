"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Trash2, Edit, ImageIcon, X, BookOpen, FileText } from "lucide-react";
import type { CharacterDefinition } from "@/lib/data/characters";
import { CharacterForm } from "@components/character/CharacterForm";
import { CharacterStoriesManager } from "@components/character/CharacterStoriesManager";
import { characterClient } from "@/lib/api/clients";
import { Tooltip } from "@components/ui/Tooltip";

export default function CharacterEditor() {
  const [characters, setCharacters] = useState<CharacterDefinition[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterDefinition | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "stories">("details");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadCharacters() {
      try {
        const loadedCharacters = await characterClient.list();
        setCharacters(loadedCharacters);
      } catch (error) {
        console.error("Failed to load characters:", error);
        setCharacters([]);
      } finally {
        setLoading(false);
      }
    }
    loadCharacters();
  }, []);

  const handleUpdate = async (updatedCharacter: CharacterDefinition) => {
    setSaving(true);
    try {
      await characterClient.update(updatedCharacter);
      
      const refreshedCharacters = await characterClient.list();
      setCharacters(refreshedCharacters);
      setSelectedCharacter(updatedCharacter);
      
      setShowEditModal(false);
    } catch (error) {
      console.error("Error saving character:", error);
      alert(`Failed to save character: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (character: CharacterDefinition) => {
    if (!confirm(`Delete ${character.name}?`)) return;
    
    setSaving(true);
    try {
      await characterClient.delete(character.id);
      
      const refreshedCharacters = await characterClient.list();
      setCharacters(refreshedCharacters);
      
      if (selectedCharacter?.id === character.id) {
        setSelectedCharacter(null);
      }
    } catch (error) {
      console.error("Error deleting character:", error);
      alert(`Failed to delete character: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (newCharacter: CharacterDefinition) => {
    setSaving(true);
    try {
      await characterClient.create(newCharacter);
      
      const refreshedCharacters = await characterClient.list();
      setCharacters(refreshedCharacters);
      
      setShowCreateModal(false);
      setSelectedCharacter(newCharacter);
    } catch (error) {
      console.error("Error creating character:", error);
      alert(`Failed to create character: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-text-muted">Loading characters...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Modals */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-void border border-border rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <Tooltip content="Close">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 text-text-muted hover:text-text-primary"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </Tooltip>
            <h2 className="text-2xl font-bold text-glow mb-4">Create New Character</h2>
            <CharacterForm
              existingCharacters={characters}
              onSubmit={handleCreate}
              onCancel={() => setShowCreateModal(false)}
              saving={saving}
            />
          </div>
        </div>
      )}

      {showEditModal && selectedCharacter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-void border border-border rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <Tooltip content="Close">
              <button
                onClick={() => setShowEditModal(false)}
                className="absolute top-4 right-4 text-text-muted hover:text-text-primary"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </Tooltip>
            <h2 className="text-2xl font-bold text-glow mb-4">Edit Character</h2>
            <CharacterForm
              initialValues={selectedCharacter}
              existingCharacters={characters}
              isEdit={true}
              onSubmit={handleUpdate}
              onCancel={() => setShowEditModal(false)}
              saving={saving}
            />
          </div>
        </div>
      )}

      <div className="flex h-full gap-4 overflow-hidden">
        {/* Character List */}
        <div className="w-1/3 border-r border-border bg-shadow flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
            <h2 className="text-xl font-bold text-glow">Characters</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn text-sm px-3 py-1"
            >
              + New Character
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {characters.map((character) => (
                <div
                  key={character.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${
                    selectedCharacter?.id === character.id
                      ? "border-ember-glow bg-deep"
                      : "border-border hover:border-ember/50"
                  }`}
                  onClick={() => setSelectedCharacter(character)}
                >
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-void border border-border">
                    {character.imagePath ? (
                      <Image
                        src={character.imagePath}
                        alt={character.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-text-muted absolute inset-0 m-auto" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-ember-glow">{character.name}</h3>
                    <p className="text-sm text-text-secondary line-clamp-1">
                      {character.description}
                    </p>
                    <div className="flex gap-2 mt-1 text-xs text-text-muted">
                      <span>HP: {character.hp}/{character.maxHp}</span>
                      <span>Mana: {character.mana}/{character.maxMana}</span>
                    </div>
                  </div>
                  <Tooltip content="Delete character">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(character);
                      }}
                      className="text-text-muted hover:text-red-500 p-1 rounded"
                      aria-label="Delete character"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </Tooltip>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Character Detail View */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedCharacter ? (
            <div className="flex flex-col h-full">
              {/* Minimal Toolbar */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-shadow/50 flex-shrink-0">
                <h2 className="text-xl font-semibold text-glow">{selectedCharacter.name}</h2>
                <div className="flex items-center gap-1">
                  <Tooltip content="View character details">
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
                  <Tooltip content="Edit character">
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
                    {selectedCharacter.imagePath ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-deep">
                        <Image
                          src={selectedCharacter.imagePath}
                          alt={selectedCharacter.name}
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
                  <p className="text-text-primary whitespace-pre-wrap">{selectedCharacter.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-1">
                      HP
                    </label>
                    <p className="text-text-primary">{selectedCharacter.hp} / {selectedCharacter.maxHp}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-1">
                      Mana
                    </label>
                    <p className="text-text-primary">{selectedCharacter.mana} / {selectedCharacter.maxMana}</p>
                  </div>
                </div>

                {Object.keys(selectedCharacter.affinity).length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-1">
                      Rune Familiarity
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedCharacter.affinity).map(([rune, value]) => (
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

                {selectedCharacter.elementXp && Object.keys(selectedCharacter.elementXp).length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-1">
                      Element XP
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedCharacter.elementXp).map(([type, value]) => (
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

                {selectedCharacter.elementAffinity && Object.keys(selectedCharacter.elementAffinity).length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-1">
                      Element Affinity
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedCharacter.elementAffinity).map(([type, value]) => (
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

                {(selectedCharacter.controlBonus !== undefined || selectedCharacter.costEfficiency !== undefined) && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedCharacter.controlBonus !== undefined && (
                      <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-1">
                          Control Bonus
                        </label>
                        <p className="text-text-primary">{selectedCharacter.controlBonus}</p>
                      </div>
                    )}
                    {selectedCharacter.costEfficiency !== undefined && (
                      <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-1">
                          Cost Efficiency
                        </label>
                        <p className="text-text-primary">{selectedCharacter.costEfficiency}</p>
                      </div>
                    )}
                  </div>
                )}
                    </div>
                  </div>
                ) : (
                  <CharacterStoriesManager
                    character={selectedCharacter}
                    onCharacterUpdate={(updated) => {
                      setSelectedCharacter(updated);
                      // Refresh the list
                      characterClient.list().then(setCharacters).catch(console.error);
                    }}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-text-muted">
              Select a character to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

