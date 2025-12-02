"use client";

import Link from "next/link";
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
    <aside className="fixed left-0 top-0 h-full w-64 bg-shadow/20 backdrop-blur-lg border-r-2 border-border/30 z-40">
      <div className="flex flex-col h-full p-6">
        {/* Logo/Brand */}
        <Link href="/" className="mb-8">
          <h1 className="text-2xl font-bold text-glow mb-1">Magicborn</h1>
          <p className="text-xs text-ember-glow italic">Modred's Legacy</p>
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
                    ? "bg-ember text-white border-2 border-ember-glow"
                    : "text-text-secondary hover:text-ember-glow hover:bg-deep"
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer Links */}
        <div className="mt-auto pt-6 border-t-2 border-border">
          <a
            href="https://github.com/B2Gdevs/magicborn_opensource"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-2 text-xs text-text-muted hover:text-ember-glow transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </aside>
  );
}

