// components/ai-stack/AutomationsTab.tsx
// Tab for n8n automations - provides quick access to n8n interface

"use client";

import { useState, useEffect } from "react";
import { RefreshCw, CheckCircle2, XCircle, AlertCircle, Cpu, Workflow, Box, Server, Database, ExternalLink, Info } from "lucide-react";

interface ServiceStatus {
  name: string;
  status: "running" | "stopped" | "error" | "unknown";
  url?: string;
  message?: string;
  version?: string;
  checkedUrls?: string[];
}

interface StatusResponse {
  services: ServiceStatus[];
  timestamp: string;
}

export default function AutomationsTab() {
  const [statuses, setStatuses] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"n8n" | "status">("n8n");

  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai-stack/status");
      if (response.ok) {
        const data: StatusResponse = await response.json();
        setStatuses(data.services);
      }
    } catch (error) {
      console.error("Error checking status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusLight = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "running":
        return <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />;
      case "stopped":
        return <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />;
      case "error":
        return <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50" />;
      default:
        return <div className="w-3 h-3 rounded-full bg-gray-500 shadow-lg shadow-gray-500/50" />;
    }
  };

  const getServiceIcon = (name: string) => {
    if (name.includes("Ollama")) return <Cpu className="w-4 h-4" />;
    if (name.includes("n8n")) return <Workflow className="w-4 h-4" />;
    if (name.includes("Qdrant")) return <Box className="w-4 h-4" />;
    if (name.includes("Docker")) return <Server className="w-4 h-4" />;
    if (name.includes("PostgreSQL")) return <Database className="w-4 h-4" />;
    if (name.includes("SQLite")) return <Database className="w-4 h-4" />;
    return <Server className="w-4 h-4" />;
  };

  return (
    <div className="h-full flex flex-col bg-deep">
      {/* Tabs */}
      <div className="border-b border-border bg-shadow px-6 py-2 flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => setView("n8n")}
          className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
            view === "n8n"
              ? "bg-ember text-white border-2 border-ember-glow"
              : "bg-deep text-text-secondary hover:text-ember-glow border-2 border-border"
          }`}
        >
          <span className="flex items-center gap-2">
            <Workflow className="w-4 h-4" />
            <span>n8n</span>
          </span>
        </button>
        <button
          onClick={() => setView("status")}
          className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
            view === "status"
              ? "bg-ember text-white border-2 border-ember-glow"
              : "bg-deep text-text-secondary hover:text-ember-glow border-2 border-border"
          }`}
        >
          <span className="flex items-center gap-2">
            <Server className="w-4 h-4" />
            <span>Status</span>
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
        {/* Main Content Area */}
        <div className="flex-1 relative overflow-hidden">
          {view === "n8n" ? (
            <div className="h-full overflow-y-auto p-6">
              <div className="max-w-3xl mx-auto">
                <div className="card-glow py-12">
                  <div className="text-center mb-8">
                    <Workflow className="w-16 h-16 text-ember-glow mx-auto mb-6 opacity-80" />
                    <h2 className="text-3xl font-bold text-glow mb-2">n8n Workflow Engine</h2>
                    <p className="text-text-secondary">Access n8n in a new browser tab</p>
                  </div>
                  
                  {/* Explanation - Prominent */}
                  <div className="bg-deep border-2 border-ember/30 rounded-lg p-6 mb-6">
                    <div className="flex items-start gap-3">
                      <Info className="w-6 h-6 text-ember-glow flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-glow mb-3 text-lg">Why Can't We Embed n8n Here?</h3>
                        <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
                          <p>
                            <strong className="text-ember-glow">n8n blocks iframe embedding</strong> for security reasons. 
                            The open-source version sends <code className="bg-shadow px-1 rounded">X-Frame-Options: DENY</code> headers 
                            that prevent the interface from loading inside an iframe.
                          </p>
                          <p>
                            <strong className="text-ember-glow">Commercial license required:</strong> To embed n8n directly in your 
                            application, you need the commercial "n8n Embed" license, which is designed for white-label integration 
                            in commercial products.
                          </p>
                          <p>
                            <strong className="text-ember-glow">Solution for non-commercial projects:</strong> Access n8n in a 
                            separate browser tab. Workflows can be managed directly in n8n's interface.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Launch Button - Prominent */}
                  <div className="text-center">
                    <button
                      onClick={() => window.open('http://localhost:5678', '_blank')}
                      className="px-8 py-4 bg-ember-glow text-black rounded-lg font-semibold hover:opacity-90 transition-all flex items-center gap-3 mx-auto text-lg shadow-lg shadow-ember-glow/30"
                    >
                      <ExternalLink className="w-6 h-6" />
                      Launch n8n in New Tab
                    </button>
                    
                    <p className="text-sm text-text-muted mt-3">
                      Opens http://localhost:5678 in a new browser window
                    </p>
                  </div>
                </div>

                {/* Quick Tips */}
                <div className="mt-8 card">
                  <h3 className="font-semibold text-glow mb-3">💡 Quick Tips</h3>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    <li className="flex items-start gap-2">
                      <span className="text-ember-glow">•</span>
                      <span>Workflows can be created and managed directly in n8n's interface</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-ember-glow">•</span>
                      <span>Use n8n for AI agents, RAG pipelines, and workflow automation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-ember-glow">•</span>
                      <span>Use n8n for AI agents, RAG pipelines, and workflow automation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto space-y-4">
                <h2 className="text-2xl font-bold text-glow mb-4">Service Status</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {statuses.map((service) => (
                    <div
                      key={service.name}
                      className="bg-shadow border border-border rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="text-ember-glow">
                            {getServiceIcon(service.name)}
                          </div>
                          <h3 className="font-semibold text-text-primary text-sm">{service.name}</h3>
                        </div>
                        {getStatusLight(service.status)}
                      </div>
                      <p className="text-xs text-text-secondary">{service.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Sidebar */}
        <div className="w-80 border-l border-border bg-shadow overflow-y-auto flex-shrink-0">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-glow">Quick Status</h3>
              <button
                onClick={checkStatus}
                disabled={loading}
                className="p-1.5 rounded text-text-muted hover:text-ember-glow hover:bg-deep transition-all disabled:opacity-50"
                title="Refresh Status"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
            <div className="space-y-2">
              {statuses.map((service) => (
                <div
                  key={service.name}
                  className="bg-deep border border-border rounded-lg p-3 hover:border-ember/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="text-ember-glow">
                        {getServiceIcon(service.name)}
                      </div>
                      <span className="text-sm font-medium text-text-primary">{service.name}</span>
                    </div>
                    {getStatusLight(service.status)}
                  </div>
                  <p className="text-xs text-text-muted line-clamp-2 mb-1">{service.message}</p>
                  {service.checkedUrls && service.checkedUrls.length > 0 && (
                    <details className="text-xs">
                      <summary className="text-ember-glow cursor-pointer hover:text-ember">
                        URLs checked ({service.checkedUrls.length})
                      </summary>
                      <div className="mt-1 space-y-0.5 pl-2">
                        {service.checkedUrls.map((url, idx) => (
                          <code key={idx} className="block text-[10px] text-text-muted break-all">
                            {url}
                          </code>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
