"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import HeroVideo from "@components/HeroVideo";
import { HomepageEditor } from "./HomepageEditor";
import { Pencil, LogIn, LogOut, User } from "lucide-react";

interface HeroContentItem {
  text: string;
  style?: 'normal' | 'italic' | 'bold';
  highlightWords?: string;
  color?: string;
}

interface VideoItem {
  url?: string;
  video?: { url?: string };
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
  };
}

interface UserInfo {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface HomepageContentProps {
  siteConfig: SiteConfig | null;
}

// Default content when SiteConfig is empty
const DEFAULT_HERO_CONTENT: HeroContentItem[] = [
  {
    text: 'In the shadows where magic flows like blood, the Magicborn serve. Oppressed. Silenced. Forced into war.',
    style: 'italic',
    highlightWords: 'Magicborn',
  },
  {
    text: 'You are one of them. A military slave, your power both gift and curse. In this godforsaken land, survival comes not from strength, but from the spells you craft.',
    style: 'normal',
  },
  {
    text: "This is the story of the oppressed. Of what they must do to survive... their way.",
    style: 'italic',
    highlightWords: 'their way',
  },
];

function highlightText(text: string, highlightWords?: string): string {
  if (!highlightWords) return text;
  const words = highlightWords.split(',').map(w => w.trim());
  let result = text;
  words.forEach(word => {
    result = result.replace(
      new RegExp(`(${word})`, 'gi'),
      '<span class="text-ember-glow font-normal">$1</span>'
    );
  });
  return result;
}

export function HomepageContent({ siteConfig }: HomepageContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showEditButton, setShowEditButton] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Only show auth UI in dev or with ?admin query param
  const [showAuthUI, setShowAuthUI] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    // Show auth UI if: dev mode, or ?admin in URL, or already logged in
    const isDev = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
    const hasAdminParam = new URLSearchParams(window.location.search).has('admin');
    setShowAuthUI(isDev || hasAdminParam);
    
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/payload/users/me');
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          setUser(data.user);
        }
      }
    } catch {
      // Not logged in
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/payload/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        setShowLoginForm(false);
        setLoginEmail('');
        setLoginPassword('');
        // Dispatch event to notify other components of auth change
        window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user: data.user } }));
      } else {
        setLoginError(data.message || 'Login failed');
      }
    } catch {
      setLoginError('Login failed');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/payload/users/logout', { method: 'POST' });
      setUser(null);
      // Dispatch event to notify other components of auth change
      window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user: null } }));
    } catch {
      // Ignore
    }
  };

  const canEdit = user && ['superuser', 'editor'].includes(user.role || '');
  const heroContent = siteConfig?.heroContent?.length 
    ? siteConfig.heroContent 
    : DEFAULT_HERO_CONTENT;
  
  // Extract video URLs from config
  const videoUrls = siteConfig?.hero?.videos
    ?.map(v => v.url || v.video?.url)
    .filter((url): url is string => !!url);

  return (
    <main
      className="min-h-screen bg-black text-white"
      onMouseEnter={() => setShowEditButton(true)}
      onMouseLeave={() => setShowEditButton(false)}
    >
      {/* Auth UI - Bottom Right (only in dev or with ?admin) */}
      {(showAuthUI || user) && (
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
        {user ? (
          <>
            <span className="text-sm text-text-muted flex items-center gap-1">
              <User className="w-4 h-4" />
              {user.name || user.email}
              <span className="text-xs px-1.5 py-0.5 bg-ember/20 rounded text-ember-glow">
                {user.role}
              </span>
            </span>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-shadow rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-text-muted" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setShowLoginForm(true)}
            className="px-3 py-1.5 bg-shadow/80 hover:bg-shadow border border-border rounded-lg text-sm text-text-muted hover:text-white transition-colors flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Login
          </button>
        )}
      </div>
      )}

      {/* Login Modal */}
      {showLoginForm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form
            onSubmit={handleLogin}
            className="bg-shadow border border-border rounded-xl p-6 w-full max-w-sm space-y-4"
          >
            <h2 className="text-xl font-bold text-glow">Login</h2>
            {loginError && (
              <p className="text-red-400 text-sm">{loginError}</p>
            )}
            <div>
              <label className="block text-sm text-text-secondary mb-1">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
                    e.preventDefault();
                    (e.target as HTMLInputElement).select();
                  }
                }}
                className="w-full px-4 py-2 bg-deep border border-border rounded-lg text-text-primary focus:outline-none focus:border-ember-glow"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
                    e.preventDefault();
                    (e.target as HTMLInputElement).select();
                  }
                }}
                className="w-full px-4 py-2 bg-deep border border-border rounded-lg text-text-primary focus:outline-none focus:border-ember-glow"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-ember/20 border border-ember/30 rounded-lg text-ember-glow font-medium hover:bg-ember/30 transition-colors"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setShowLoginForm(false)}
                className="px-4 py-2 bg-deep border border-border rounded-lg text-text-muted hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Button - Only visible to editors when logged in */}
      {canEdit && showEditButton && !isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="fixed bottom-16 right-4 z-50 px-4 py-2 bg-ember/80 hover:bg-ember rounded-lg text-white font-medium flex items-center gap-2 shadow-lg transition-all"
        >
          <Pencil className="w-4 h-4" />
          Edit Page
        </button>
      )}

      {/* Editor Modal */}
      {isEditing && (
        <HomepageEditor
          siteConfig={siteConfig}
          onClose={() => setIsEditing(false)}
        />
      )}

      {/* Hero Section with Video Background */}
      <div className="fixed inset-0 z-0">
        <HeroVideo loopVideos={true} videoUrls={videoUrls?.length ? videoUrls : undefined}>
          <div className="container mx-auto px-12 text-center">
            <div className="max-w-4xl mx-auto">
              {/* Logo */}
              <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto mb-12 animate-fade-in">
                <Image
                  src="/design/logos/magicborn_logo.png"
                  alt={siteConfig?.siteName || "Magicborn: Mordred's Legacy"}
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                  sizes="(max-width: 768px) 192px, 256px"
                />
              </div>

              {/* Hero Text - From Payload */}
              <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-delay-2">
                {heroContent.map((item, index) => (
                  <p
                    key={index}
                    className={`leading-relaxed font-serif ${
                      index === 0
                        ? 'text-lg md:text-xl'
                        : index === heroContent.length - 1
                        ? 'text-sm md:text-base'
                        : 'text-base md:text-lg'
                    } ${item.color ? `text-${item.color}` : 'text-text-secondary'} ${
                      item.style === 'italic' ? 'italic' : ''
                    } ${item.style === 'bold' ? 'font-bold' : ''}`}
                    dangerouslySetInnerHTML={{
                      __html: highlightText(item.text, item.highlightWords),
                    }}
                  />
                ))}
              </div>

              {/* Waitlist Button */}
              {siteConfig?.features?.showWaitlistButton &&
                siteConfig.features.waitlistUrl && (
                  <div className="mt-12 animate-fade-in-delay-3">
                    <a
                      href={siteConfig.features.waitlistUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-8 py-4 bg-ember hover:bg-ember-glow text-white font-bold rounded-lg shadow-lg transition-all hover:scale-105"
                    >
                      Join the Waitlist
                    </a>
                  </div>
                )}
            </div>
          </div>
        </HeroVideo>
      </div>
    </main>
  );
}
