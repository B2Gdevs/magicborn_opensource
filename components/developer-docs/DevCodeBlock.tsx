'use client';

import { useState, useRef } from 'react';
import { Copy, Check, Terminal, Code, FileText, FileJson, Database } from 'lucide-react';

interface DevCodeBlockProps {
  children: string;
  language?: string;
  className?: string;
}

const languageConfig: Record<string, { icon: typeof Code; label: string; color: string }> = {
  bash: { icon: Terminal, label: 'Bash', color: 'text-green-400' },
  sh: { icon: Terminal, label: 'Shell', color: 'text-green-400' },
  shell: { icon: Terminal, label: 'Shell', color: 'text-green-400' },
  terminal: { icon: Terminal, label: 'Terminal', color: 'text-green-400' },
  typescript: { icon: Code, label: 'TypeScript', color: 'text-blue-400' },
  ts: { icon: Code, label: 'TypeScript', color: 'text-blue-400' },
  tsx: { icon: Code, label: 'TSX', color: 'text-blue-400' },
  javascript: { icon: Code, label: 'JavaScript', color: 'text-yellow-400' },
  js: { icon: Code, label: 'JavaScript', color: 'text-yellow-400' },
  jsx: { icon: Code, label: 'JSX', color: 'text-yellow-400' },
  json: { icon: FileJson, label: 'JSON', color: 'text-amber-400' },
  sql: { icon: Database, label: 'SQL', color: 'text-purple-400' },
  css: { icon: FileText, label: 'CSS', color: 'text-pink-400' },
  html: { icon: FileText, label: 'HTML', color: 'text-orange-400' },
  markdown: { icon: FileText, label: 'Markdown', color: 'text-text-secondary' },
  md: { icon: FileText, label: 'Markdown', color: 'text-text-secondary' },
};

export default function DevCodeBlock({ children, language = '', className }: DevCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);
  
  const config = languageConfig[language.toLowerCase()] || { 
    icon: Code, 
    label: language || 'Code', 
    color: 'text-ember-glow' 
  };
  const Icon = config.icon;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-lg border border-border overflow-hidden bg-abyss group">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-shadow border-b border-border">
        <Icon className={`w-4 h-4 ${config.color}`} />
        <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
        
        <button
          onClick={copyToClipboard}
          className="ml-auto p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-deep transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
      
      {/* Code content */}
      <pre
        ref={codeRef}
        className={`overflow-x-auto p-4 text-sm font-mono text-text-primary whitespace-pre ${className || ''}`}
        style={{ tabSize: 2 }}
      >
        <code className="whitespace-pre">{children}</code>
      </pre>
    </div>
  );
}

