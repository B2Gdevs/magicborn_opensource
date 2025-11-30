"use client";

import { useState } from "react";
import type { RuneCode } from "@core/types";

export default function CraftingForm(props: {
  onCraft: (runes: RuneCode[], powerBias: number, controlBias: number) => void;
}) {
  const [runesCSV, setRunesCSV] = useState("F,A,R");
  const [powerBias, setPowerBias] = useState(0.2);
  const [controlBias, setControlBias] = useState(0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const runes = runesCSV.split(",").map(s => s.trim().toUpperCase()).filter(Boolean) as RuneCode[];
    props.onCraft(runes, Number(powerBias), Number(controlBias));
  };

  return (
    <div className="card">
      <h3 className="font-semibold mb-3">New Nameless Spell</h3>
      <form className="grid gap-3" onSubmit={submit}>
        <div className="grid gap-2">
          <label className="text-sm text-muted">Runes CSV (A–Z)</label>
          <input className="input" value={runesCSV} onChange={e=>setRunesCSV(e.target.value)} />
          <p className="text-sm text-muted">Example: <span className="badge">F,A,R</span></p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <label className="text-sm text-muted">Seed Power Bias (-1..1)</label>
            <input className="input" type="number" step={0.1} value={powerBias} onChange={e=>setPowerBias(Number(e.target.value))} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-muted">Seed Control Bias (-1..1)</label>
            <input className="input" type="number" step={0.1} value={controlBias} onChange={e=>setControlBias(Number(e.target.value))} />
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn" type="submit">Craft</button>
        </div>
      </form>
    </div>
  );
}
