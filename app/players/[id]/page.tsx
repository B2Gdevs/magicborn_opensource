"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Player } from "@core/types";
import { PlayerLocalRepo } from "@pkg/repo/localRepo";

const repo = new PlayerLocalRepo();

export default function PlayerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [player, setPlayer] = useState<Player | null>(null);

  useEffect(() => {
    const pid = Array.isArray(params.id) ? params.id[0] : params.id;
    const p = repo.get(pid);
    if (!p) {
      router.replace("/players");
      return;
    }
    setPlayer(p);
  }, [params.id, router]);

  if (!player) return null;

  return (
    <main className="grid gap-4">
      <div className="card">
        <h2 className="text-xl font-semibold">Player: {player.name}</h2>
        <p className="text-muted">ID: {player.id}</p>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-2">Affinity</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(player.affinity)
            .filter(([, v]) => v && v > 0)
            .map(([k, v]) => (
              <span className="badge" key={k}>{k}:{(v as number).toFixed(2)}</span>
            ))}
        </div>
      </div>
    </main>
  );
}
