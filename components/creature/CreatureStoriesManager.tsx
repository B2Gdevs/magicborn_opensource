// components/creature/CreatureStoriesManager.tsx
// Component for managing creature stories - create, associate, remove
// Reuses CharacterStoriesManager logic but with creature client

"use client";

import { useState, useEffect, useRef } from "react";
import { BookOpen, Plus, X, Trash2, FileText, Upload } from "lucide-react";
import { creatureClient, storiesClient } from "@/lib/api/clients";
import type { CreatureDefinition } from "@/lib/data/creatures";
import Link from "next/link";
import { Tooltip } from "@components/ui/Tooltip";

interface CreatureStoriesManagerProps {
  creature: CreatureDefinition;
  onCreatureUpdate: (updated: CreatureDefinition) => void;
  saving: boolean;
}

export function CreatureStoriesManager({
  creature,
  onCreatureUpdate,
  saving,
}: CreatureStoriesManagerProps) {
  const [availableStories, setAvailableStories] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newStoryName, setNewStoryName] = useState("");
  const [newStoryContent, setNewStoryContent] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showAssociateModal, setShowAssociateModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadAvailableStories();
  }, []);

  const loadAvailableStories = async () => {
    try {
      const stories = await storiesClient.list();
      setAvailableStories(stories);
    } catch (error) {
      console.error("Failed to load stories:", error);
    }
  };

  const handleCreateStory = async () => {
    if (!newStoryName.trim() || !newStoryContent.trim()) {
      alert("Story name and content are required");
      return;
    }

    try {
      const response = await fetch("/api/files/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: `books/mordreds_legacy/stories/${newStoryName.trim()}.md`,
          type: "file",
          content: newStoryContent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create story file");
      }

      const updatedCreature: CreatureDefinition = {
        ...creature,
        storyIds: [...creature.storyIds, newStoryName.trim()],
      };

      await creatureClient.update(updatedCreature);
      onCreatureUpdate(updatedCreature);

      setNewStoryName("");
      setNewStoryContent("");
      setIsCreating(false);
      await loadAvailableStories();
    } catch (error) {
      console.error("Error creating story:", error);
      alert(`Failed to create story: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith(".md")) {
      alert("Please upload a markdown file (.md)");
      return;
    }

    const storyName = file.name.replace(".md", "");
    const content = await file.text();

    try {
      const response = await fetch("/api/files/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: `books/mordreds_legacy/stories/${file.name}`,
          type: "file",
          content,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create story file");
      }

      if (!creature.storyIds.includes(storyName)) {
        const updatedCreature: CreatureDefinition = {
          ...creature,
          storyIds: [...creature.storyIds, storyName],
        };
        await creatureClient.update(updatedCreature);
        onCreatureUpdate(updatedCreature);
      }

      await loadAvailableStories();
    } catch (error) {
      console.error("Error uploading story:", error);
      alert(`Failed to upload story: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleRemoveStory = async (storyId: string) => {
    if (!confirm(`Remove association with "${storyId}"? (The story file will remain.)`)) return;

    try {
      const updatedCreature: CreatureDefinition = {
        ...creature,
        storyIds: creature.storyIds.filter((id) => id !== storyId),
      };
      await creatureClient.update(updatedCreature);
      onCreatureUpdate(updatedCreature);
    } catch (error) {
      console.error("Error removing story:", error);
      alert(`Failed to remove story: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleAssociateStory = async (storyId: string) => {
    if (creature.storyIds.includes(storyId)) {
      return;
    }

    try {
      const updatedCreature: CreatureDefinition = {
        ...creature,
        storyIds: [...creature.storyIds, storyId],
      };
      await creatureClient.update(updatedCreature);
      onCreatureUpdate(updatedCreature);
      setShowAssociateModal(false);
    } catch (error) {
      console.error("Error associating story:", error);
      alert(`Failed to associate story: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const unassociatedStories = availableStories.filter(
    (story) => !creature.storyIds.includes(story)
  );

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-glow flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Stories
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="btn text-sm px-3 py-1"
          >
            <Plus className="w-4 h-4 mr-1" /> Create Story
          </button>
          {unassociatedStories.length > 0 && (
            <button
              onClick={() => setShowAssociateModal(true)}
              className="btn text-sm px-3 py-1"
            >
              <FileText className="w-4 h-4 mr-1" /> Associate
            </button>
          )}
        </div>
      </div>

      {/* Create Story Section */}
      {isCreating && (
        <div className="border border-border rounded-lg p-4 bg-deep space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Story Name (filename without .md)
            </label>
            <input
              type="text"
              value={newStoryName}
              onChange={(e) => setNewStoryName(e.target.value)}
              className="w-full px-3 py-2 bg-void border border-border rounded text-text-primary"
              placeholder="e.g., the-breath-between-footsteps"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              Story Content (Markdown)
            </label>
            <textarea
              ref={textareaRef}
              value={newStoryContent}
              onChange={(e) => setNewStoryContent(e.target.value)}
              className="w-full px-3 py-2 bg-void border border-border rounded text-text-primary min-h-[200px] font-mono text-sm"
              placeholder="Paste or type markdown content here..."
            />
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
              isDragging
                ? "border-ember-glow bg-ember/10"
                : "border-border hover:border-ember/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-text-muted" />
            <p className="text-sm text-text-secondary">
              Drag & drop a markdown file here or click to browse
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".md"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }
              }}
              className="hidden"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCreateStory}
              className="px-4 py-2 bg-ember hover:bg-ember-dark text-white rounded-lg font-semibold"
            >
              Create Story
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewStoryName("");
                setNewStoryContent("");
              }}
              className="px-4 py-2 bg-deep hover:bg-void border border-border rounded-lg font-semibold text-text-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Associated Stories List */}
      {creature.storyIds.length > 0 ? (
        <div className="space-y-2">
          {creature.storyIds.map((storyId) => (
            <div
              key={storyId}
              className="flex items-center justify-between p-3 bg-deep rounded border border-border"
            >
              <Link
                href={`/books/mordreds_legacy/stories/${storyId}`}
                className="flex items-center gap-2 text-ember-glow hover:text-ember-glow/80 flex-1"
              >
                <BookOpen className="w-4 h-4" />
                <span>{storyId}</span>
              </Link>
              <Tooltip content="Remove story association">
                <button
                  onClick={() => handleRemoveStory(storyId)}
                  className="text-text-muted hover:text-red-500 p-1 rounded"
                  aria-label="Remove story"
                  disabled={saving}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-text-muted text-sm">No stories associated with this creature.</p>
      )}

      {/* Associate Existing Stories Modal */}
      {showAssociateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-void border border-border rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-glow">Associate Existing Stories</h3>
              <Tooltip content="Close">
                <button
                  onClick={() => setShowAssociateModal(false)}
                  className="text-text-muted hover:text-text-primary"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </Tooltip>
            </div>
            <div className="space-y-2">
              {unassociatedStories.map((storyId) => (
                <button
                  key={storyId}
                  onClick={() => handleAssociateStory(storyId)}
                  className="w-full text-left p-3 bg-deep hover:bg-void rounded border border-border transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-ember-glow" />
                  <span className="text-text-primary">{storyId}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


