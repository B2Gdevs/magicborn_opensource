// components/ai-stack/LMStudioModelManager.tsx
// Component to manage LM Studio models - list, load, and view available models

"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Download, Loader2, CheckCircle2, XCircle, AlertCircle, Database, ExternalLink, Search, X, Copy, Check } from "lucide-react";

interface Model {
  id: string;
  name?: string;
  object?: string;
  created?: number;
  owned_by?: string;
  // Enhanced API fields
  loading_state?: string;
  type?: string;
  architecture?: string;
  quantization?: string;
  max_context_length?: number;
}

interface ModelsResponse {
  data: Model[];
}

interface SearchResult {
  id: string;
  name: string;
  author: string;
  downloads: number;
  likes: number;
  tags: string[];
  identifier: string;
}

export default function LMStudioModelManager() {
  const [loadedModels, setLoadedModels] = useState<Model[]>([]);
  const [availableModels, setAvailableModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingModel, setLoadingModel] = useState<string | null>(null);
  const [downloadingModel, setDownloadingModel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  
  const [popularModels, setPopularModels] = useState<SearchResult[]>([]);

  const fetchModels = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch loaded models (OpenAI-compatible endpoint)
      const loadedResponse = await fetch("/api/ai-stack/lmstudio/v1/models");
      const loadedData = await loadedResponse.json();

      if (loadedData.data?.data) {
        setLoadedModels(loadedData.data.data || []);
      } else {
        setLoadedModels([]);
      }

      // Fetch available models (Enhanced API endpoint)
      try {
        const availableResponse = await fetch("/api/ai-stack/lmstudio/api/v0/models");
        const availableData = await availableResponse.json();

        if (availableData.data?.data) {
          setAvailableModels(availableData.data.data || []);
        } else {
          setAvailableModels([]);
        }
      } catch (e) {
        // Enhanced endpoint might not be available, that's okay
        console.log("Enhanced models endpoint not available");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch models");
      setLoadedModels([]);
      setAvailableModels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
    // Fetch recommended models from LM Studio catalog immediately
    // Show these before any search to avoid empty state
    fetch("/api/ai-stack/lmstudio/models/catalog?limit=30")
      .then((res) => res.json())
      .then((data) => {
        if (data.models && data.models.length > 0) {
          setPopularModels(data.models);
          setSearchResults(data.models); // Show recommended models immediately
        }
      })
      .catch((err) => {
        console.error("Failed to fetch catalog models:", err);
        // Fallback to empty array
        setPopularModels([]);
        setSearchResults([]);
      });
  }, []);

  // Debounced search - 2 second delay
  useEffect(() => {
    if (!searchQuery.trim()) {
      // If search is empty, show popular models
      setSearchResults(popularModels);
      return;
    }

    const searchModels = async () => {
      setSearching(true);
      setError(null);

      try {
        // Try LM Studio catalog first, fallback to Hugging Face
        const catalogResponse = await fetch(`/api/ai-stack/lmstudio/models/catalog?q=${encodeURIComponent(searchQuery)}&limit=20`);
        const catalogData = await catalogResponse.json();

        if (catalogData.models && catalogData.models.length > 0) {
          setSearchResults(catalogData.models);
        } else {
          // Fallback to Hugging Face search
          const hfResponse = await fetch(`/api/ai-stack/lmstudio/models/search?q=${encodeURIComponent(searchQuery)}&limit=20`);
          const hfData = await hfResponse.json();

          if (hfData.error) {
            setError(hfData.error);
            setSearchResults([]);
          } else {
            setSearchResults(hfData.models || []);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to search models");
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    };

    const timeoutId = setTimeout(() => {
      searchModels();
    }, 500); // 500ms debounce for faster search

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const downloadModel = async (modelIdentifier: string) => {
    setDownloadingModel(modelIdentifier);
    setError(null);

    try {
      const response = await fetch("/api/ai-stack/lmstudio/models/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ modelIdentifier }),
      });

      const data = await response.json();

      // If it's a 501, it means automatic download isn't available
      // Show the manual command instead of treating it as an error
      if (response.status === 501 && data.manualCommand) {
        setError(
          `Automatic download requires host access.\n\n` +
          `Run this command on your host machine:\n\n` +
          `\`${data.manualCommand}\`\n\n` +
          `After downloading, refresh the model list.`
        );
        setDownloadingModel(null);
        return;
      }

      if (data.error && !data.manualCommand) {
        throw new Error(data.error);
      }

      // Show success message
      setError(null);
      
      // Refresh models list after a delay (download takes time)
      setTimeout(() => {
        fetchModels();
        setDownloadingModel(null);
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to download model";
      setError(errorMessage);
      setDownloadingModel(null);
    }
  };

  const loadModel = async (modelId: string) => {
    setLoadingModel(modelId);
    setError(null);

    try {
      // Try to load model via API - this might not be available in all LM Studio versions
      // We'll try a POST to /api/v0/models/{model}/load if it exists
      const response = await fetch(`/api/ai-stack/lmstudio/api/v0/models/${encodeURIComponent(modelId)}/load`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok || data.data) {
        // Refresh models list
        setTimeout(() => {
          fetchModels();
          setLoadingModel(null);
        }, 1000);
      } else {
        throw new Error(data.error?.message || "Failed to load model");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load model. You may need to load it manually in LM Studio.");
      setLoadingModel(null);
    }
  };

  const getModelDisplayName = (model: Model) => {
    return model.name || model.id || "Unknown Model";
  };

  const getModelStatus = (model: Model) => {
    if (model.loading_state === "loaded" || loadedModels.some((m) => m.id === model.id)) {
      return "loaded";
    }
    if (model.loading_state === "loading") {
      return "loading";
    }
    return "available";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "loaded":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "loading":
        return <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />;
      default:
        return <Database className="w-4 h-4 text-text-muted" />;
    }
  };

  const allModels = availableModels.length > 0 
    ? availableModels 
    : loadedModels.length > 0 
    ? loadedModels 
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Model Manager</h3>
        <button
          onClick={fetchModels}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-deep border border-border rounded-lg hover:border-ember/30 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Search for Models */}
      <div className="p-4 bg-deep/50 border border-border rounded-lg">
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for models (e.g., 'llama', 'mistral', 'phi') or browse popular models below"
              className="w-full pl-10 pr-3 py-2 bg-deep border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:border-ember-glow"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {searching && (
            <div className="flex items-center px-3">
              <Loader2 className="w-4 h-4 animate-spin text-ember-glow" />
            </div>
          )}
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-text-secondary">
                {searchQuery.trim() ? `Search Results (${searchResults.length})` : `Recommended Models (${searchResults.length})`}
              </h4>
              {searching && (
                <Loader2 className="w-4 h-4 animate-spin text-ember-glow" />
              )}
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {searchResults.map((result) => {
                  const isDownloading = downloadingModel === result.identifier;
                  const isDownloaded = allModels.some((m) => m.id === result.identifier);

                  return (
                    <div
                      key={result.id}
                      className="p-3 bg-deep border border-border rounded-lg hover:border-ember/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-text-primary text-sm truncate">
                            {result.name}
                          </h5>
                          <p className="text-xs text-text-muted mt-1">
                            by {result.author} • {result.downloads.toLocaleString()} downloads
                          </p>
                          <code className="block text-ember-glow text-xs mt-1 break-all">
                            {result.identifier}
                          </code>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <button
                            onClick={() => downloadModel(result.identifier)}
                            disabled={isDownloading || isDownloaded}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-ember hover:bg-ember-glow text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isDownloading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Downloading...
                              </>
                            ) : isDownloaded ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                Downloaded
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4" />
                                Download
                              </>
                            )}
                          </button>
                          {!isDownloaded && (
                            <div className="flex items-center gap-2 p-2 bg-deep/50 border border-border rounded text-xs">
                              <code className="text-text-muted text-right max-w-[180px] break-all">
                                docker exec lmstudio lms get "{result.identifier}"
                              </code>
                              <button
                                onClick={() => {
                                  const cmd = `docker exec lmstudio lms get "${result.identifier}"`;
                                  navigator.clipboard.writeText(cmd);
                                  setCopiedCommand(result.identifier);
                                  setTimeout(() => setCopiedCommand(null), 2000);
                                }}
                                className="text-ember-glow hover:text-ember transition-colors flex-shrink-0"
                                title="Copy command"
                              >
                                {copiedCommand === result.identifier ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Downloaded Models */}
      <div>
        <h4 className="text-sm font-semibold text-text-secondary mb-3">Downloaded Models</h4>
        {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
        </div>
        ) : allModels.length === 0 ? (
          <div className="p-4 bg-deep/50 border border-border rounded-lg">
            <p className="text-sm text-text-muted text-center">
              No models found. Search and download models above.
            </p>
          </div>
        ) : (
        <div className="space-y-2">
          {allModels.map((model) => {
            const status = getModelStatus(model);
            const displayName = getModelDisplayName(model);
            const isCurrentlyLoading = loadingModel === model.id;

            return (
              <div
                key={model.id}
                className="p-4 bg-deep/50 border border-border rounded-lg hover:border-ember/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(status)}
                      <h4 className="font-semibold text-text-primary truncate">{displayName}</h4>
                      {status === "loaded" && (
                        <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded border border-green-500/30">
                          Loaded
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-xs text-text-muted">
                      <div className="flex items-center gap-4">
                        {model.architecture && (
                          <span>Architecture: {model.architecture}</span>
                        )}
                        {model.quantization && (
                          <span>Quantization: {model.quantization}</span>
                        )}
                        {model.max_context_length && (
                          <span>Context: {model.max_context_length.toLocaleString()}</span>
                        )}
                      </div>
                      {model.owned_by && (
                        <span>Owner: {model.owned_by}</span>
                      )}
                      {model.id && (
                        <code className="block text-ember-glow text-xs mt-1 break-all">
                          {model.id}
                        </code>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {status !== "loaded" && (
                      <button
                        onClick={() => loadModel(model.id)}
                        disabled={isCurrentlyLoading || loadingModel !== null}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-ember hover:bg-ember-glow text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCurrentlyLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            Load Model
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-deep/50 border border-border rounded-lg">
        <p className="text-xs text-text-muted">
          <AlertCircle className="w-3 h-3 inline mr-1" />
          <strong>Note:</strong> Model downloads happen in the Docker container and may take several minutes for large models. 
          Check Docker logs with <code className="text-ember-glow">docker logs lmstudio</code> to monitor progress.
        </p>
      </div>
    </div>
  );
}

