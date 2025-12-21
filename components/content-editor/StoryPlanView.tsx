// components/content-editor/StoryPlanView.tsx
// Main story planning view with Acts, Chapters, and Scenes
// Persists to Payload with versioning + autosave

"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  GripVertical,
  MoreHorizontal,
  Pencil,
  ChevronDown,
  ChevronRight,
  Tag,
  BookOpen,
  X,
  Loader2,
  Trash2,
} from "lucide-react";
import { SaveStatus } from "@lib/content-editor/types";

interface Scene {
  id: string;
  title: string;
  summary: string;
  codexRefs: { type: string; refId: string; label: string }[];
  labels: { label: string }[];
  order: number;
  _status?: string;
}

interface Chapter {
  id: string;
  title: string;
  scenes: Scene[];
  order: number;
  _status?: string;
}

interface Act {
  id: string;
  title: string;
  chapters: Chapter[];
  isExpanded: boolean;
  order: number;
  _status?: string;
}

interface StoryPlanViewProps {
  projectId: string;
  onSaveStatusChange?: (status: SaveStatus) => void;
  onLastSavedChange?: (date: Date) => void;
}

export function StoryPlanView({
  projectId,
  onSaveStatusChange,
  onLastSavedChange,
}: StoryPlanViewProps) {
  const [acts, setActs] = useState<Act[]>([]);
  const [loading, setLoading] = useState(true);

  const setSaveStatus = (status: SaveStatus) => {
    onSaveStatusChange?.(status);
  };

  const setLastSaved = (date: Date) => {
    onLastSavedChange?.(date);
  };

  // Fetch story structure on mount
  useEffect(() => {
    fetchStoryStructure();
    setSaveStatus(SaveStatus.Saved);
  }, [projectId]);

  const fetchStoryStructure = async () => {
    setLoading(true);
    try {
      // Fetch acts
      const actsRes = await fetch(
        `/api/payload/acts?where[project][equals]=${projectId}&sort=order`
      );
      const actsData = await actsRes.json();

      // Fetch chapters
      const chaptersRes = await fetch(
        `/api/payload/chapters?where[project][equals]=${projectId}&sort=order`
      );
      const chaptersData = await chaptersRes.json();

      // Fetch scenes
      const scenesRes = await fetch(
        `/api/payload/scenes?where[project][equals]=${projectId}&sort=order&limit=500`
      );
      const scenesData = await scenesRes.json();

      // Build nested structure
      const chaptersWithScenes = (chaptersData.docs || []).map((ch: any) => ({
        id: ch.id,
        title: ch.title,
        order: ch.order || 0,
        _status: ch._status,
        scenes: (scenesData.docs || [])
          .filter((sc: any) => sc.chapter === ch.id || sc.chapter?.id === ch.id)
          .map((sc: any) => ({
            id: sc.id,
            title: sc.title,
            summary: sc.summary || "",
            order: sc.order || 0,
            codexRefs: sc.codexRefs || [],
            labels: sc.labels || [],
            _status: sc._status,
          })),
      }));

      const actsWithChapters: Act[] = (actsData.docs || []).map((act: any) => ({
        id: act.id,
        title: act.title,
        order: act.order || 0,
        isExpanded: true,
        _status: act._status,
        chapters: chaptersWithScenes.filter(
          (ch: Chapter) =>
            (chaptersData.docs || []).find((c: any) => c.id === ch.id)?.act ===
              act.id ||
            (chaptersData.docs || []).find((c: any) => c.id === ch.id)?.act
              ?.id === act.id
        ),
      }));

      setActs(actsWithChapters.length > 0 ? actsWithChapters : []);
    } catch (error) {
      console.error("Failed to fetch story structure:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAct = (actId: string) => {
    setActs((prev) =>
      prev.map((act) =>
        act.id === actId ? { ...act, isExpanded: !act.isExpanded } : act
      )
    );
  };

  const deleteAct = async (actId: string) => {
    if (!confirm("Delete this act and all its chapters/scenes?")) return;
    setSaveStatus(SaveStatus.Saving);
    try {
      const res = await fetch(`/api/payload/acts/${actId}`, { method: "DELETE" });
      if (res.ok) {
        setActs((prev) => prev.filter((a) => a.id !== actId));
        setSaveStatus(SaveStatus.Saved);
        setLastSaved(new Date());
      } else {
        setSaveStatus(SaveStatus.Error);
      }
    } catch (error) {
      console.error("Failed to delete act:", error);
      setSaveStatus("error");
    }
  };

  const addAct = async () => {
    setSaveStatus(SaveStatus.Saving);
    try {
      const newOrder = acts.length;
      const res = await fetch("/api/payload/acts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: parseInt(projectId, 10),
          title: `Act ${acts.length + 1}`,
          order: newOrder,
        }),
      });
      const data = await res.json();
      const doc = data.doc || data;
      if (doc?.id) {
        setActs((prev) => [
          ...prev,
          {
            id: doc.id,
            title: doc.title,
            order: doc.order,
            isExpanded: true,
            chapters: [],
            _status: doc._status,
          },
        ]);
        setSaveStatus(SaveStatus.Saved);
        setLastSaved(new Date());
      } else {
        setSaveStatus(SaveStatus.Error);
      }
    } catch (error) {
      console.error("Failed to create act:", error);
      setSaveStatus("error");
    }
  };

  const addChapter = async (actId: string) => {
    setSaveStatus(SaveStatus.Saving);
    try {
      const act = acts.find((a) => a.id === actId);
      const newOrder = act?.chapters.length || 0;
      const res = await fetch("/api/payload/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: parseInt(projectId, 10),
          act: actId,
          title: `Chapter ${newOrder + 1}`,
          order: newOrder,
        }),
      });
      const data = await res.json();
      const doc = data.doc || data;
      if (doc?.id) {
        setActs((prev) =>
          prev.map((a) => {
            if (a.id !== actId) return a;
            return {
              ...a,
              chapters: [
                ...a.chapters,
                {
                  id: doc.id,
                  title: doc.title,
                  order: doc.order,
                  scenes: [],
                  _status: doc._status,
                },
              ],
            };
          })
        );
        setSaveStatus(SaveStatus.Saved);
        setLastSaved(new Date());
      } else {
        setSaveStatus(SaveStatus.Error);
      }
    } catch (error) {
      console.error("Failed to create chapter:", error);
      setSaveStatus("error");
    }
  };

  const addScene = async (actId: string, chapterId: string) => {
    setSaveStatus(SaveStatus.Saving);
    try {
      const act = acts.find((a) => a.id === actId);
      const chapter = act?.chapters.find((c) => c.id === chapterId);
      const newOrder = chapter?.scenes.length || 0;
      const res = await fetch("/api/payload/scenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: parseInt(projectId, 10),
          chapter: chapterId,
          title: `Scene ${newOrder + 1}`,
          summary: "",
          order: newOrder,
        }),
      });
      const data = await res.json();
      const doc = data.doc || data;
      if (doc?.id) {
        setActs((prev) =>
          prev.map((a) => {
            if (a.id !== actId) return a;
            return {
              ...a,
              chapters: a.chapters.map((ch) => {
                if (ch.id !== chapterId) return ch;
                return {
                  ...ch,
                  scenes: [
                    ...ch.scenes,
                    {
                      id: doc.id,
                      title: doc.title,
                      summary: doc.summary || "",
                      order: doc.order,
                      codexRefs: [],
                      labels: [],
                      _status: doc._status,
                    },
                  ],
                };
              }),
            };
          })
        );
        setSaveStatus(SaveStatus.Saved);
        setLastSaved(new Date());
      } else {
        setSaveStatus(SaveStatus.Error);
      }
    } catch (error) {
      console.error("Failed to create scene:", error);
      setSaveStatus("error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-ember-glow" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {acts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <BookOpen className="w-12 h-12 text-text-muted mb-4" />
          <h2 className="text-lg font-medium text-text-primary mb-2">
            No Story Structure Yet
          </h2>
          <p className="text-text-muted max-w-md mb-4">
            Start building your story by adding your first act.
          </p>
          <button
            onClick={addAct}
            className="px-4 py-2 bg-ember/20 border border-ember/30 rounded-lg text-ember-glow font-medium hover:bg-ember/30 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add First Act
          </button>
        </div>
      ) : (
        <>
          {acts.map((act) => (
            <div key={act.id} className="space-y-4">
              {/* Act Header */}
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-text-muted cursor-grab" />
                <button
                  onClick={() => toggleAct(act.id)}
                  className="p-1 hover:bg-shadow rounded transition-colors"
                >
                  {act.isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-text-muted" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-text-muted" />
                  )}
                </button>
                <h2 className="text-xl font-bold text-glow">{act.title}</h2>
                <button
                  onClick={() => addChapter(act.id)}
                  className="ml-2 px-3 py-1 bg-shadow border border-border rounded text-sm text-text-muted hover:border-ember/30 hover:text-ember-glow transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Chapter
                </button>
                <button className="p-1.5 hover:bg-shadow rounded transition-colors">
                  <Pencil className="w-3.5 h-3.5 text-text-muted" />
                </button>
                <button
                  onClick={() => deleteAct(act.id)}
                  className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-text-muted hover:text-red-400" />
                </button>
                <span className="ml-auto text-sm text-text-muted">
                  {act.chapters.length} chapter
                  {act.chapters.length !== 1 && "s"}
                </span>
              </div>

              {/* Chapters */}
              {act.isExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-8">
                  {act.chapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      className="bg-shadow border border-border rounded-lg overflow-hidden"
                    >
                      {/* Chapter Header */}
                      <div className="px-4 py-3 bg-deep/50 border-b border-border flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-text-muted cursor-grab" />
                        <span className="font-medium text-text-primary">
                          {chapter.title}
                        </span>
                        <button className="ml-auto p-1 hover:bg-shadow rounded transition-colors">
                          <Pencil className="w-3.5 h-3.5 text-text-muted" />
                        </button>
                        <button className="p-1 hover:bg-shadow rounded transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-text-muted" />
                        </button>
                      </div>

                      {/* Scenes */}
                      <div className="p-2 space-y-2">
                        {chapter.scenes.map((scene) => (
                          <div
                            key={scene.id}
                            className="p-3 bg-deep/30 rounded-lg border border-transparent hover:border-ember/20 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <GripVertical className="w-3.5 h-3.5 text-text-muted cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                              <span className="text-sm font-medium text-text-primary">
                                {scene.title}
                              </span>
                              <button className="ml-auto p-1 hover:bg-shadow rounded transition-colors opacity-0 group-hover:opacity-100">
                                <Pencil className="w-3 h-3 text-text-muted" />
                              </button>
                              <button className="p-1 hover:bg-shadow rounded transition-colors opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="w-3.5 h-3.5 text-text-muted" />
                              </button>
                            </div>

                            <p className="text-sm text-text-muted mb-3">
                              {scene.summary || "Add summary..."}
                            </p>

                            {/* Codex refs and labels */}
                            <div className="flex flex-wrap gap-1.5">
                              {scene.codexRefs.map((ref, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 text-xs bg-ember/10 text-ember-glow rounded flex items-center gap-1"
                                >
                                  {ref.label}
                                  <X className="w-3 h-3 cursor-pointer hover:text-ember" />
                                </span>
                              ))}
                              <button className="px-2 py-0.5 text-xs text-text-muted hover:text-ember-glow transition-colors flex items-center gap-1">
                                <Plus className="w-3 h-3" />
                                Codex
                              </button>
                              <button className="px-2 py-0.5 text-xs text-text-muted hover:text-ember-glow transition-colors flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                Label
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Add Scene button */}
                        <button
                          onClick={() => addScene(act.id, chapter.id)}
                          className="w-full py-2 text-sm text-text-muted hover:text-ember-glow hover:bg-ember/5 rounded transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          New Scene
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add Chapter placeholder */}
                  {act.chapters.length === 0 && (
                    <button
                      onClick={() => addChapter(act.id)}
                      className="h-32 border-2 border-dashed border-border rounded-lg text-text-muted hover:border-ember/30 hover:text-ember-glow transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Chapter
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Bottom Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <button
              onClick={addAct}
              className="px-4 py-2 bg-shadow border border-border rounded-lg text-text-muted hover:border-ember/30 hover:text-ember-glow transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Act
            </button>
            <button className="px-4 py-2 bg-shadow border border-border rounded-lg text-text-muted hover:border-ember/30 hover:text-ember-glow transition-colors flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Create from Outline
            </button>
          </div>
        </>
      )}
    </div>
  );
}
