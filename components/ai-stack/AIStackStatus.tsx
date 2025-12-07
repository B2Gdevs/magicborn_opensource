// components/ai-stack/AIStackStatus.tsx
// Component to display and manage AI stack service statuses

"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink,
  Download,
  Database,
  Cpu,
  Workflow,
  Box,
  Server
} from "lucide-react";

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

export default function AIStackStatus() {
  const [statuses, setStatuses] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai-stack/status");
      if (response.ok) {
        const data: StatusResponse = await response.json();
        setStatuses(data.services);
        setLastChecked(new Date(data.timestamp));
      } else {
        console.error("Failed to fetch status");
      }
    } catch (error) {
      console.error("Error checking status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    // Auto-refresh every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "running":
        return <CheckCircle2 className="w-5 h-5 text-moss-glow" />;
      case "stopped":
        return <XCircle className="w-5 h-5 text-red-400" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-text-muted" />;
    }
  };

  const getStatusColor = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "running":
        return "border-moss/50 bg-moss/10";
      case "stopped":
        return "border-red-400/50 bg-red-400/10";
      case "error":
        return "border-amber-500/50 bg-amber-500/10";
      default:
        return "border-border bg-deep";
    }
  };

  const getServiceIcon = (name: string) => {
    if (name.includes("Ollama")) return <Cpu className="w-5 h-5" />;
    if (name.includes("n8n")) return <Workflow className="w-5 h-5" />;
    if (name.includes("Qdrant")) return <Box className="w-5 h-5" />;
    if (name.includes("Docker")) return <Server className="w-5 h-5" />;
    if (name.includes("PostgreSQL")) return <Database className="w-5 h-5" />;
    if (name.includes("SQLite")) return <Database className="w-5 h-5" />;
    return <Server className="w-5 h-5" />;
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-glow mb-2">AI Stack Status</h2>
            <p className="text-text-secondary text-sm">
              Monitor and manage your local AI development stack
            </p>
          </div>
          <button
            onClick={checkStatus}
            disabled={loading}
            className="px-4 py-2 bg-ember-glow text-black rounded font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Status Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {statuses.map((service) => (
            <div
              key={service.name}
              className={`border-2 rounded-lg p-4 ${getStatusColor(service.status)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-ember-glow">
                    {getServiceIcon(service.name)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">{service.name}</h3>
                    {service.version && (
                      <p className="text-xs text-text-muted">{service.version}</p>
                    )}
                  </div>
                </div>
                {getStatusIcon(service.status)}
              </div>
              
              <p className="text-sm text-text-secondary mb-3">{service.message}</p>
              
              {/* Checked URLs */}
              {service.checkedUrls && service.checkedUrls.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-text-muted mb-1">Checked URLs:</p>
                  <div className="space-y-1">
                    {service.checkedUrls.map((url, idx) => (
                      <code key={idx} className="block text-xs bg-deep border border-border rounded px-2 py-1 text-ember-glow break-all">
                        {url}
                      </code>
                    ))}
                  </div>
                </div>
              )}
              
              {service.url && (
                <div className="flex items-center gap-2">
                  {service.status === "running" ? (
                    <a
                      href={service.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-ember-glow hover:text-ember flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open {service.name}
                    </a>
                  ) : (
                    <a
                      href={service.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-ember-glow hover:text-ember flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Download {service.name}
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Setup Instructions */}
        <div className="card-glow mt-6">
          <h3 className="text-xl font-bold text-glow mb-4">Setup Instructions</h3>
          <div className="space-y-4 text-text-secondary">
            <div>
              <h4 className="font-semibold text-ember-glow mb-2">1. Install Ollama</h4>
              <p className="text-sm mb-2">
                Download and install Ollama from{" "}
                <a
                  href="https://ollama.com/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ember-glow hover:text-ember underline"
                >
                  ollama.com/download
                </a>
              </p>
              <p className="text-sm mb-2">Then pull the required models:</p>
              <code className="block bg-deep border border-border rounded p-2 text-xs">
                ollama pull llama3<br />
                ollama pull nomic-embed-text
              </code>
            </div>
            
            <div>
              <h4 className="font-semibold text-ember-glow mb-2">2. Install Docker Desktop</h4>
              <p className="text-sm mb-2">
                Download Docker Desktop from{" "}
                <a
                  href="https://www.docker.com/products/docker-desktop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ember-glow hover:text-ember underline"
                >
                  docker.com/products/docker-desktop
                </a>
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-ember-glow mb-2">3. Start the Stack</h4>
              <p className="text-sm mb-2">Start Ollama in a terminal:</p>
              <code className="block bg-deep border border-border rounded p-2 text-xs">
                ollama serve
              </code>
              <p className="text-sm mt-2 mb-2">Then start Docker services:</p>
              <code className="block bg-deep border border-border rounded p-2 text-xs">
                cd infra/ai-stack<br />
                docker compose up
              </code>
            </div>
          </div>
        </div>

        {/* Last Checked */}
        {lastChecked && (
          <p className="text-xs text-text-muted text-center mt-4">
            Last checked: {lastChecked.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}

