// components/ai-stack/ApiKeySetup.tsx
// Component for setting up n8n API key

"use client";

import { useState, useEffect } from "react";
import { Key, ExternalLink, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";

export default function ApiKeySetup() {
  const [apiKey, setApiKey] = useState("");
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  const checkApiKeyStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai-stack/n8n/api-key");
      if (response.ok) {
        const data = await response.json();
        setHasApiKey(data.hasApiKey);
      }
    } catch (err) {
      console.error("Error checking API key status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError("Please enter an API key");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/ai-stack/n8n/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      if (response.ok) {
        setSuccess(true);
        setApiKey("");
        await checkApiKeyStatus();
        // Clear success message after 3 seconds and trigger page refresh
        setTimeout(() => {
          setSuccess(false);
          // Trigger a page refresh to reload workflows
          window.location.reload();
        }, 1500);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to save API key");
      }
    } catch (err) {
      console.error("Error saving API key:", err);
      setError("Failed to save API key. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/ai-stack/n8n/api-key", {
        method: "DELETE",
      });

      if (response.ok) {
        setHasApiKey(false);
        setApiKey("");
        // Refresh page to show input form again
        window.location.reload();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to remove API key");
      }
    } catch (err) {
      console.error("Error removing API key:", err);
      setError("Failed to remove API key. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-ember-glow" />
      </div>
    );
  }

  // If API key is configured, show a small remove button only
  if (hasApiKey) {
    return (
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={handleRemove}
          disabled={saving}
          className="px-3 py-1.5 bg-deep border border-border rounded text-text-secondary hover:text-red-400 hover:border-red-400/50 transition-all disabled:opacity-50 text-sm flex items-center gap-2"
        >
          <XCircle className="w-4 h-4" />
          Remove API Key
        </button>
      </div>
    );
  }

  // Show input form when no API key
  return (
    <div className="bg-deep border-2 border-ember/30 rounded-lg p-6 mb-6">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-glow mb-2 flex items-center gap-2">
            <Key className="w-5 h-5 text-ember-glow" />
            n8n API Key Required
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            Get your API key from{" "}
            <a
              href="http://localhost:5678/settings/api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ember-glow hover:text-ember inline-flex items-center gap-1"
            >
              n8n API Settings
              <ExternalLink className="w-3 h-3" />
            </a>
            {" "}and paste it below.
          </p>
        </div>

        {error && (
          <div className="bg-red-400/20 border border-red-400/50 rounded p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-moss/20 border border-moss-glow/30 rounded p-3">
            <p className="text-sm text-moss-glow">✅ API key saved successfully!</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-glow mb-2">
            Paste Your API Key Here
          </label>
          <textarea
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Paste your n8n API key here (it will be a long string starting with 'eyJ...')"
            className="w-full px-4 py-3 bg-shadow border-2 border-ember/50 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-ember-glow focus:ring-2 focus:ring-ember-glow/30 font-mono text-sm min-h-[80px] resize-none"
            disabled={saving}
            autoFocus
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !apiKey.trim()}
          className="w-full px-6 py-3 bg-ember-glow text-black rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base shadow-lg shadow-ember-glow/30"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Key className="w-5 h-5" />
              Save API Key
            </>
          )}
        </button>
      </div>
    </div>
  );
}

