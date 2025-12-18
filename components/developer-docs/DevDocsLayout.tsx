'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  ChevronDown, ChevronRight, FileText, Folder, Home, 
  Layers, Code, Database, Settings, Lock, Map, Bot, 
  BookOpen, Wrench, Menu, X
} from 'lucide-react';
import type { DocMeta, SearchIndexEntry } from '@/lib/developer-docs';
import DevDocsSearch from './DevDocsSearch';

interface DevDocsLayoutProps {
  docs: DocMeta[];
  searchIndex: SearchIndexEntry[];
  children: React.ReactNode;
}

// Map slugs/titles to icons
function getIconForDoc(slug: string, title: string) {
  const slugLower = slug.toLowerCase();
  const titleLower = title.toLowerCase();
  
  if (slugLower === 'readme') return Home;
  if (slugLower.includes('architecture')) return Layers;
  if (slugLower.includes('auth') || titleLower.includes('credential')) return Lock;
  if (slugLower.includes('database') || slugLower.includes('data')) return Database;
  if (slugLower.includes('environment') || slugLower.includes('map')) return Map;
  if (slugLower.includes('assistant') || slugLower.includes('ai')) return Bot;
  if (slugLower.includes('content-editor')) return BookOpen;
  if (slugLower.includes('technical')) return Wrench;
  if (slugLower.includes('setup') || slugLower.includes('config')) return Settings;
  
  return FileText;
}

function NavItem({ doc, depth = 0 }: { doc: DocMeta; depth?: number }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  
  const href = `/docs/developer/${doc.slug}`;
  const isActive = pathname === href || pathname.startsWith(href + '/');
  const Icon = doc.isDirectory ? Folder : getIconForDoc(doc.slug, doc.title);
  
  if (doc.isDirectory && doc.children) {
    return (
      <div className="mb-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg
            transition-colors text-left
            ${isActive ? 'text-ember-glow bg-deep' : 'text-text-secondary hover:text-text-primary hover:bg-shadow'}
          `}
          style={{ paddingLeft: `${depth * 12 + 12}px` }}
        >
          {isOpen ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
          <Icon className="w-4 h-4 shrink-0 text-ember" />
          <span className="capitalize truncate">{doc.title}</span>
        </button>
        {isOpen && (
          <div className="ml-2 border-l border-border/50">
            {doc.children.map((child) => (
              <NavItem key={child.slug} doc={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors
        ${isActive 
          ? 'text-ember-glow bg-ember/10 border-l-2 border-ember-glow' 
          : 'text-text-secondary hover:text-text-primary hover:bg-shadow'
        }
      `}
      style={{ paddingLeft: `${depth * 12 + 12}px` }}
    >
      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-ember-glow' : 'text-ember/70'}`} />
      <span className="truncate">{doc.title}</span>
    </Link>
  );
}

export default function DevDocsLayout({ docs, searchIndex, children }: DevDocsLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex min-h-screen bg-void">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-20 left-4 z-50 lg:hidden p-2 bg-shadow border border-border rounded-lg"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-72 
        bg-shadow border-r border-border overflow-y-auto z-40
        transition-transform lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4">
          <Link href="/docs/developer" className="flex items-center gap-2 mb-4 px-3 py-2">
            <Code className="w-5 h-5 text-ember-glow" />
            <span className="font-bold text-text-primary">Developer Docs</span>
          </Link>
          
          {/* Search */}
          <div className="mb-4 px-1">
            <DevDocsSearch searchIndex={searchIndex} />
          </div>
          
          <nav className="space-y-1">
            {docs.map((doc) => (
              <NavItem key={doc.slug} doc={doc} />
            ))}
          </nav>
        </div>
      </aside>
      
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main content */}
      <main className="flex-1 min-w-0 lg:ml-0">
        {children}
      </main>
    </div>
  );
}

