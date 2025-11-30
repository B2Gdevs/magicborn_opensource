"use client";

import type { Spell } from "@core/types";

export default function SpellTable(props: {
  spells: Spell[];
  onEval: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="card">
      <h3 className="font-semibold mb-3">Spells</h3>
      {props.spells.length === 0 ? (
        <p className="text-muted">No spells yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-muted">
                <th className="py-2">Name</th>
                <th className="py-2">Runes</th>
                <th className="py-2">Lvl</th>
                <th className="py-2">Growth</th>
                <th className="py-2">Last Eval</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {props.spells.map(s => (
                <tr key={s.id} className="border-b border-line">
                  <td className="py-2 align-top">{s.name ?? <span className="badge">Nameless</span>}</td>
                  <td className="py-2 align-top">{s.runes.join("")}</td>
                  <td className="py-2 align-top tabular-nums">{s.level}</td>
                  <td className="py-2 align-top">
                    <div className="flex flex-wrap gap-2">
                      <span className="badge">P:{Math.round(s.growth.power)}</span>
                      <span className="badge">C:{Math.round(s.growth.control)}</span>
                      <span className="badge">S:{Math.round(s.growth.stability)}</span>
                      <span className="badge">A:{Math.round(s.growth.affinity)}</span>
                      <span className="badge">V:{Math.round(s.growth.versatility)}</span>
                    </div>
                  </td>
                  <td className="py-2 align-top">
                    {s.lastEval ? (
                      <div className="flex flex-wrap gap-2 text-sm">
                        <span className="badge">Power:{s.lastEval.power}</span>
                        <span className="badge">Cost:{s.lastEval.cost}</span>
                        <span className="badge">Instab:{s.lastEval.instability}</span>
                      </div>
                    ) : <span className="text-muted">—</span>}
                  </td>
                  <td className="py-2 align-top">
                    <div className="flex gap-2">
                      <button className="btn-secondary" onClick={()=>props.onEval(s.id)}>Evaluate</button>
                      <button className="btn-secondary" onClick={()=>props.onDelete(s.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
