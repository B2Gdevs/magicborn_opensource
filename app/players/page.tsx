"use client";

import { useGameState } from "@components/providers/GameStateProvider";

export default function PlayersPage() {
  const { players, activePlayerId, deletePlayer, setActivePlayer } = useGameState();

  const remove = (id: string) => {
    deletePlayer(id);
  };

  const setActive = (id: string) => {
    setActivePlayer(id);
  };

  return (
    <main className="ml-64 mt-16 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid gap-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Players</h2>
              <a className="btn" href="/players/new">
                Create Player
              </a>
            </div>
          </div>

          <div className="card">
        {players.length === 0 ? (
          <p className="text-muted">No players yet. Create one.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-muted">
                  <th className="py-2">Active</th>
                  <th className="py-2">Name</th>
                  <th className="py-2">ID</th>
                  <th className="py-2">Affinity (non-zero)</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p) => (
                  <tr key={p.id} className="border-b border-line">
                    <td className="py-2 align-top">
                      {activePlayerId === p.id ? (
                        <span className="badge">✓</span>
                      ) : (
                        <button
                          className="btn-secondary"
                          onClick={() => setActive(p.id)}
                        >
                          Set Active
                        </button>
                      )}
                    </td>
                    <td className="py-2 align-top font-medium">{p.name}</td>
                    <td className="py-2 align-top">{p.id}</td>
                    <td className="py-2 align-top">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(p.affinity)
                          .filter(([, v]) => v && v > 0)
                          .map(([k, v]) => (
                            <span key={k} className="badge">
                              {k}:{(v as number).toFixed(2)}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td className="py-2 align-top">
                      <div className="flex gap-2">
                        <a
                          className="btn-secondary"
                          href={`/players/${encodeURIComponent(p.id)}`}
                        >
                          Open
                        </a>
                        <button
                          className="btn-secondary"
                          onClick={() => remove(p.id)}
                        >
                          Delete
                        </button>
                        {activePlayerId === p.id && (
                          <a className="btn" href="/crafting">
                            Continue
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
          </div>
        </div>
      </div>
    </main>
  );
}
