"use client";

import type { RuneCode } from "@core/types";
import { RUNES } from "@pkg/runes";

interface RuneIconProps {
  rune: RuneCode;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  onClick?: () => void;
}

const sizeMap = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

export function RuneIcon({ rune, size = "md", selected, onClick }: RuneIconProps) {
  const def = RUNES[rune];

  // simple color theme based on concept / tags
  const primaryTag = def.tags[0];
  let bg = "bg-slate-700";
  if (primaryTag === "Damage") bg = "bg-red-600";
  if (primaryTag === "Heal") bg = "bg-emerald-600";
  if (primaryTag === "Buff") bg = "bg-indigo-600";
  if (primaryTag === "Debuff") bg = "bg-fuchsia-600";
  if (primaryTag === "Utility") bg = "bg-amber-600";
  if (primaryTag === "AOE") bg = "bg-orange-600";
  if (primaryTag === "DOT") bg = "bg-rose-600";
  if (primaryTag === "CC") bg = "bg-cyan-600";
  if (primaryTag === "Silence") bg = "bg-zinc-700";

  const ring = selected ? "ring-2 ring-yellow-300 ring-offset-2 ring-offset-slate-900" : "";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative inline-flex items-center justify-center rounded-full ${sizeMap[size]} ${bg} ${ring} text-white font-bold shadow-md hover:scale-105 transition-transform`}
    >
      <span>{rune}</span>
      <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[0.6rem] text-slate-200 whitespace-nowrap">
        {def.concept}
      </span>
    </button>
  );
}
