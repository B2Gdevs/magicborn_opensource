"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function SidebarNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/stories", label: "Stories", icon: "📖" },
    { href: "/style-guide", label: "Style Guide", icon: "🎨" },
    { href: "/development", label: "Development", icon: "⚙️" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 z-40">
      <div className="flex flex-col h-full p-6">
        {/* Logo/Brand */}
        <Link href="/" className="mb-8 flex flex-col items-center">
          <div className="relative w-48 h-48">
            <Image
              src="/logos/magicborn_logo.png"
              alt="Magicborn: Modred's Legacy"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-3 rounded-lg font-bold text-sm transition-all ${
                  isActive
                    ? "text-white"
                    : "text-text-secondary hover:text-white"
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer Links */}
        <div className="mt-auto pt-6">
          <a
            href="https://github.com/B2Gdevs/magicborn_opensource"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-2 text-xs text-text-muted hover:text-white transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </aside>
  );
}
