"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  X,
  Save,
  Loader2,
  Video,
  Eye,
  EyeOff,
  Check,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Upload,
} from "lucide-react";
import { HERO_VIDEOS } from "@lib/config/videos";

interface HeroContentItem {
  text: string;
  style?: 'normal' | 'italic' | 'bold';
  highlightWords?: string;
  color?: string;
}

interface VideoItem {
  url?: string;
}

interface SiteConfig {
  siteName?: string;
  tagline?: string;
  hero?: {
    title?: string;
    subtitle?: string;
    videos?: VideoItem[];
    backgroundImage?: { url?: string } | null;
  };
  heroContent?: HeroContentItem[];
  features?: {
    showWaitlistButton?: boolean;
    waitlistUrl?: string;
    waitlistEmbedCode?: string;
  };
}

interface HomepageEditorProps {
  siteConfig: SiteConfig | null;
  activeProjectId?: number | string | null;
  onClose: () => void;
}

const COLOR_OPTIONS = [
  { label: 'Default', value: '' },
  { label: 'Ember', value: 'ember-glow' },
  { label: 'Gold', value: 'amber-400' },
  { label: 'Crimson', value: 'red-500' },
  { label: 'Ice', value: 'cyan-400' },
  { label: 'Mystic', value: 'purple-400' },
];

export function HomepageEditor({ siteConfig, activeProjectId, onClose }: HomepageEditorProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const isEditingProject = !!activeProjectId;

  // Form state
  const [siteName, setSiteName] = useState(siteConfig?.siteName || "Magicborn");
  const [tagline, setTagline] = useState(siteConfig?.tagline || "Mordred's Legacy");
  const [heroTitle, setHeroTitle] = useState(siteConfig?.hero?.title || "");
  const [heroSubtitle, setHeroSubtitle] = useState(siteConfig?.hero?.subtitle || "");
  const [heroContent, setHeroContent] = useState<HeroContentItem[]>(
    siteConfig?.heroContent || [
      { text: 'In the shadows where magic flows like blood, the Magicborn serve. Oppressed. Silenced. Forced into war.', style: 'italic', highlightWords: 'Magicborn' },
      { text: 'You are one of them. A military slave, your power both gift and curse. In this godforsaken land, survival comes not from strength, but from the spells you craft.', style: 'normal' },
      { text: "This is the story of the oppressed. Of what they must do to survive... their way.", style: 'italic', highlightWords: 'their way' },
    ]
  );
  const [videos, setVideos] = useState<VideoItem[]>(
    siteConfig?.hero?.videos?.length 
      ? siteConfig.hero.videos 
      : HERO_VIDEOS.map(v => ({ url: v.src }))
  );
  const [showWaitlist, setShowWaitlist] = useState(
    siteConfig?.features?.showWaitlistButton ?? false
  );
  const [waitlistUrl, setWaitlistUrl] = useState(
    siteConfig?.features?.waitlistUrl || ""
  );
  const [waitlistEmbedCode, setWaitlistEmbedCode] = useState(
    siteConfig?.features?.waitlistEmbedCode || ""
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setSaving(true);
    try {
      // If activeProject is set, save to project's homepageConfig instead of SiteConfig
      if (activeProjectId) {
        const projectId = typeof activeProjectId === 'object' ? activeProjectId.id : activeProjectId;
        
        // Build homepageConfig (only hero and heroContent, not siteName/tagline/features)
        const homepageConfig: any = {};
        
        // Hero section
        const heroFields: any = {};
        if (heroTitle) heroFields.title = heroTitle;
        if (heroSubtitle) heroFields.subtitle = heroSubtitle;
        if (videos.filter(v => v.url).length > 0) {
          heroFields.videos = videos.filter(v => v.url);
        }
        if (Object.keys(heroFields).length > 0) {
          homepageConfig.hero = heroFields;
        }
        
        // Hero content
        if (heroContent.length > 0) {
          homepageConfig.heroContent = heroContent;
        }

        const response = await fetch(`/api/payload/projects/${projectId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            homepageConfig: Object.keys(homepageConfig).length > 0 ? homepageConfig : null,
          }),
        });

        if (response.ok) {
          setSaved(true);
          setTimeout(() => {
            setSaved(false);
            window.location.reload();
          }, 1500);
        }
      } else {
        // No active project - save to SiteConfig as before
        const response = await fetch("/api/payload/globals/site-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            siteName,
            tagline,
            hero: {
              videos: videos.filter(v => v.url),
            },
            heroContent,
            features: {
              showWaitlistButton: showWaitlist,
              waitlistUrl,
              waitlistEmbedCode,
            },
          }),
        });

        if (response.ok) {
          setSaved(true);
          setTimeout(() => {
            setSaved(false);
            window.location.reload();
          }, 1500);
        }
      }
    } catch (error) {
      console.error("Failed to save:", error);
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
  const addVideo = (url: string) => {
    if (!videos.find(v => v.url === url)) {
      setVideos([...videos, { url }]);
    }
  };

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/payload/media', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const videoUrl = data.doc?.url || data.url;
        if (videoUrl) {
          addVideo(videoUrl);
          generateThumbnail(videoUrl);
        }
      } else {
        console.error('Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const moveVideo = useCallback((index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= videos.length) return;
    const updated = [...videos];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setVideos(updated);
  }, [videos]);

  // Generate video thumbnail from first frame
  const [videoThumbnails, setVideoThumbnails] = useState<Record<string, string>>({});

  const generateThumbnail = (videoUrl: string) => {
    if (videoThumbnails[videoUrl]) return;
    
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    
    // Normalize URL - convert absolute URLs to relative for same-origin
    let normalizedUrl = videoUrl;
    if (videoUrl.startsWith('http')) {
      try {
        const url = new URL(videoUrl);
        normalizedUrl = url.pathname; // Just use the path
      } catch {
        // Keep original if parsing fails
      }
    }
    video.src = normalizedUrl.startsWith('/') ? normalizedUrl : `/${normalizedUrl}`;
    video.currentTime = 1; // Get frame at 1 second
    video.muted = true;
    video.preload = 'metadata';
    
    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 90;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setVideoThumbnails(prev => ({ ...prev, [videoUrl]: dataUrl }));
      }
    };
    
    video.onloadedmetadata = () => {
      video.currentTime = 1;
    };
  };

  // Generate thumbnails for all videos
  useEffect(() => {
    videos.forEach(v => {
      if (v.url) generateThumbnail(v.url);
    });
    HERO_VIDEOS.forEach(v => generateThumbnail(v.src));
  }, [videos]);

  const getVideoThumbnail = (url: string) => {
    if (videoThumbnails[url]) return videoThumbnails[url];
    // Try without leading slash
    if (videoThumbnails[url.replace(/^\//, '')]) return videoThumbnails[url.replace(/^\//, '')];
    // Try extracting path from absolute URL
    if (url.startsWith('http')) {
      try {
        const pathname = new URL(url).pathname;
        if (videoThumbnails[pathname]) return videoThumbnails[pathname];
      } catch {}
    }
    return '/design/images/new_tarro.webp';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-shadow border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-xl font-bold text-glow">Edit Homepage</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-ember/20 border border-ember/30 rounded-lg text-ember-glow font-medium hover:bg-ember/30 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saved ? "Saved!" : "Save Changes"}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-deep rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-text-muted" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Basic Info - Only show when editing SiteConfig, not project */}
          {!isEditingProject && (
            <section>
              <h3 className="text-sm font-medium text-text-muted mb-3 uppercase tracking-wider">
                Basic Info
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-1">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full px-4 py-2 bg-deep border border-border rounded-lg text-text-primary focus:outline-none focus:border-ember-glow"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-4 py-2 bg-deep border border-border rounded-lg text-text-primary focus:outline-none focus:border-ember-glow"
                  />
                </div>
              </div>
            </section>
          )}

          {/* Hero Section - Show for both SiteConfig and project */}
          {isEditingProject && (
            <section>
              <h3 className="text-sm font-medium text-text-muted mb-3 uppercase tracking-wider">
                Hero Section
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-1">
                    Hero Title
                  </label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    placeholder="Leave empty to use SiteConfig default"
                    className="w-full px-4 py-2 bg-deep border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-ember-glow"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1">
                    Hero Subtitle
                  </label>
                  <textarea
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    placeholder="Leave empty to use SiteConfig default"
                    rows={3}
                    className="w-full px-4 py-2 bg-deep border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-ember-glow resize-none"
                  />
                </div>
              </div>
            </section>
          )}

          {/* Hero Content */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider">
                Hero Text
              </h3>
              <button
                onClick={addHeroItem}
                className="text-xs px-2 py-1 bg-deep border border-border rounded hover:border-ember/30 text-text-muted hover:text-ember-glow transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Paragraph
              </button>
            </div>
            <div className="space-y-4">
              {heroContent.map((item, index) => (
                <div key={index} className="p-4 bg-deep rounded-lg border border-border space-y-3">
                  <div className="flex items-start gap-2">
                    {/* Reorder buttons */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => moveHeroItem(index, 'up')}
                        disabled={index === 0}
                        className="p-1 hover:bg-void rounded text-text-muted hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveHeroItem(index, 'down')}
                        disabled={index === heroContent.length - 1}
                        className="p-1 hover:bg-void rounded text-text-muted hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex-1 space-y-3">
                      <textarea
                        value={item.text}
                        onChange={(e) => updateHeroItem(index, 'text', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 bg-void border border-border rounded text-text-primary focus:outline-none focus:border-ember-glow resize-none text-sm"
                        placeholder="Enter paragraph text..."
                      />
                      <div className="flex gap-2 flex-wrap">
                        <select
                          value={item.style || 'normal'}
                          onChange={(e) => updateHeroItem(index, 'style', e.target.value)}
                          className="px-3 py-1.5 bg-void border border-border rounded text-text-secondary text-sm focus:outline-none focus:border-ember-glow"
                        >
                          <option value="normal">Normal</option>
                          <option value="italic">Italic</option>
                          <option value="bold">Bold</option>
                        </select>
                        <select
                          value={item.color || ''}
                          onChange={(e) => updateHeroItem(index, 'color', e.target.value)}
                          className="px-3 py-1.5 bg-void border border-border rounded text-text-secondary text-sm focus:outline-none focus:border-ember-glow"
                        >
                          {COLOR_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={item.highlightWords || ''}
                          onChange={(e) => updateHeroItem(index, 'highlightWords', e.target.value)}
                          placeholder="Highlight words (comma-separated)"
                          className="flex-1 min-w-[180px] px-3 py-1.5 bg-void border border-border rounded text-text-secondary text-sm focus:outline-none focus:border-ember-glow"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeHeroItem(index)}
                      className="p-1.5 hover:bg-red-500/20 rounded text-text-muted hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Videos */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider">
                Background Videos
              </h3>
            </div>
            
            {/* Current videos with thumbnails */}
            <div className="space-y-2 mb-4">
              {videos.length === 0 && (
                <p className="text-sm text-text-muted italic">No videos selected.</p>
              )}
              {videos.map((video, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-deep rounded-lg border border-border">
                  {/* Reorder */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveVideo(index, 'up')}
                      disabled={index === 0}
                      className="p-0.5 hover:bg-void rounded text-text-muted hover:text-white disabled:opacity-30"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => moveVideo(index, 'down')}
                      disabled={index === videos.length - 1}
                      className="p-0.5 hover:bg-void rounded text-text-muted hover:text-white disabled:opacity-30"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                  {/* Thumbnail */}
                  <div className="w-20 h-12 rounded overflow-hidden bg-void flex-shrink-0">
                    <img 
                      src={getVideoThumbnail(video.url || '')} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary truncate">{video.url}</p>
                    <p className="text-xs text-text-muted">#{index + 1} in playlist</p>
                  </div>
                  <button
                    onClick={() => removeVideo(index)}
                    className="p-1.5 hover:bg-red-500/20 rounded text-text-muted hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Upload new video */}
            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full px-4 py-3 bg-deep border border-dashed border-border rounded-lg text-text-secondary hover:border-ember/30 hover:text-ember-glow transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload New Video
                  </>
                )}
              </button>
            </div>

            {/* Available videos to add */}
            <div className="border-t border-border pt-4">
              <p className="text-xs text-text-muted mb-2">Available videos:</p>
              <div className="grid grid-cols-3 gap-2">
                {HERO_VIDEOS.filter(v => !videos.find(sel => sel.url === v.src)).map(video => (
                  <button
                    key={video.id}
                    onClick={() => addVideo(video.src)}
                    className="group relative rounded overflow-hidden border border-border hover:border-ember/50 transition-colors"
                  >
                    <img 
                      src={video.thumbnail || '/design/images/new_tarro.webp'} 
                      alt={video.title}
                      className="w-full h-16 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <p className="absolute bottom-0 left-0 right-0 text-[10px] text-white bg-black/70 px-1 py-0.5 truncate">
                      {video.title}
                    </p>
                  </button>
                ))}
                {HERO_VIDEOS.filter(v => !videos.find(sel => sel.url === v.src)).length === 0 && (
                  <p className="col-span-3 text-xs text-text-muted italic">All videos added</p>
                )}
              </div>
            </div>
          </section>

          {/* Features - Only show when editing SiteConfig, not project */}
          {!isEditingProject && (
          <section>
            <h3 className="text-sm font-medium text-text-muted mb-3 uppercase tracking-wider">
              Features
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-deep rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  {showWaitlist ? (
                    <Eye className="w-5 h-5 text-green-500" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-text-muted" />
                  )}
                  <div>
                    <p className="text-text-primary font-medium">
                      Waitlist Button
                    </p>
                    <p className="text-sm text-text-muted">
                      Show join waitlist CTA on homepage
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowWaitlist(!showWaitlist)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    showWaitlist ? "bg-ember" : "bg-border"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      showWaitlist ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {showWaitlist && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-text-secondary mb-1">
                      Waitlist Embed Code
                    </label>
                    <textarea
                      value={waitlistEmbedCode}
                      onChange={(e) => setWaitlistEmbedCode(e.target.value)}
                      placeholder="Paste your ConvertKit/Mailchimp embed code here..."
                      rows={4}
                      className="w-full px-4 py-2 bg-deep border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-ember-glow font-mono text-xs resize-y"
                    />
                    <p className="text-xs text-text-muted mt-1">
                      Paste the full HTML embed code from ConvertKit, Mailchimp, etc.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
          )}
        </div>
      </div>
    </div>
  );
}
