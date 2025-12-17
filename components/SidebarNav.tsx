"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Book, Palette, Settings, Github, MessageSquare } from "lucide-react";

// Discord icon component
function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

export default function SidebarNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/about", label: "About", icon: BookOpen },
    { href: "/stories", label: "Stories", icon: Book },
    { href: "/style-guide", label: "Style Guide", icon: Palette },
    { href: "/content-editor", label: "Content Editor", icon: Settings },
    { href: "/openwebui", label: "Magicborn Assistant", icon: MessageSquare },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 z-40">
      <div className="flex flex-col h-full p-6">
        {/* Logo/Brand */}
        <Link href="/" className="mb-8 flex flex-col items-center group">
          <div className="relative w-32 h-32 transition-transform group-hover:scale-105">
            <Image
              src="/design/logos/magicborn_logo.png"
              alt="Magicborn: Mordred's Legacy"
              fill
              className="object-contain"
              priority
              sizes="128px"
            />
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
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

        {/* Footer Links */}
        <div className="mt-auto pt-6 space-y-1">
          <a
            href="https://discord.gg/JxXHZktcR7"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-xs text-text-muted hover:text-white hover:bg-deep/50 rounded-lg transition-all"
          >
            <DiscordIcon className="w-4 h-4" />
            Discord
          </a>
          <a
            href="https://github.com/B2Gdevs/magicborn_opensource"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-xs text-text-muted hover:text-white hover:bg-deep/50 rounded-lg transition-all"
          >
            <Github className="w-4 h-4" />
            GitHub
          </a>
        </div>
      </div>
    </aside>
  );
}
