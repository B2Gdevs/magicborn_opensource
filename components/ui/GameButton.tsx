"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

interface GameButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
}

export function GameButton({
  variant = "primary",
  children,
  className = "",
  ...rest
}: GameButtonProps) {
  let base =
    "inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition-transform active:translate-y-[1px] disabled:opacity-40 disabled:cursor-not-allowed";
  let style = "";

  if (variant === "primary") {
    style = "bg-purple-600 hover:bg-purple-500 text-white";
  } else if (variant === "secondary") {
    style = "bg-slate-700 hover:bg-slate-600 text-slate-100";
  } else {
    style = "bg-transparent hover:bg-slate-800 text-slate-200 border border-slate-600";
  }

  return (
    <button className={`${base} ${style} ${className}`} {...rest}>
      {children}
    </button>
  );
}
