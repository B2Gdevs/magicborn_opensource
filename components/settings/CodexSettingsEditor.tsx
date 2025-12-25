// components/settings/CodexSettingsEditor.tsx
// Editor for project-level entry type display name overrides

"use client";

import { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";
import { EntryType } from "@lib/content-editor/constants";
import { getAllEntryTypes, getEntryConfig, getDisplayName } from "@lib/content-editor/entry-config";
import type { EntryTypeConfigs } from "@lib/content-editor/entry-type-config-types";

interface CodexSettingsEditorProps {
  projectId: string;
  magicbornMode: boolean;
  onSave?: () => void;
}

export function CodexSettingsEditor({ projectId, magicbornMode, onSave }: CodexSettingsEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form state: map of EntryType -> displayName
  const [displayNames, setDisplayNames] = useState<Partial<Record<EntryType, string>>>({});
  
  // Get all entry types (filtered by magicbornMode)
  const entryTypes = getAllEntryTypes(magicbornMode);

  // Load existing configs
  useEffect(() => {
    async function loadConfigs() {
      try {
        const response = await fetch(`/api/payload/projects/${projectId}`);
        if (response.ok) {
          const project = await response.json();
          const configs = project?.entryTypeConfigs as EntryTypeConfigs | undefined;
          
          // Initialize form state with current overrides (or empty for defaults)
          const initial: Partial<Record<EntryType, string>> = {};
          entryTypes.forEach((config) => {
            const override = configs?.[config.id]?.displayName;
            // Only set if there's an override (empty string means "use default")
            if (override) {
              initial[config.id] = override;
            }
          });
          setDisplayNames(initial);
        }
      } catch (err) {
        console.error("Failed to load codex settings:", err);
        setError("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }

    loadConfigs();
  }, [projectId, magicbornMode]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Build entryTypeConfigs object - only include entries with non-empty values
      const entryTypeConfigs: EntryTypeConfigs = {};
      
      entryTypes.forEach((config) => {
        const displayName = displayNames[config.id]?.trim();
        if (displayName && displayName !== config.displayName) {
          // Only include if different from default
          entryTypeConfigs[config.id] = { displayName };
        }
        // If empty string, don't include (will use default)
      });

      const response = await fetch(`/api/payload/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryTypeConfigs: Object.keys(entryTypeConfigs).length > 0 ? entryTypeConfigs : null,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onSave?.();
        }, 2000);
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Failed to save settings");
      }
    } catch (err) {
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleDisplayNameChange = (entryType: EntryType, value: string) => {
    setDisplayNames((prev) => ({
      ...prev,
      [entryType]: value,
    }));
  };

  const handleReset = (entryType: EntryType) => {
    setDisplayNames((prev) => {
      const next = { ...prev };
      delete next[entryType];
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-text-muted">Loading codex settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1 text-text-primary">Entry Type Display Names</h3>
        <div className="h-px bg-border mb-6" />
        <p className="text-sm text-text-secondary mb-6">
          Override the display names for entry types in this project. Leave empty to use defaults from code.
          <br />
          <span className="text-xs text-text-muted">
            Example: Change "Region" to "Location" to match your database column name.
          </span>
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
          Settings saved successfully!
        </div>
      )}

      <div className="space-y-4">
        {entryTypes.map((config) => {
          const entryType = config.id;
          const defaultDisplayName = config.displayName;
          const currentValue = displayNames[entryType] || "";
          const isOverridden = displayNames[entryType] !== undefined && displayNames[entryType] !== "";
          const effectiveDisplayName = getDisplayName(entryType, displayNames as EntryTypeConfigs);

          return (
            <div
              key={entryType}
              className="p-4 bg-deep/50 border border-border rounded-lg space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 flex items-center justify-center bg-deep rounded-lg">
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <label className="text-sm font-medium text-text-primary">
                        {defaultDisplayName}
                      </label>
                      {isOverridden && (
                        <span className="text-xs px-2 py-0.5 bg-ember/20 text-ember-glow rounded">
                          Overridden
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted">
                      Default: <span className="font-mono">{defaultDisplayName}</span>
                      {isOverridden && (
                        <>
                          {" • "}
                          Current: <span className="font-mono text-ember-glow">{effectiveDisplayName}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                {isOverridden && (
                  <button
                    onClick={() => handleReset(entryType)}
                    className="text-xs text-text-muted hover:text-text-primary transition-colors"
                    title="Reset to default"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div>
                <input
                  type="text"
                  value={currentValue}
                  onChange={(e) => handleDisplayNameChange(entryType, e.target.value)}
                  placeholder={`Enter custom display name (default: ${defaultDisplayName})`}
                  className="w-full px-3 py-2 bg-deep border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-ember-glow text-sm"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-6 border-t border-border">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-ember hover:bg-ember-glow text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4" />
              Save Codex Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}

