// components/content-editor/ContentGridView.tsx
// Grid view of content items

"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Loader2, 
  FileText, 
  User, 
  MapPin, 
  Package, 
  BookOpen,
  Sparkles,
  Gem,
  Zap
} from "lucide-react";

interface ContentItem {
  id: string;
  name: string;
  description?: string;
  type?: string;
}

interface ContentGridViewProps {
  projectId: string;
  category: string | null;
}

const categoryIcons: Record<string, typeof FileText> = {
  characters: User,
  locations: MapPin,
  objects: Package,
  lore: BookOpen,
  spells: Sparkles,
  runes: Gem,
  effects: Zap,
};

export function ContentGridView({ projectId, category }: ContentGridViewProps) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchContent() {
      if (!category) {
        setItems([]);
        return;
      }

      setLoading(true);
      
      try {
        // Map category to Payload collection
        const collectionMap: Record<string, string> = {
          characters: "characters",
          // Add more mappings as collections are created
        };

        const collection = collectionMap[category];
        
        if (collection) {
          const response = await fetch(
            `/api/payload/${collection}?where[project][equals]=${projectId}&limit=50`
          );
          
          if (response.ok) {
            const result = await response.json();
            setItems(
              result.docs?.map((doc: any) => ({
                id: doc.id,
                name: doc.name || doc.title || `Entry ${doc.id}`,
                description: doc.description || "",
                type: category,
              })) || []
            );
          } else {
            setItems([]);
          }
        } else {
          // Collection not implemented yet
          setItems([]);
        }
      } catch (error) {
        console.error("Failed to fetch content:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, [projectId, category]);

  const Icon = category ? categoryIcons[category] || FileText : FileText;
  const categoryTitle = category 
    ? category.charAt(0).toUpperCase() + category.slice(1) 
    : "All Content";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-2 text-text-muted">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading {categoryTitle.toLowerCase()}...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-glow mb-1 flex items-center gap-2">
            <Icon className="w-6 h-6" />
            {categoryTitle}
          </h1>
          <p className="text-text-muted text-sm">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
        
        {category && (
          <button className="px-4 py-2 bg-ember/20 border border-ember/30 rounded-lg text-ember-glow font-medium hover:bg-ember/30 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add {categoryTitle.slice(0, -1)}
          </button>
        )}
      </div>

      {!category ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <FileText className="w-12 h-12 text-text-muted mb-4" />
          <h2 className="text-lg font-medium text-text-primary mb-2">Select a Category</h2>
          <p className="text-text-muted max-w-md">
            Choose a category from the Codex sidebar to view and manage your content.
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Icon className="w-12 h-12 text-text-muted mb-4" />
          <h2 className="text-lg font-medium text-text-primary mb-2">No {categoryTitle} Yet</h2>
          <p className="text-text-muted max-w-md mb-4">
            Get started by creating your first {categoryTitle.toLowerCase().slice(0, -1)}.
          </p>
          <button className="px-4 py-2 bg-ember/20 border border-ember/30 rounded-lg text-ember-glow font-medium hover:bg-ember/30 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create {categoryTitle.slice(0, -1)}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-shadow border border-border rounded-lg hover:border-ember/30 transition-colors cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-deep rounded-lg">
                  <Icon className="w-5 h-5 text-ember-glow" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-text-primary group-hover:text-ember-glow transition-colors truncate">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-text-muted mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

