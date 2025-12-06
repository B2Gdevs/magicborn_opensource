"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Book, Palette, Settings, MessageCircle, Github } from "lucide-react";

export default function SidebarNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/about", label: "About", icon: BookOpen },
    { href: "/stories", label: "Stories", icon: Book },
    { href: "/style-guide", label: "Style Guide", icon: Palette },
    { href: "/development", label: "Development", icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 z-40">
      <div className="flex flex-col h-full p-6">
        {/* Logo/Brand */}
        <Link href="/" className="mb-8 flex flex-col items-center group">
          <div className="relative w-32 h-32 transition-transform group-hover:scale-105">
            <Image
              src="/logos/magicborn_logo.png"
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
            <MessageCircle className="w-4 h-4" />
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
