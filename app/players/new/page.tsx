"use client";

import { useState } from "react";
import { PlayerService } from "@pkg/player";
import type { AlphabetVector } from "@core/types";
import { useGameState } from "@/components/providers/GameStateProvider";

const service = new PlayerService();

function parseAffinityCSV(csv: string): AlphabetVector {
  const out: Record<string, number> = {};
  if (!csv.trim()) return out;
  for (const pair of csv.split(",")) {
    const [k, v] = pair.split(":");
    if (!k || v === undefined) continue;
    const n = Number(v);
    if (!Number.isNaN(n)) out[k.trim().toUpperCase()] = n;
  }
  return out;
}

export default function CreatePlayerPage() {
  const { createOrUpdatePlayer } = useGameState();

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [affCSV, setAffCSV] = useState("F:0.6,A:0.3,R:0.2");
  const [errors, setErrors] = useState<string[]>([]);
  const [ok, setOk] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOk(false);
    setErrors([]);

    const affinity = parseAffinityCSV(affCSV);
    const player = service.create(id || "p1", name || "Player One", affinity);
    const errs = service.validate(player);
    if (errs.length) {
      setErrors(errs);
      return;
    }

    createOrUpdatePlayer(player);
    setOk(true);
  };

  return (
    <main className="ml-64 mt-16 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-4">
          <div className="card">
        <h2 className="text-xl font-semibold mb-2">Create Player</h2>
        <p className="text-muted">We’ll store players in localStorage for now.</p>
      </div>

      <form className="card grid gap-4" onSubmit={onSubmit}>
        <div className="grid gap-2">
          <label className="text-sm text-muted" htmlFor="pid">Player ID</label>
          <input id="pid" className="input" placeholder="p1" value={id} onChange={e=>setId(e.target.value)} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-muted" htmlFor="pname">Player Name</label>
          <input id="pname" className="input" placeholder="Player One" value={name} onChange={e=>setName(e.target.value)} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-muted" htmlFor="aff">Affinity CSV (A–Z, 0..1)</label>
          <input id="aff" className="input" value={affCSV} onChange={e=>setAffCSV(e.target.value)} />
          <p className="text-sm text-muted">Example: <span className="badge">F:0.6,A:0.3,R:0.2</span></p>
        </div>

        {errors.length > 0 && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm">
            <b className="text-red-300">Please fix:</b>
            <ul className="list-disc pl-5">
              {errors.map((er, i) => <li key={i}>{er}</li>)}
            </ul>
          </div>
        )}

        {ok && (
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm">
            <b className="text-emerald-300">Saved!</b> Go to <a className="underline" href="/players">Players</a> or start crafting next.
          </div>
        )}

        <div className="flex gap-2">
          <button className="btn" type="submit">Save Player</button>
          <a className="btn-secondary" href="/players">Back to Players</a>
        </div>
      </form>
        </div>
      </div>
    </main>
  );
}
