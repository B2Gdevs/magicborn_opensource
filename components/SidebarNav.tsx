"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
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
  Link as LinkIcon,
  ExternalLink,
  Pencil,
  type LucideIcon,
} from "lucide-react";
import { SiDiscord, SiGithub, SiX, SiYoutube, SiTwitch, SiInstagram, SiTiktok, SiLinkedin, SiReddit, SiPatreon } from "react-icons/si";
import { SidebarEditor } from "./sidebar/SidebarEditor";

// Icon mapping
const ICON_MAP: Record<string, LucideIcon> = {
  Home, BookOpen, Scroll, Palette, Settings, Code, Users, Map, Swords, Wand2,
  Shield, Crown, Flame, Sparkles, Star, Heart, Folder, FileText, Image: ImageIcon, Video,
  Music, Globe, Compass, Layers, LayoutGrid, List, Search, Info, HelpCircle,
  Bell, Mail, MessageSquare, Terminal, Database, Server, Cloud, Download, Upload, Link: LinkIcon, ExternalLink,
};

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

interface NavItem {
  label: string;
  href: string;
  icon: string;
  enabled: boolean;
  requiresAuth?: boolean;
  external?: boolean;
}

interface SocialLink {
  platform: string;
  url: string;
  enabled: boolean;
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
}

// Default config
const DEFAULT_CONFIG: SidebarConfig = {
  logo: {
    image: '/design/logos/magicborn_logo.png',
    text: 'MAGICBORN',
    showImage: true,
    showText: true,
  },
  navItems: [
    { label: 'Home', href: '/', icon: 'Home', enabled: true },
    { label: 'About', href: '/about', icon: 'BookOpen', enabled: true },
    { label: 'Lore', href: '/lore', icon: 'Scroll', enabled: true },
    { label: 'Style Guide', href: '/style-guide', icon: 'Palette', enabled: true },
    { label: 'Content Editor', href: '/content-editor', icon: 'Settings', enabled: true },
    { label: 'Developer Docs', href: '/docs/developer', icon: 'Code', enabled: true, requiresAuth: true },
    { label: 'API Docs', href: '/docs/api', icon: 'Terminal', enabled: true, requiresAuth: true },
    { label: 'Payload Admin', href: '/admin', icon: 'Database', enabled: true, requiresAuth: true },
    { label: 'DB Studio', href: 'https://local.drizzle.studio', icon: 'Server', enabled: true, requiresAuth: true, external: true },
  ],
  socialLinks: [
    { platform: 'discord', url: 'https://discord.gg/JxXHZktcR7', enabled: true },
    { platform: 'github', url: 'https://github.com/B2Gdevs/magicborn_opensource', enabled: true },
  ],
};

export default function SidebarNav() {
  const pathname = usePathname();
  const [config, setConfig] = useState<SidebarConfig>(DEFAULT_CONFIG);
  const [isEditing, setIsEditing] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [showEditButton, setShowEditButton] = useState(false);

  // Check auth status
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/payload/users/me");
      if (res.ok) {
        const data = await res.json();
        // Check various response structures
        const user = data?.user || data;
        const role = user?.role;
        const isSuperuser = user?.isSuperuser;
        if (isSuperuser || (role && ['superuser', 'editor'].includes(role))) {
          setCanEdit(true);
        } else {
          setCanEdit(false);
        }
      } else {
        setCanEdit(false);
      }
    } catch {
      setCanEdit(false);
    }
  }, []);

  // Fetch sidebar config
  useEffect(() => {
    fetch("/api/payload/globals/sidebar-config")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setConfig({
            ...DEFAULT_CONFIG,
            ...data,
            logo: { ...DEFAULT_CONFIG.logo, ...data.logo },
            navItems: data.navItems?.length ? data.navItems : DEFAULT_CONFIG.navItems,
            socialLinks: data.socialLinks?.length ? data.socialLinks : DEFAULT_CONFIG.socialLinks,
          });
        }
      })
      .catch(() => {});

    // Initial auth check
    checkAuth();

    // Listen for auth changes from other components
    const handleAuthChange = () => {
      checkAuth();
    };
    window.addEventListener('auth-changed', handleAuthChange);
    
    // Also re-check on window focus as a fallback
    const handleFocus = () => {
      checkAuth();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkAuth]);

  const navItems = config.navItems?.filter(item => {
    if (!item.enabled) return false;
    if (item.requiresAuth && !canEdit) return false;
    return true;
  }) || [];
  const socialLinks = config.socialLinks?.filter(link => link.enabled) || [];

  return (
    <>
      <aside 
        className="fixed left-0 top-0 h-full w-64 z-40"
        onMouseEnter={() => setShowEditButton(true)}
        onMouseLeave={() => setShowEditButton(false)}
      >
        <div className="flex flex-col h-full p-6">
          {/* Edit Button */}
          {canEdit && showEditButton && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute top-4 right-4 p-2 bg-ember/80 hover:bg-ember rounded-lg text-white shadow-lg transition-all z-50"
              title="Edit Sidebar"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}

          {/* Logo/Brand */}
          <Link href="/" className="mb-8 flex flex-col items-center group">
            {config.logo?.showImage !== false && config.logo?.image && (
              <div className="relative w-32 h-32 transition-transform group-hover:scale-105">
                <Image
                  src={config.logo.image}
                  alt="Magicborn"
                  fill
                  className="object-contain"
                  priority
                  sizes="128px"
                />
              </div>
            )}
            {config.logo?.showText && config.logo?.text && (
              <span className={`text-sm font-bold text-text-muted tracking-widest ${config.logo?.showImage !== false ? 'mt-2' : 'mt-0'}`}>
                {config.logo.text}
              </span>
            )}
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 flex-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = ICON_MAP[item.icon] || LinkIcon;
              
              if (item.external) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 rounded-lg font-semibold text-sm transition-all flex items-center gap-3 text-text-secondary hover:text-white hover:bg-deep/50"
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {item.label}
                    <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                  </a>
                );
              }
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all flex items-center gap-3 ${
                    isActive
                      ? "text-white bg-ember/20 border border-ember/30"
                      : "text-text-secondary hover:text-white hover:bg-deep/50"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="mt-auto pt-6 space-y-1">
              {socialLinks.map((link, index) => {
                const SocialIcon = SOCIAL_ICONS[link.platform] || Globe;
                return (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-xs text-text-muted hover:text-white hover:bg-deep/50 rounded-lg transition-all capitalize"
                  >
                    <SocialIcon className="w-4 h-4" />
                    {link.platform}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Editor Modal */}
      {isEditing && (
        <SidebarEditor
          sidebarConfig={config}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  );
}
