"use client";

import { RUNES } from "@pkg/runes";
import type { RuneCode } from "@core/types";
import { useMemo } from "react";

export default function RunePicker(props: {
  selected: RuneCode[];
  onChange: (next: RuneCode[]) => void;
}) {
  const all = useMemo(() => Object.values(RUNES), []);

  const add = (r: RuneCode) => props.onChange([...props.selected, r]);
  const removeAt = (i: number) => {
    const next = props.selected.slice();
    next.splice(i, 1);
    props.onChange(next);
  };
  const clear = () => props.onChange([]);

  return (
    <div className="card grid gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Runes</h3>
        <button className="btn-secondary" onClick={clear} type="button">Clear</button>
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
        {all.map(d => (
          <button
            key={d.code}
            className="bg-[#1a1a23] border border-line rounded-lg p-3 hover:border-accent text-left"
            onClick={() => add(d.code)}
            title={`${d.concept} • P${d.powerFactor} C${d.controlFactor} • ${d.manaCost} MP`}
            type="button"
          >
            <div className="text-lg font-bold">{d.code}</div>
            <div className="text-xs text-muted">{d.concept}</div>
            <div className="mt-1 text-[11px] text-muted">P{d.powerFactor} · C{d.controlFactor} · {d.manaCost}MP</div>
          </button>
        ))}
      </div>

      <div className="mt-2">
        <h4 className="text-sm text-muted mb-1">Sequence</h4>
        {props.selected.length === 0 ? (
          <div className="text-muted">Click runes to add them to the sequence.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {props.selected.map((r, i) => (
              <span key={`${r}-${i}`} className="badge">
                {r}
                <button
                  type="button"
                  className="ml-1 text-xs hover:text-accent"
                  onClick={() => removeAt(i)}
                  aria-label="remove"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
