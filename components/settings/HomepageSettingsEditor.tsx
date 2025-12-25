// components/settings/HomepageSettingsEditor.tsx
// Editor for project-level homepage content overrides

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Home,
} from "lucide-react";
import { HERO_CONTENT_STYLE_OPTIONS, HERO_CONTENT_COLOR_OPTIONS } from "@lib/payload/constants/homepage";

interface HeroContentItem {
  text: string;
  style?: 'normal' | 'italic' | 'bold';
  highlightWords?: string;
  color?: string;
}

interface VideoItem {
  url?: string;
  video?: { id?: number; url?: string } | number;
}

interface HomepageConfig {
  hero?: {
    title?: string;
    subtitle?: string;
    videos?: VideoItem[];
    backgroundImage?: { id?: number; url?: string } | number | null;
  };
  heroContent?: HeroContentItem[];
}

interface HomepageSettingsEditorProps {
  projectId: string;
  onSave?: () => void;
}

const COLOR_OPTIONS = [
  { label: 'Default', value: '' },
  { label: 'Ember', value: 'ember-glow' },
  { label: 'Gold', value: 'amber-400' },
  { label: 'Crimson', value: 'red-500' },
  { label: 'Ice', value: 'cyan-400' },
  { label: 'Mystic', value: 'purple-400' },
];

export function HomepageSettingsEditor({ projectId, onSave }: HomepageSettingsEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [heroContent, setHeroContent] = useState<HeroContentItem[]>([]);

  // Load existing config
  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetch(`/api/payload/projects/${projectId}`);
        if (response.ok) {
          const project = await response.json();
          const config = project?.homepageConfig as HomepageConfig | undefined;
          
          // Initialize form state
          setHeroTitle(config?.hero?.title || "");
          setHeroSubtitle(config?.hero?.subtitle || "");
          setVideos(config?.hero?.videos || []);
          setHeroContent(config?.heroContent || []);
        }
      } catch (err) {
        console.error("Failed to load homepage settings:", err);
        setError("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, [projectId]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Build homepageConfig object - only include non-empty values
      const homepageConfig: HomepageConfig = {};
      
      // Hero section
      if (heroTitle || heroSubtitle || videos.length > 0) {
        homepageConfig.hero = {};
        if (heroTitle) homepageConfig.hero.title = heroTitle;
        if (heroSubtitle) homepageConfig.hero.subtitle = heroSubtitle;
        if (videos.length > 0) {
          homepageConfig.hero.videos = videos.filter(v => v.url);
        }
      }
      
      // Hero content
      if (heroContent.length > 0) {
        homepageConfig.heroContent = heroContent.filter(item => item.text.trim());
      }

      const response = await fetch(`/api/payload/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homepageConfig: Object.keys(homepageConfig).length > 0 ? homepageConfig : null,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onSave?.();
        }, 2000);
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Failed to save settings");
      }
    } catch (err) {
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Hero content handlers
  const updateHeroItem = (index: number, field: keyof HeroContentItem, value: string) => {
    const updated = [...heroContent];
    updated[index] = { ...updated[index], [field]: value };
    setHeroContent(updated);
  };

  const addHeroItem = () => {
    setHeroContent([...heroContent, { text: '', style: 'normal' }]);
  };

  const removeHeroItem = (index: number) => {
    setHeroContent(heroContent.filter((_, i) => i !== index));
  };

  const moveHeroItem = useCallback((index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= heroContent.length) return;
    const updated = [...heroContent];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setHeroContent(updated);
  }, [heroContent]);

  // Video handlers
  const addVideo = () => {
    setVideos([...videos, { url: '' }]);
  };

  const updateVideo = (index: number, url: string) => {
    const updated = [...videos];
    updated[index] = { ...updated[index], url };
    setVideos(updated);
  };

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-text-muted">Loading homepage settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1 text-text-primary">Homepage Content Overrides</h3>
        <div className="h-px bg-border mb-6" />
        <p className="text-sm text-text-secondary mb-6">
          Override homepage content for this project. Leave empty to use global SiteConfig defaults.
          <br />
          <span className="text-xs text-text-muted">
            Only the fields you fill will override the global settings. Empty fields will use SiteConfig defaults.
          </span>
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
          Settings saved successfully!
        </div>
      )}

      {/* Hero Section */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-3 text-text-primary">Hero Section</h4>
          <div className="space-y-4 p-4 bg-deep/50 border border-border rounded-lg">
            <div>
              <label className="block text-sm font-medium mb-2 text-text-secondary">
                Hero Title
              </label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                placeholder="Leave empty to use SiteConfig default"
                className="w-full px-3 py-2 bg-deep border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-ember-glow text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-text-secondary">
                Hero Subtitle
              </label>
              <textarea
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                placeholder="Leave empty to use SiteConfig default"
                rows={3}
                className="w-full px-3 py-2 bg-deep border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-ember-glow resize-none text-sm"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-text-secondary">
                  Hero Videos
                </label>
                <button
                  onClick={addVideo}
                  className="text-xs text-ember-glow hover:text-ember-glow/80 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add Video
                </button>
              </div>
              {videos.length === 0 ? (
                <p className="text-xs text-text-muted italic">No videos (uses SiteConfig default)</p>
              ) : (
                <div className="space-y-2">
                  {videos.map((video, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={video.url || ''}
                        onChange={(e) => updateVideo(index, e.target.value)}
                        placeholder="Video URL"
                        className="flex-1 px-3 py-2 bg-deep border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-ember-glow text-sm"
                      />
                      <button
                        onClick={() => removeVideo(index)}
                        className="p-2 text-text-muted hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-text-primary">Hero Content Paragraphs</h4>
            <button
              onClick={addHeroItem}
              className="text-xs text-ember-glow hover:text-ember-glow/80 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Add Paragraph
            </button>
          </div>
          {heroContent.length === 0 ? (
            <p className="text-xs text-text-muted italic p-4 bg-deep/50 border border-border rounded-lg">
              No content (uses SiteConfig default)
            </p>
          ) : (
            <div className="space-y-3">
              {heroContent.map((item, index) => (
                <div key={index} className="p-4 bg-deep/50 border border-border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">Paragraph {index + 1}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveHeroItem(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveHeroItem(index, 'down')}
                        disabled={index === heroContent.length - 1}
                        className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeHeroItem(index)}
                        className="p-1 text-text-muted hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={item.text}
                    onChange={(e) => updateHeroItem(index, 'text', e.target.value)}
                    placeholder="Enter paragraph text..."
                    rows={3}
                    className="w-full px-3 py-2 bg-deep border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-ember-glow resize-none text-sm"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1 text-text-secondary">Style</label>
                      <select
                        value={item.style || 'normal'}
                        onChange={(e) => updateHeroItem(index, 'style', e.target.value)}
                        className="w-full px-3 py-2 bg-deep border border-border rounded-lg text-text-primary focus:outline-none focus:border-ember-glow text-sm"
                      >
                        {HERO_CONTENT_STYLE_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1 text-text-secondary">Color</label>
                      <select
                        value={item.color || ''}
                        onChange={(e) => updateHeroItem(index, 'color', e.target.value)}
                        className="w-full px-3 py-2 bg-deep border border-border rounded-lg text-text-primary focus:outline-none focus:border-ember-glow text-sm"
                      >
                        {HERO_CONTENT_COLOR_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-text-secondary">
                      Highlight Words (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={item.highlightWords || ''}
                      onChange={(e) => updateHeroItem(index, 'highlightWords', e.target.value)}
                      placeholder="magic, power, spell"
                      className="w-full px-3 py-2 bg-deep border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-ember-glow text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-6 border-t border-border">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-ember hover:bg-ember-glow text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Home className="w-4 h-4" />
              Save Homepage Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}

