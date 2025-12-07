// components/ai-stack/WorkflowExporter.tsx
// Component to list and export n8n workflows

"use client";

import { useState, useEffect } from "react";
import { Workflow, Download, RefreshCw, ExternalLink, CheckCircle2, Clock, XCircle } from "lucide-react";
import ApiKeySetup from "./ApiKeySetup";

interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: Array<{ id: string; name: string }>;
}

interface WorkflowListResponse {
  workflows?: N8nWorkflow[];
  data?: N8nWorkflow[];
  error?: string;
  details?: string;
  suggestion?: string;
  status?: number;
  url?: string;
}

export default function WorkflowExporter() {
  const [workflows, setWorkflows] = useState<N8nWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflows = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai-stack/n8n/workflows");
      const data: WorkflowListResponse = await response.json();
      
      if (response.ok) {
        // Handle both response formats
        const workflowList = data.workflows || data.data || [];
        setWorkflows(workflowList);
      } else {
        // Build detailed error message
        let errorMsg = data.error || "Failed to fetch workflows";
        if (data.details) {
          errorMsg += `: ${data.details}`;
        }
        if (data.suggestion) {
          errorMsg += `\n\n${data.suggestion}`;
        }
        if (data.status === 401) {
          errorMsg += `\n\n💡 Solution: Set up your n8n API key using the form above. Click the link to open n8n API settings and create a new API key.`;
        }
        if (data.status) {
          errorMsg += `\n\nStatus: ${data.status}`;
        }
        setError(errorMsg);
      }
    } catch (err) {
      console.error("Error fetching workflows:", err);
      setError(`Failed to connect to n8n: ${err instanceof Error ? err.message : "Unknown error"}\n\nIs n8n running? Check the service status tab.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  // Re-fetch workflows when API key status might have changed
  useEffect(() => {
    const interval = setInterval(() => {
      // Check if we should refresh (e.g., after API key is saved)
      if (!error && workflows.length === 0) {
        fetchWorkflows();
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [error, workflows.length]);

  const handleExport = async (workflow: N8nWorkflow) => {
    setExporting(workflow.id);
    try {
      const response = await fetch("/api/ai-stack/n8n/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId: workflow.id,
          workflowName: workflow.name,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ Workflow exported successfully!\n\nSaved to: ${data.filePath}\n\nThis workflow will be automatically imported when you restart the Docker stack.`);
        // Refresh the list
        await fetchWorkflows();
      } else {
        const errorData = await response.json().catch(() => ({}));
        let errorMsg = `❌ Failed to export workflow: ${errorData.error || "Unknown error"}`;
        if (errorData.details) {
          errorMsg += `\n\nDetails: ${errorData.details}`;
        }
        if (errorData.suggestion) {
          errorMsg += `\n\n${errorData.suggestion}`;
        }
        alert(errorMsg);
      }
    } catch (err) {
      console.error("Error exporting workflow:", err);
      alert("❌ Error exporting workflow. Check console for details.");
    } finally {
      setExporting(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateString;
    }
  };

  const openWorkflow = (workflowId: string) => {
    window.open(`http://localhost:5678/workflow/${workflowId}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-ember-glow" />
          <p className="text-text-secondary">Loading workflows...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card-glow py-12">
          <div className="text-center mb-6">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-glow mb-2">Error Loading Workflows</h3>
          </div>
          <div className="bg-deep border border-red-400/30 rounded-lg p-4 mb-6 text-left">
            <pre className="text-sm text-text-secondary whitespace-pre-wrap font-mono">
              {error}
            </pre>
          </div>
          <div className="text-center space-y-3">
            <button
              onClick={fetchWorkflows}
              className="px-4 py-2 bg-ember-glow text-black rounded font-semibold hover:opacity-90"
            >
              Retry
            </button>
            <div>
              <button
                onClick={() => window.open('http://localhost:5678', '_blank')}
                className="px-4 py-2 bg-deep border border-border rounded text-text-secondary hover:text-ember-glow hover:bg-shadow transition-all flex items-center gap-2 mx-auto"
              >
                <ExternalLink className="w-4 h-4" />
                Open n8n to Log In
              </button>
              <p className="text-xs text-text-muted mt-2">
                If you see a 401 error, you may need to log into n8n first
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (workflows.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card-glow text-center py-12">
          <Workflow className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-glow mb-2">No Workflows Found</h3>
          <p className="text-text-secondary mb-6">
            Create your first workflow in n8n to get started
          </p>
          <button
            onClick={() => window.open('http://localhost:5678', '_blank')}
            className="px-4 py-2 bg-ember-glow text-black rounded font-semibold hover:opacity-90 flex items-center gap-2 mx-auto"
          >
            <ExternalLink className="w-4 h-4" />
            Open n8n to Create Workflow
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* API Key Setup - shows input when no key, or remove button when key exists */}
      <ApiKeySetup />
      
      {/* Only show workflows section if we have an API key or no error */}
      {!error && (
        <>
          <div className="flex items-center justify-between mb-4">
        <p className="text-text-secondary">
          {workflows.length} workflow{workflows.length !== 1 ? 's' : ''} found
        </p>
        <button
          onClick={fetchWorkflows}
          disabled={loading}
          className="px-3 py-2 bg-deep border border-border rounded text-text-secondary hover:text-ember-glow hover:bg-shadow transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
      
      <div className="grid gap-4">
        {workflows.map((workflow) => (
          <div
            key={workflow.id}
            className="bg-shadow border border-border rounded-lg p-4 hover:border-ember/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Workflow className="w-5 h-5 text-ember-glow" />
                  <h3 className="font-semibold text-text-primary text-lg">{workflow.name}</h3>
                  {workflow.active ? (
                    <span className="px-2 py-0.5 bg-moss/20 text-moss-glow rounded text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-deep text-text-muted rounded text-xs">
                      Inactive
                    </span>
                  )}
                </div>
                
                {workflow.tags && workflow.tags.length > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    {workflow.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-2 py-0.5 bg-deep text-text-muted rounded text-xs"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Updated: {formatDate(workflow.updatedAt)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => openWorkflow(workflow.id)}
                  className="px-3 py-2 bg-deep border border-border rounded text-text-secondary hover:text-ember-glow hover:bg-shadow transition-all flex items-center gap-2"
                  title="Open in n8n"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open
                </button>
                <button
                  onClick={() => handleExport(workflow)}
                  disabled={exporting === workflow.id}
                  className="px-3 py-2 bg-ember-glow text-black rounded font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  title="Export to version control"
                >
                  {exporting === workflow.id ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Export
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
          <div className="mt-6 p-4 bg-shadow border border-border rounded-lg">
            <h4 className="font-semibold text-glow mb-2">💡 Workflow Versioning</h4>
            <p className="text-sm text-text-secondary">
              Use the "Export" button to save workflows to <code className="bg-deep px-1 rounded">infra/ai-stack/n8n/magicborn/workflows/</code>.
              These files can be committed to git for version control. When you restart your Docker stack, these workflows will be automatically imported.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

