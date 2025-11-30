"use client";

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
    <header className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Rune Crafter</h1>
      <nav className="flex items-center gap-3">
        <a className="badge hover:text-accent" href="/">Home</a>
        <a className="badge hover:text-accent" href="/players">Players</a>
        <a className="badge hover:text-accent" href="/players/new">Create Player</a>
        <span className="hidden sm:inline-block mx-2 text-muted">|</span>
        <span className="badge">
          Active: {active ? <b>{active.name}</b> : <i className="text-muted">none</i>}
        </span>
      </nav>
    </header>
  );
}
