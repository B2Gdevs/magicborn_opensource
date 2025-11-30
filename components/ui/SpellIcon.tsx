"use client";

import type { Spell } from "@core/types";

interface SpellIconProps {
  spell: Spell;
  size?: "sm" | "md";
}

const sizeMap = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
};

export function SpellIcon({ spell, size = "md" }: SpellIconProps) {
  const isNamed = !!spell.name;
  const label = spell.name ?? "Nameless";
  const initials = isNamed
    ? label
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
    : "??";

  const rarityRing = isNamed ? "ring-2 ring-yellow-300" : "ring-2 ring-slate-600";

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full ${sizeMap[size]} bg-slate-800 text-slate-100 font-bold shadow-md ${rarityRing}`}
    >
      <span>{initials}</span>
      <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[0.6rem] text-slate-300 whitespace-nowrap max-w-[5rem] truncate">
        {label}
      </span>
    </div>
  );
}
