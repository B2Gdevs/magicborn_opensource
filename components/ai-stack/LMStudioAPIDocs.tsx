// components/ai-stack/LMStudioAPIDocs.tsx
// Component to display LM Studio REST API documentation

"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, ExternalLink, Code, Send, Loader2, Copy, Check } from "lucide-react";

interface APIEndpoint {
  method: string;
  path: string;
  description: string;
  category: "openai" | "enhanced";
}

const endpoints: APIEndpoint[] = [
  // OpenAI-Compatible Endpoints
  {
    method: "GET",
    path: "/v1/models",
    description: "Lists the currently loaded models",
    category: "openai",
  },
  {
    method: "POST",
    path: "/v1/chat/completions",
    description: "Sends a chat history and receives the assistant's response",
    category: "openai",
  },
  {
    method: "POST",
    path: "/v1/completions",
    description: "Sends a string and gets the model's continuation of that string",
    category: "openai",
  },
  {
    method: "POST",
    path: "/v1/embeddings",
    description: "Sends a string or array of strings and gets an array of text embeddings",
    category: "openai",
  },
  {
    method: "POST",
    path: "/v1/responses",
    description: "Creates responses with streaming, tool calling, reasoning, and stateful interactions",
    category: "openai",
  },
  // Enhanced REST API Endpoints
  {
    method: "GET",
    path: "/api/v0/models",
    description: "Lists all available models with detailed information (loading state, type, architecture, etc.)",
    category: "enhanced",
  },
  {
    method: "GET",
    path: "/api/v0/models/{model}",
    description: "Retrieves information about a specific model",
    category: "enhanced",
  },
  {
    method: "POST",
    path: "/api/v0/chat/completions",
    description: "Provides chat completions by sending a messages array",
    category: "enhanced",
  },
  {
    method: "POST",
    path: "/api/v0/completions",
    description: "Offers text completions by sending a prompt",
    category: "enhanced",
  },
  {
    method: "POST",
    path: "/api/v0/embeddings",
    description: "Generates text embeddings by sending text",
    category: "enhanced",
  },
];

interface EndpointState {
  endpoint: APIEndpoint;
  requestBody: string;
  response: any;
  loading: boolean;
  error: string | null;
  expanded: boolean;
}

const getDefaultRequestBody = (endpoint: APIEndpoint): string => {
  if (endpoint.method === "GET") return "";
  
  if (endpoint.path.includes("chat/completions")) {
    return JSON.stringify({
      model: "local-model",
      messages: [
        { role: "user", content: "Hello, how are you?" }
      ]
    }, null, 2);
  }
  
  if (endpoint.path.includes("completions")) {
    return JSON.stringify({
      model: "local-model",
      prompt: "The capital of France is"
    }, null, 2);
  }
  
  if (endpoint.path.includes("embeddings")) {
    return JSON.stringify({
      model: "local-model",
      input: "Hello world"
    }, null, 2);
  }
  
  return "{}";
};

export default function LMStudioAPIDocs() {
  const [expandedCategory, setExpandedCategory] = useState<"openai" | "enhanced" | null>("openai");
  const [endpointStates, setEndpointStates] = useState<Map<string, EndpointState>>(new Map());
  const [copied, setCopied] = useState<string | null>(null);
  const baseUrl = "http://localhost:1234";

  const openaiEndpoints = endpoints.filter((e) => e.category === "openai");
  const enhancedEndpoints = endpoints.filter((e) => e.category === "enhanced");

  const toggleCategory = (category: "openai" | "enhanced") => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const toggleEndpoint = (endpoint: APIEndpoint) => {
    const key = `${endpoint.method}-${endpoint.path}`;
    const current = endpointStates.get(key);
    
    if (current) {
      setEndpointStates(new Map(endpointStates.set(key, {
        ...current,
        expanded: !current.expanded
      })));
    } else {
      setEndpointStates(new Map(endpointStates.set(key, {
        endpoint,
        requestBody: getDefaultRequestBody(endpoint),
        response: null,
        loading: false,
        error: null,
        expanded: true
      })));
    }
  };

  const updateRequestBody = (endpoint: APIEndpoint, body: string) => {
    const key = `${endpoint.method}-${endpoint.path}`;
    const current = endpointStates.get(key);
    if (current) {
      setEndpointStates(new Map(endpointStates.set(key, {
        ...current,
        requestBody: body
      })));
    }
  };

  const sendRequest = async (endpoint: APIEndpoint) => {
    const key = `${endpoint.method}-${endpoint.path}`;
    const current = endpointStates.get(key);
    if (!current) return;

    setEndpointStates(new Map(endpointStates.set(key, {
      ...current,
      loading: true,
      error: null,
      response: null
    })));

    try {
      // Use proxy API route to avoid CORS issues
      // Remove leading slash from path for the proxy route
      const path = endpoint.path.startsWith("/") ? endpoint.path.slice(1) : endpoint.path;
      const proxyUrl = `/api/ai-stack/lmstudio/${path}`;
      
      const options: RequestInit = {
        method: endpoint.method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (endpoint.method === "POST" && current.requestBody) {
        try {
          options.body = JSON.stringify(JSON.parse(current.requestBody));
        } catch (e) {
          setEndpointStates(new Map(endpointStates.set(key, {
            ...current,
            loading: false,
            error: "Invalid JSON in request body"
          })));
          return;
        }
      }

      const response = await fetch(proxyUrl, options);
      const result = await response.json().catch(() => ({ 
        error: "Invalid JSON response",
        status: response.status,
        statusText: response.statusText
      }));

      // The proxy returns { status, statusText, data } or { error, status, statusText }
      if (result.error) {
        setEndpointStates(new Map(endpointStates.set(key, {
          ...current,
          loading: false,
          error: result.error || "Failed to make request"
        })));
      } else {
        setEndpointStates(new Map(endpointStates.set(key, {
          ...current,
          loading: false,
          response: result
        })));
      }
    } catch (error: any) {
      setEndpointStates(new Map(endpointStates.set(key, {
        ...current,
        loading: false,
        error: error.message || "Failed to make request"
      })));
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "POST":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const renderEndpoint = (endpoint: APIEndpoint) => {
    const key = `${endpoint.method}-${endpoint.path}`;
    const state = endpointStates.get(key);
    const isExpanded = state?.expanded || false;

    return (
      <div key={key} className="border-b border-border last:border-b-0">
        <div
          className="p-4 hover:bg-deep/30 transition-colors cursor-pointer"
          onClick={() => toggleEndpoint(endpoint)}
        >
          <div className="flex items-start gap-3">
            <span
              className={`px-2 py-1 text-xs font-mono font-semibold rounded border ${getMethodColor(
                endpoint.method
              )}`}
            >
              {endpoint.method}
            </span>
            <div className="flex-1 min-w-0">
              <code className="text-sm text-ember-glow break-all">{endpoint.path}</code>
              <p className="text-xs text-text-muted mt-1">{endpoint.description}</p>
            </div>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="px-4 pb-4 space-y-4 bg-deep/20">
            {endpoint.method === "POST" && (
              <div>
                <label className="block text-xs font-medium mb-2 text-text-secondary">
                  Request Body (JSON)
                </label>
                <textarea
                  value={state?.requestBody || getDefaultRequestBody(endpoint)}
                  onChange={(e) => updateRequestBody(endpoint, e.target.value)}
                  className="w-full px-3 py-2 bg-deep border border-border rounded-lg text-text-primary font-mono text-xs focus:outline-none focus:border-ember-glow resize-none"
                  rows={8}
                  placeholder="Enter JSON request body"
                />
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                sendRequest(endpoint);
              }}
              disabled={state?.loading || false}
              className="flex items-center gap-2 px-4 py-2 bg-ember hover:bg-ember-glow text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state?.loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Request
                </>
              )}
            </button>

            {state?.error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-xs text-red-400 font-semibold mb-1">Error</p>
                <p className="text-xs text-red-300">{state.error}</p>
              </div>
            )}

            {state?.response && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-text-secondary">
                    Response ({state.response.status} {state.response.statusText})
                  </p>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(state.response.data, null, 2), `response-${key}`)}
                    className="text-xs text-ember-glow hover:text-ember flex items-center gap-1"
                  >
                    {copied === `response-${key}` ? (
                      <>
                        <Check className="w-3 h-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 bg-deep border border-border rounded-lg text-xs text-text-primary font-mono overflow-x-auto max-h-96 overflow-y-auto">
                  {JSON.stringify(state.response.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">LM Studio REST API</h3>
        <a
          href="https://lmstudio.ai/docs/app/api/endpoints"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-ember-glow hover:text-ember flex items-center gap-1"
        >
          <ExternalLink className="w-3 h-3" />
          Full Documentation
        </a>
      </div>

      <div className="text-sm text-text-muted mb-4">
        Base URL: <code className="text-ember-glow">{baseUrl}</code>
      </div>

      {/* OpenAI-Compatible Endpoints */}
      <div className="border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => toggleCategory("openai")}
          className="w-full flex items-center justify-between p-4 bg-deep/50 hover:bg-deep transition-colors"
        >
          <div className="flex items-center gap-2">
            {expandedCategory === "openai" ? (
              <ChevronDown className="w-4 h-4 text-text-muted" />
            ) : (
              <ChevronRight className="w-4 h-4 text-text-muted" />
            )}
            <span className="font-semibold text-text-primary">OpenAI-Compatible Endpoints</span>
            <span className="text-xs text-text-muted">({openaiEndpoints.length})</span>
          </div>
        </button>
        {expandedCategory === "openai" && (
          <div className="border-t border-border">
            {openaiEndpoints.map((endpoint) => renderEndpoint(endpoint))}
          </div>
        )}
      </div>

      {/* Enhanced REST API Endpoints */}
      <div className="border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => toggleCategory("enhanced")}
          className="w-full flex items-center justify-between p-4 bg-deep/50 hover:bg-deep transition-colors"
        >
          <div className="flex items-center gap-2">
            {expandedCategory === "enhanced" ? (
              <ChevronDown className="w-4 h-4 text-text-muted" />
            ) : (
              <ChevronRight className="w-4 h-4 text-text-muted" />
            )}
            <span className="font-semibold text-text-primary">Enhanced REST API Endpoints</span>
            <span className="text-xs text-text-muted">({enhancedEndpoints.length})</span>
          </div>
        </button>
        {expandedCategory === "enhanced" && (
          <div className="border-t border-border">
            {enhancedEndpoints.map((endpoint) => renderEndpoint(endpoint))}
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-deep/50 border border-border rounded-lg">
        <p className="text-xs text-text-muted">
          <Code className="w-3 h-3 inline mr-1" />
          These endpoints are available when LM Studio server is running on port 1234. Use these
          endpoints with OpenAI-compatible client libraries by setting the base URL to{" "}
          <code className="text-ember-glow">http://localhost:1234</code>.
        </p>
      </div>
    </div>
  );
}

