"use client";

import { useState, useRef } from "react";
import {
  X,
  Save,
  Loader2,
  Check,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Home,
  BookOpen,
  Scroll,
  Palette,
  Settings,
  Code,
  Users,
  Map,
  Swords,
  Wand2,
  Shield,
  Crown,
  Flame,
  Sparkles,
  Star,
  Heart,
  Folder,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Globe,
  Compass,
  Layers,
  LayoutGrid,
  List,
  Search,
  Info,
  HelpCircle,
  Bell,
  Mail,
  MessageSquare,
  Terminal,
  Database,
  Server,
  Cloud,
  Download,
  Upload,
  Link,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { SiDiscord, SiGithub, SiX, SiYoutube, SiTwitch, SiInstagram, SiTiktok, SiLinkedin, SiReddit, SiPatreon } from "react-icons/si";

// Icon mapping
const ICON_MAP: Record<string, LucideIcon> = {
  Home, BookOpen, Scroll, Palette, Settings, Code, Users, Map, Swords, Wand2,
  Shield, Crown, Flame, Sparkles, Star, Heart, Folder, FileText, Image: ImageIcon, Video,
  Music, Globe, Compass, Layers, LayoutGrid, List, Search, Info, HelpCircle,
  Bell, Mail, MessageSquare, Terminal, Database, Server, Cloud, Download, Upload, Link, ExternalLink,
};

const ICON_OPTIONS = Object.keys(ICON_MAP);

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  discord: SiDiscord,
  github: SiGithub,
  twitter: SiX,
  youtube: SiYoutube,
  twitch: SiTwitch,
  instagram: SiInstagram,
  tiktok: SiTiktok,
  linkedin: SiLinkedin,
  reddit: SiReddit,
  patreon: SiPatreon,
};

const SOCIAL_OPTIONS = [
  { label: 'Discord', value: 'discord' },
  { label: 'GitHub', value: 'github' },
  { label: 'Twitter/X', value: 'twitter' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'Twitch', value: 'twitch' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'TikTok', value: 'tiktok' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'Reddit', value: 'reddit' },
  { label: 'Patreon', value: 'patreon' },
];

interface NavItem {
  label: string;
  href: string;
  icon: string;
  enabled: boolean;
  requiresAuth?: boolean;
}

interface SocialLink {
  platform: string;
  url: string;
  enabled: boolean;
}

interface SEOConfig {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterSite?: string;
  keywords?: string;
}

interface SidebarConfig {
  logo?: {
    image?: string;
    text?: string;
    showImage?: boolean;
    showText?: boolean;
  };
  favicon?: string;
  navItems?: NavItem[];
  socialLinks?: SocialLink[];
  seo?: SEOConfig;
}

interface SidebarEditorProps {
  sidebarConfig: SidebarConfig | null;
  onClose: () => void;
}

export function SidebarEditor({ sidebarConfig, onClose }: SidebarEditorProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const ogImageInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [logoImage, setLogoImage] = useState(sidebarConfig?.logo?.image || '/design/logos/magicborn_logo.png');
  const [logoText, setLogoText] = useState(sidebarConfig?.logo?.text || 'MAGICBORN');
  const [showLogoImage, setShowLogoImage] = useState(sidebarConfig?.logo?.showImage ?? true);
  const [showLogoText, setShowLogoText] = useState(sidebarConfig?.logo?.showText ?? true);
  const [favicon, setFavicon] = useState(sidebarConfig?.favicon || '/favicon.ico');
  const [navItems, setNavItems] = useState<NavItem[]>(
    sidebarConfig?.navItems || [
      { label: 'Home', href: '/', icon: 'Home', enabled: true },
      { label: 'About', href: '/about', icon: 'BookOpen', enabled: true },
      { label: 'Lore', href: '/lore', icon: 'Scroll', enabled: true },
      { label: 'Style Guide', href: '/style-guide', icon: 'Palette', enabled: true },
      { label: 'Content Editor', href: '/content-editor', icon: 'Settings', enabled: true },
      { label: 'API Docs', href: '/api/docs', icon: 'Terminal', enabled: true },
    ]
  );
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(
    sidebarConfig?.socialLinks || [
      { platform: 'discord', url: 'https://discord.gg/JxXHZktcR7', enabled: true },
      { platform: 'github', url: 'https://github.com/B2Gdevs/magicborn_opensource', enabled: true },
    ]
  );

  // SEO state
  const [metaTitle, setMetaTitle] = useState(sidebarConfig?.seo?.metaTitle || "Magicborn: Mordred's Legacy");
  const [metaDescription, setMetaDescription] = useState(sidebarConfig?.seo?.metaDescription || 'A dark fantasy story of the oppressed Magicborn, military slaves whose power is both gift and curse.');
  const [ogImage, setOgImage] = useState(sidebarConfig?.seo?.ogImage || '/design/images/og-image.png');
  const [ogType, setOgType] = useState(sidebarConfig?.seo?.ogType || 'website');
  const [twitterCard, setTwitterCard] = useState(sidebarConfig?.seo?.twitterCard || 'summary_large_image');
  const [twitterSite, setTwitterSite] = useState(sidebarConfig?.seo?.twitterSite || '');
  const [keywords, setKeywords] = useState(sidebarConfig?.seo?.keywords || 'magicborn, rpg, fantasy, spellcrafting, dark fantasy');

  const handleUpload = async (file: File, type: 'logo' | 'favicon' | 'ogImage') => {
    setUploading(type);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/payload/media', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const url = data.url;
        if (url) {
          if (type === 'logo') setLogoImage(url);
          else if (type === 'favicon') setFavicon(url);
          else if (type === 'ogImage') setOgImage(url);
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/payload/globals/sidebar-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logo: {
            image: logoImage,
            text: logoText,
            showImage: showLogoImage,
            showText: showLogoText,
          },
          favicon,
          navItems,
          socialLinks,
          seo: {
            metaTitle,
            metaDescription,
            ogImage,
            ogType,
            twitterCard,
            twitterSite,
            keywords,
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
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  };

  // Nav item handlers
  const addNavItem = () => {
    setNavItems([...navItems, { label: 'New Link', href: '/', icon: 'Link', enabled: true }]);
  };

  const updateNavItem = (index: number, field: keyof NavItem, value: string | boolean) => {
    const updated = [...navItems];
    updated[index] = { ...updated[index], [field]: value };
    setNavItems(updated);
  };

  const removeNavItem = (index: number) => {
    setNavItems(navItems.filter((_, i) => i !== index));
  };

  const moveNavItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= navItems.length) return;
    const updated = [...navItems];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setNavItems(updated);
  };

  // Social link handlers
  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: 'discord', url: '', enabled: true }]);
  };

  const updateSocialLink = (index: number, field: keyof SocialLink, value: string | boolean) => {
    const updated = [...socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setSocialLinks(updated);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-shadow border border-border rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-xl font-bold text-glow">Edit Sidebar & SEO</h2>
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
          {/* Logo Section */}
          <section>
            <h3 className="text-sm font-medium text-text-muted mb-3 uppercase tracking-wider">
              Logo & Branding
            </h3>
            <div className="space-y-4">
              {/* Logo with clickable preview */}
              <div className="flex gap-4">
                <button
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploading === 'logo'}
                  className="w-24 h-24 bg-deep rounded-lg border border-border flex items-center justify-center overflow-hidden cursor-pointer hover:border-ember/50 transition-colors group relative"
                  title="Click to upload new logo"
                >
                  {logoImage ? (
                    <img src={logoImage} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <Upload className="w-6 h-6 text-text-muted" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {uploading === 'logo' ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Upload className="w-6 h-6 text-white" />}
                  </div>
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'logo')}
                  className="hidden"
                />
                <div className="flex-1 space-y-2">
                  <label className="block text-sm text-text-secondary">Logo Image</label>
                  <input
                    type="text"
                    value={logoImage}
                    onChange={(e) => setLogoImage(e.target.value)}
                    className="w-full px-3 py-2 bg-deep border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:border-ember-glow"
                    placeholder="/design/logos/logo.png"
                  />
                  <p className="text-xs text-text-muted">Click thumbnail to upload, or enter path manually</p>
                </div>
              </div>

              {/* Favicon with clickable preview */}
              <div className="flex gap-4">
                <button
                  onClick={() => faviconInputRef.current?.click()}
                  disabled={uploading === 'favicon'}
                  className="w-16 h-16 bg-deep rounded-lg border border-border flex items-center justify-center overflow-hidden cursor-pointer hover:border-ember/50 transition-colors group relative"
                  title="Click to upload new favicon"
                >
                  {favicon ? (
                    <img src={favicon} alt="Favicon" className="w-8 h-8 object-contain" />
                  ) : (
                    <Upload className="w-4 h-4 text-text-muted" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {uploading === 'favicon' ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Upload className="w-4 h-4 text-white" />}
                  </div>
                </button>
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept="image/*,.ico,.svg"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'favicon')}
                  className="hidden"
                />
                <div className="flex-1 space-y-2">
                  <label className="block text-sm text-text-secondary">Favicon</label>
                  <input
                    type="text"
                    value={favicon}
                    onChange={(e) => setFavicon(e.target.value)}
                    className="w-full px-3 py-2 bg-deep border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:border-ember-glow"
                    placeholder="/favicon.ico or /app/icon.svg"
                  />
                  <p className="text-xs text-text-muted">16x16 or 32x32 recommended. Supports .ico, .png, .svg</p>
                </div>
              </div>

              {/* Display toggles */}
              <div className="flex gap-4 p-3 bg-deep/50 rounded-lg border border-border">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLogoImage}
                    onChange={(e) => setShowLogoImage(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-text-secondary">Show Logo Image</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLogoText}
                    onChange={(e) => setShowLogoText(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-text-secondary">Show Logo Text</span>
                </label>
              </div>

              {/* Logo text */}
              <div>
                <label className="block text-sm text-text-secondary mb-1">Logo Text</label>
                <input
                  type="text"
                  value={logoText}
                  onChange={(e) => setLogoText(e.target.value)}
                  className="w-full px-4 py-2 bg-deep border border-border rounded-lg text-text-primary focus:outline-none focus:border-ember-glow"
                  placeholder="MAGICBORN"
                />
              </div>
            </div>
          </section>

          {/* SEO & Open Graph */}
          <section>
            <h3 className="text-sm font-medium text-text-muted mb-3 uppercase tracking-wider">
              SEO & Open Graph
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Meta Title</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-deep border border-border rounded-lg text-text-primary focus:outline-none focus:border-ember-glow"
                  placeholder="Page title for search engines"
                />
                <p className="text-xs text-text-muted mt-1">{metaTitle.length}/60 characters</p>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">Meta Description</label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-deep border border-border rounded-lg text-text-primary focus:outline-none focus:border-ember-glow resize-none"
                  placeholder="Description for search engines"
                />
                <p className="text-xs text-text-muted mt-1">{metaDescription.length}/160 characters</p>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">Keywords</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="w-full px-4 py-2 bg-deep border border-border rounded-lg text-text-primary focus:outline-none focus:border-ember-glow"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>

              {/* OG Image with clickable preview */}
              <div className="flex gap-4">
                <button
                  onClick={() => ogImageInputRef.current?.click()}
                  disabled={uploading === 'ogImage'}
                  className="w-32 h-20 bg-deep rounded-lg border border-border flex items-center justify-center overflow-hidden cursor-pointer hover:border-ember/50 transition-colors group relative flex-shrink-0"
                  title="Click to upload new Open Graph image"
                >
                  {ogImage ? (
                    <img src={ogImage} alt="OG Image" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-6 h-6 text-text-muted" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {uploading === 'ogImage' ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Upload className="w-5 h-5 text-white" />}
                  </div>
                </button>
                <input
                  ref={ogImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'ogImage')}
                  className="hidden"
                />
                <div className="flex-1 space-y-2">
                  <label className="block text-sm text-text-secondary">Open Graph Image</label>
                  <input
                    type="text"
                    value={ogImage}
                    onChange={(e) => setOgImage(e.target.value)}
                    className="w-full px-3 py-2 bg-deep border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:border-ember-glow"
                    placeholder="/design/images/og-image.png"
                  />
                  <p className="text-xs text-text-muted">1200x630px recommended. Shows when sharing on social media.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-1" title="Defines how search engines categorize your page">
                    OG Type <span className="text-text-muted cursor-help" title="website: General site, article: Blog post, game: Video game">ⓘ</span>
                  </label>
                  <select
                    value={ogType}
                    onChange={(e) => setOgType(e.target.value)}
                    className="w-full px-4 py-2 bg-deep border border-border rounded-lg text-text-primary focus:outline-none focus:border-ember-glow"
                  >
                    <option value="website">Website</option>
                    <option value="article">Article</option>
                    <option value="game">Game</option>
                    <option value="product">Product</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1" title="Controls how your link appears on Twitter/X">
                    Twitter Card <span className="text-text-muted cursor-help" title="summary: Small image, summary_large_image: Large preview image">ⓘ</span>
                  </label>
                  <select
                    value={twitterCard}
                    onChange={(e) => setTwitterCard(e.target.value)}
                    className="w-full px-4 py-2 bg-deep border border-border rounded-lg text-text-primary focus:outline-none focus:border-ember-glow"
                  >
                    <option value="summary">Summary</option>
                    <option value="summary_large_image">Summary Large Image</option>
                    <option value="player">Player</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">
                  Twitter @handle <span className="text-text-muted text-xs">(optional)</span>
                </label>
                <input
                  type="text"
                  value={twitterSite}
                  onChange={(e) => setTwitterSite(e.target.value)}
                  className="w-full px-4 py-2 bg-deep border border-border rounded-lg text-text-primary focus:outline-none focus:border-ember-glow"
                  placeholder="@yourhandle"
                />
                <p className="text-xs text-text-muted mt-1">Leave blank if you don&apos;t have a Twitter/X account</p>
              </div>
            </div>
          </section>

          {/* Navigation Items */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider">
                Navigation Links
              </h3>
              <button
                onClick={addNavItem}
                className="text-xs px-2 py-1 bg-deep border border-border rounded hover:border-ember/30 text-text-muted hover:text-ember-glow transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Link
              </button>
            </div>
            <div className="space-y-2">
              {navItems.map((item, index) => {
                const IconComponent = ICON_MAP[item.icon] || Link;
                return (
                  <div key={index} className="flex items-center gap-2 p-3 bg-deep rounded-lg border border-border">
                    {/* Reorder */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => moveNavItem(index, 'up')}
                        disabled={index === 0}
                        className="p-0.5 hover:bg-void rounded text-text-muted hover:text-white disabled:opacity-30"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => moveNavItem(index, 'down')}
                        disabled={index === navItems.length - 1}
                        className="p-0.5 hover:bg-void rounded text-text-muted hover:text-white disabled:opacity-30"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                    
                    {/* Icon preview */}
                    <div className="w-8 h-8 flex items-center justify-center bg-void rounded">
                      <IconComponent className="w-4 h-4 text-text-secondary" />
                    </div>

                    {/* Icon select */}
                    <select
                      value={item.icon}
                      onChange={(e) => updateNavItem(index, 'icon', e.target.value)}
                      className="px-2 py-1.5 bg-void border border-border rounded text-text-secondary text-sm focus:outline-none focus:border-ember-glow"
                    >
                      {ICON_OPTIONS.map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>

                    {/* Label */}
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => updateNavItem(index, 'label', e.target.value)}
                      placeholder="Label"
                      className="flex-1 px-3 py-1.5 bg-void border border-border rounded text-text-primary text-sm focus:outline-none focus:border-ember-glow"
                    />

                    {/* URL */}
                    <input
                      type="text"
                      value={item.href}
                      onChange={(e) => updateNavItem(index, 'href', e.target.value)}
                      placeholder="/path"
                      className="w-32 px-3 py-1.5 bg-void border border-border rounded text-text-primary text-sm focus:outline-none focus:border-ember-glow"
                    />

                    {/* Enabled toggle */}
                    <label className="flex items-center gap-1 cursor-pointer" title="Show this link">
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={(e) => updateNavItem(index, 'enabled', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-xs text-text-muted">On</span>
                    </label>

                    {/* Admin only toggle */}
                    <label className="flex items-center gap-1 cursor-pointer" title="Only visible to logged-in admins">
                      <input
                        type="checkbox"
                        checked={item.requiresAuth || false}
                        onChange={(e) => updateNavItem(index, 'requiresAuth', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-xs text-amber-400">🔒</span>
                    </label>

                    {/* Delete */}
                    <button
                      onClick={() => removeNavItem(index)}
                      className="p-1.5 hover:bg-red-500/20 rounded text-text-muted hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Social Links */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider">
                Social Links
              </h3>
              <button
                onClick={addSocialLink}
                className="text-xs px-2 py-1 bg-deep border border-border rounded hover:border-ember/30 text-text-muted hover:text-ember-glow transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Social
              </button>
            </div>
            <div className="space-y-2">
              {socialLinks.map((link, index) => {
                const SocialIcon = SOCIAL_ICONS[link.platform] || Globe;
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-deep rounded-lg border border-border">
                    {/* Icon preview */}
                    <div className="w-8 h-8 flex items-center justify-center bg-void rounded">
                      <SocialIcon className="w-4 h-4 text-text-secondary" />
                    </div>

                    {/* Platform select */}
                    <select
                      value={link.platform}
                      onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                      className="px-3 py-1.5 bg-void border border-border rounded text-text-secondary text-sm focus:outline-none focus:border-ember-glow"
                    >
                      {SOCIAL_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>

                    {/* URL */}
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                      placeholder="https://..."
                      className="flex-1 px-3 py-1.5 bg-void border border-border rounded text-text-primary text-sm focus:outline-none focus:border-ember-glow"
                    />

                    {/* Enabled toggle */}
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={link.enabled}
                        onChange={(e) => updateSocialLink(index, 'enabled', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-xs text-text-muted">On</span>
                    </label>

                    {/* Delete */}
                    <button
                      onClick={() => removeSocialLink(index)}
                      className="p-1.5 hover:bg-red-500/20 rounded text-text-muted hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
