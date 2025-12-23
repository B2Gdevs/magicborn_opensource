// components/content-editor/VersionHistoryModal.tsx
// Comprehensive version history modal with entity + project snapshots

"use client";

import { useState, useEffect } from "react";
import {
  X,
  History,
  Loader2,
  RotateCcw,
  ChevronRight,
  Camera,
  Clock,
  GitBranch,
  Check,
  FileText,
  User,
  MapPin,
} from "lucide-react";

interface VersionEntry {
  id: string;
  updatedAt: string;
  version: {
    title?: string;
    name?: string;
  };
  parent?: string;
}

interface ProjectSnapshot {
  id: string;
  name: string;
  description?: string;
  type: "draft" | "published" | "checkpoint";
  createdAt: string;
}

interface VersionHistoryModalProps {
  projectId: string;
  onClose: () => void;
  onRestore?: (snapshotId: string) => void;
}

type TabType = "snapshots" | "acts" | "chapters" | "scenes" | "characters";

export function VersionHistoryModal({
  projectId,
  onClose,
  onRestore,
}: VersionHistoryModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("snapshots");
  const [loading, setLoading] = useState(true);
  const [snapshots, setSnapshots] = useState<ProjectSnapshot[]>([]);
  const [entityVersions, setEntityVersions] = useState<{
    acts: VersionEntry[];
    chapters: VersionEntry[];
    scenes: VersionEntry[];
    characters: VersionEntry[];
  }>({
    acts: [],
    chapters: [],
    scenes: [],
    characters: [],
  });
  const [creatingSnapshot, setCreatingSnapshot] = useState(false);
  const [snapshotName, setSnapshotName] = useState("");

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch project snapshots
      const snapshotsRes = await fetch(
        `/api/payload/project-snapshots?where[project][equals]=${projectId}&limit=50&sort=-createdAt`
      );
      const snapshotsData = await snapshotsRes.json();
      setSnapshots(snapshotsData.docs || []);

      // Fetch entity versions (similar to before)
      const [actsRes, chaptersRes, scenesRes, charsRes] = await Promise.all([
        fetch(`/api/payload/acts?where[project][equals]=${projectId}&limit=100`),
        fetch(`/api/payload/chapters?where[project][equals]=${projectId}&limit=100`),
        fetch(`/api/payload/scenes?where[project][equals]=${projectId}&limit=100`),
        fetch(`/api/payload/characters?where[project][equals]=${projectId}&limit=100`),
      ]);
      const [actsData, chaptersData, scenesData, charsData] = await Promise.all([
        actsRes.json(),
        chaptersRes.json(),
        scenesRes.json(),
        charsRes.json(),
      ]);

      // Fetch versions for each
      const fetchVersionsFor = async (collection: string, docs: any[]) => {
        const versionPromises = docs.map((doc) =>
          fetch(`/api/payload/${collection}/${doc.id}/versions`).then((r) =>
            r.json()
          )
        );
        const results = await Promise.all(versionPromises);
        return results.flatMap((v) => v.docs || []);
      };

      const [actVersions, chapterVersions, sceneVersions, charVersions] =
        await Promise.all([
          fetchVersionsFor("acts", actsData.docs || []),
          fetchVersionsFor("chapters", chaptersData.docs || []),
          fetchVersionsFor("scenes", scenesData.docs || []),
          fetchVersionsFor("characters", charsData.docs || []),
        ]);

      setEntityVersions({
        acts: actVersions,
        chapters: chapterVersions,
        scenes: sceneVersions,
        characters: charVersions,
      });
    } catch (error) {
      console.error("Failed to fetch version data:", error);
    } finally {
      setLoading(false);
    }
  };

  const createSnapshot = async (type: "checkpoint" | "published") => {
    if (!snapshotName.trim()) return;
    setCreatingSnapshot(true);
    try {
      // Fetch all current content
      const [actsRes, chaptersRes, scenesRes, charsRes] = await Promise.all([
        fetch(`/api/payload/acts?where[project][equals]=${projectId}&limit=500`),
        fetch(`/api/payload/chapters?where[project][equals]=${projectId}&limit=500`),
        fetch(`/api/payload/scenes?where[project][equals]=${projectId}&limit=500`),
        fetch(`/api/payload/characters?where[project][equals]=${projectId}&limit=500`),
      ]);
      const [acts, chapters, scenes, characters] = await Promise.all([
        actsRes.json(),
        chaptersRes.json(),
        scenesRes.json(),
        charsRes.json(),
      ]);

      const snapshot = {
        acts: acts.docs || [],
        chapters: chapters.docs || [],
        scenes: scenes.docs || [],
        characters: characters.docs || [],
        timestamp: new Date().toISOString(),
      };

      await fetch("/api/payload/project-snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: parseInt(projectId, 10),
          name: snapshotName,
          type,
          snapshot,
        }),
      });

      setSnapshotName("");
      fetchData();
    } catch (error) {
      console.error("Failed to create snapshot:", error);
    } finally {
      setCreatingSnapshot(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: typeof History }[] = [
    { id: "snapshots", label: "Project Snapshots", icon: Camera },
    { id: "acts", label: "Acts", icon: FileText },
    { id: "chapters", label: "Chapters", icon: FileText },
    { id: "scenes", label: "Scenes", icon: FileText },
    { id: "characters", label: "Characters", icon: User },
  ];

  const renderVersionList = (versions: VersionEntry[]) => {
    if (versions.length === 0) {
      return (
        <p className="text-text-muted text-center py-8">
          No version history. Versions are created when you edit content.
        </p>
      );
    }
    return (
      <div className="space-y-2">
        {versions.map((v) => (
          <div
            key={v.id}
            className="flex items-center justify-between p-3 bg-deep rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-text-muted" />
              <div>
                <span className="text-text-primary">
                  {v.version?.title || v.version?.name || "Untitled"}
                </span>
                <span className="ml-2 text-sm text-text-muted">
                  {new Date(v.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
            <button className="p-1.5 hover:bg-shadow rounded text-text-muted hover:text-ember-glow transition-colors">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-shadow border border-border rounded-lg w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-glow flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Version History
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-deep rounded transition-colors"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-ember-glow text-ember-glow"
                  : "border-transparent text-text-muted hover:text-text-primary"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id !== "snapshots" && entityVersions[tab.id]?.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-deep rounded">
                  {entityVersions[tab.id].length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-ember-glow" />
            </div>
          ) : activeTab === "snapshots" ? (
            <div className="space-y-6">
              {/* Create Snapshot */}
              <div className="p-4 bg-deep rounded-lg border border-border">
                <h3 className="text-sm font-medium text-text-primary mb-3">
                  Create Project Snapshot
                </h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={snapshotName}
                    onChange={(e) => setSnapshotName(e.target.value)}
                    placeholder="Snapshot name (e.g., 'Before major rewrite')"
                    className="flex-1 px-3 py-2 bg-shadow border border-border rounded text-text-primary placeholder-text-muted focus:outline-none focus:border-ember-glow"
                  />
                  <button
                    onClick={() => createSnapshot("checkpoint")}
                    disabled={!snapshotName.trim() || creatingSnapshot}
                    className="px-4 py-2 bg-ember/20 border border-ember/30 rounded text-ember-glow font-medium hover:bg-ember/30 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {creatingSnapshot ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                    Save Checkpoint
                  </button>
                  <button
                    onClick={() => createSnapshot("published")}
                    disabled={!snapshotName.trim() || creatingSnapshot}
                    className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded text-green-400 font-medium hover:bg-green-500/30 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Publish
                  </button>
                </div>
              </div>

              {/* Snapshots List */}
              {snapshots.length === 0 ? (
                <p className="text-text-muted text-center py-8">
                  No project snapshots yet. Create a checkpoint to save the
                  current state of all content.
                </p>
              ) : (
                <div className="space-y-2">
                  {snapshots.map((snap) => (
                    <div
                      key={snap.id}
                      className="flex items-center justify-between p-4 bg-deep rounded-lg border border-border hover:border-ember/20 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-lg ${
                            snap.type === "published"
                              ? "bg-green-500/20"
                              : snap.type === "draft"
                              ? "bg-amber-500/20"
                              : "bg-ember/20"
                          }`}
                        >
                          {snap.type === "published" ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Camera className="w-4 h-4 text-ember-glow" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-text-primary">
                              {snap.name}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-xs rounded ${
                                snap.type === "published"
                                  ? "bg-green-500/20 text-green-400"
                                  : snap.type === "draft"
                                  ? "bg-amber-500/20 text-amber-400"
                                  : "bg-ember/20 text-ember-glow"
                              }`}
                            >
                              {snap.type}
                            </span>
                          </div>
                          <span className="text-sm text-text-muted">
                            {new Date(snap.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => onRestore?.(snap.id)}
                        className="px-3 py-1.5 text-sm bg-shadow border border-border rounded text-text-muted hover:border-ember/30 hover:text-ember-glow transition-colors flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            renderVersionList(entityVersions[activeTab] || [])
          )}
        </div>
      </div>
    </div>
  );
}



