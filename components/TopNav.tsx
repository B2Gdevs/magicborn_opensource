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
    <header className="fixed top-0 right-0 left-64 h-16 bg-shadow/20 backdrop-blur-lg border-b-2 border-border/30 z-30">
      <div className="h-full flex items-center justify-end px-6 gap-4">
        {active && (
          <span className="text-sm text-text-secondary">
            Active: <span className="text-ember-glow font-bold">{active.name}</span>
          </span>
        )}
        <Link
          href="/players/new"
          className="px-4 py-2 rounded-lg font-bold text-sm border-2 border-ember-glow text-ember-glow hover:bg-ember hover:text-white transition-colors"
        >
          Sign Up
        </Link>
      </div>
    </header>
  );
}
