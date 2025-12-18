"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Copy, Check } from "lucide-react";

export default function APIDocsPage() {
  const [activeTab, setActiveTab] = useState<'rest'>('rest');
  const [copied, setCopied] = useState(false);
  const [collections, setCollections] = useState<string[]>([]);
  const [globals, setGlobals] = useState<string[]>([]);
  
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'http://localhost:4300';

  // Fetch collections from OpenAPI spec
  useEffect(() => {
    fetch('/api/openapi')
      .then(res => res.json())
      .then(spec => {
        // Extract unique tags (collections) from paths
        const tags = new Set<string>();
        const globalsList: string[] = [];
        
        Object.entries(spec.paths || {}).forEach(([path, methods]: [string, any]) => {
          Object.values(methods).forEach((method: any) => {
            method.tags?.forEach((tag: string) => {
              if (tag === 'globals') {
                // Extract global name from path
                const match = path.match(/\/globals\/([^/]+)/);
                if (match) globalsList.push(match[1]);
              } else if (tag !== 'auth') {
                tags.add(tag);
              }
            });
          });
        });
        
        setCollections(Array.from(tags));
        setGlobals([...new Set(globalsList)]);
      })
      .catch(() => {});
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-void p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-glow mb-2">API Documentation</h1>
        <p className="text-text-secondary mb-8">
          Magicborn uses Payload CMS which provides both REST and GraphQL APIs automatically.
        </p>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <a
            href="/docs/swagger"
            className="p-4 bg-shadow border border-border rounded-lg hover:border-ember/30 transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-text-primary">Swagger UI</span>
              <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-ember" />
            </div>
            <p className="text-sm text-text-muted">Interactive REST API explorer</p>
            <code className="text-xs text-ember-glow mt-2 block">/docs/swagger</code>
          </a>
          
          
          <a
            href="/api/openapi"
            target="_blank"
            className="p-4 bg-shadow border border-border rounded-lg hover:border-ember/30 transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-text-primary">OpenAPI JSON</span>
              <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-ember" />
            </div>
            <p className="text-sm text-text-muted">Raw spec for AI agents</p>
            <code className="text-xs text-ember-glow mt-2 block">/api/openapi</code>
          </a>
          
          <a
            href="https://local.drizzle.studio"
            target="_blank"
            className="p-4 bg-shadow border border-border rounded-lg hover:border-ember/30 transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-text-primary">DB Studio</span>
              <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-ember" />
            </div>
            <p className="text-sm text-text-muted">Drizzle Studio for raw DB</p>
            <code className="text-xs text-ember-glow mt-2 block">drizzle.studio</code>
          </a>
        </div>

        {/* REST API Docs */}
        {activeTab === 'rest' && (
          <div className="space-y-6">
            {/* Authentication */}
            <section className="bg-shadow border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Authentication</h2>
              <p className="text-text-secondary mb-4">
                Login to get a token, then include it in subsequent requests.
              </p>
              
              <div className="bg-deep rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-muted">POST /api/payload/users/login</span>
                  <button
                    onClick={() => copyToClipboard(`curl -X POST ${baseUrl}/api/payload/users/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "admin@magicborn.local", "password": "changethis"}'`)}
                    className="p-1 hover:bg-void rounded"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-text-muted" />}
                  </button>
                </div>
                <pre className="text-sm text-ember-glow overflow-x-auto">
{`curl -X POST ${baseUrl}/api/payload/users/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "admin@magicborn.local", "password": "changethis"}'`}
                </pre>
              </div>
              
              <p className="text-sm text-text-muted">
                Use the returned token as: <code className="text-ember-glow">Authorization: Bearer {'<token>'}</code>
              </p>
            </section>

            {/* Collections */}
            <section className="bg-shadow border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Collections</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
                {collections.map(col => (
                  <code key={col} className="px-2 py-1 bg-deep rounded text-sm text-text-secondary">
                    {col}
                  </code>
                ))}
              </div>

              <h3 className="font-medium text-text-primary mb-3">Endpoints Pattern</h3>
              <div className="space-y-2 text-sm">
                <div className="flex gap-4">
                  <span className="text-green-400 w-16">GET</span>
                  <code className="text-text-secondary">/api/payload/{'{collection}'}</code>
                  <span className="text-text-muted ml-auto">List all</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-blue-400 w-16">POST</span>
                  <code className="text-text-secondary">/api/payload/{'{collection}'}</code>
                  <span className="text-text-muted ml-auto">Create</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-green-400 w-16">GET</span>
                  <code className="text-text-secondary">/api/payload/{'{collection}'}/{'{id}'}</code>
                  <span className="text-text-muted ml-auto">Get one</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-yellow-400 w-16">PATCH</span>
                  <code className="text-text-secondary">/api/payload/{'{collection}'}/{'{id}'}</code>
                  <span className="text-text-muted ml-auto">Update</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-red-400 w-16">DELETE</span>
                  <code className="text-text-secondary">/api/payload/{'{collection}'}/{'{id}'}</code>
                  <span className="text-text-muted ml-auto">Delete</span>
                </div>
              </div>
            </section>

            {/* Query Parameters */}
            <section className="bg-shadow border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Query Parameters</h2>
              
              <div className="space-y-4">
                <div>
                  <code className="text-ember-glow">?limit=10&page=1</code>
                  <p className="text-sm text-text-muted mt-1">Pagination</p>
                </div>
                <div>
                  <code className="text-ember-glow">?sort=-createdAt</code>
                  <p className="text-sm text-text-muted mt-1">Sort (prefix with - for descending)</p>
                </div>
                <div>
                  <code className="text-ember-glow">?where[name][equals]=Tarro</code>
                  <p className="text-sm text-text-muted mt-1">Filter by field</p>
                </div>
                <div>
                  <code className="text-ember-glow">?depth=2</code>
                  <p className="text-sm text-text-muted mt-1">Populate relationships</p>
                </div>
              </div>
            </section>

            {/* Globals */}
            <section className="bg-shadow border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Globals</h2>
              <p className="text-text-secondary mb-4">Single-instance configuration objects.</p>
              
              <div className="space-y-2 text-sm">
                {globals.map(global => (
                  <div key={global} className="flex gap-4">
                    <span className="text-green-400 w-16">GET</span>
                    <code className="text-text-secondary">/api/payload/globals/{global}</code>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* For AI Agents */}
        <section className="mt-8 bg-shadow border border-ember/30 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-ember-glow mb-4">🤖 For AI Agents</h2>
          <p className="text-text-secondary mb-4">
            To integrate with AI tools, provide the OpenAPI spec URL:
          </p>
          <div className="bg-deep rounded-lg p-4 flex items-center justify-between">
            <code className="text-ember-glow">{baseUrl}/api/openapi</code>
            <button
              onClick={() => copyToClipboard(`${baseUrl}/api/openapi`)}
              className="px-3 py-1.5 bg-ember/20 border border-ember/30 rounded text-sm text-ember-glow hover:bg-ember/30 transition-colors flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              Copy URL
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

