"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PlayerLocalRepo } from "@pkg/repo/localRepo";
import type { Player } from "@core/types";

const repo = new PlayerLocalRepo();

export default function TopNav() {
  const [active, setActive] = useState<Player | null>(null);

  useEffect(() => {
    setActive(repo.getActive());
    const onStorage = () => setActive(repo.getActive());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <header className="border-b border-border bg-shadow/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-glow hover:text-ember-glow transition-colors">
          Magicborn
          <span className="text-sm text-ember-glow block">Modred's Legacy</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/" className="text-text-secondary hover:text-ember-glow transition-colors">
            Home
          </Link>
          <Link href="/players" className="text-text-secondary hover:text-ember-glow transition-colors">
            Players
          </Link>
          <Link href="/crafting" className="text-text-secondary hover:text-ember-glow transition-colors">
            Crafting
          </Link>
          <Link href="/stories" className="text-text-secondary hover:text-shadow-purple-glow transition-colors">
            Stories
          </Link>
          <Link href="/style-guide" className="text-text-secondary hover:text-moss-glow transition-colors">
            Style Guide
          </Link>
          <span className="text-text-muted mx-2">|</span>
          <span className="text-sm text-text-secondary">
            Active: {active ? <span className="text-ember-glow font-semibold">{active.name}</span> : <span className="text-text-muted italic">none</span>}
          </span>
        </nav>
      </div>
    </header>
  );
}
