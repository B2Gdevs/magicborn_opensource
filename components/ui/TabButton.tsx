// components/ui/TabButton.tsx
// Tab button component for navigation

"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface TabButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: ReactNode;
  icon?: ReactNode;
}

export function TabButton({
  active = false,
  children,
  icon,
  className,
  ...rest
}: TabButtonProps) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-lg font-semibold transition-all text-sm",
        active
          ? "bg-ember text-white border-2 border-ember-glow"
          : "bg-deep text-text-secondary hover:text-ember-glow border-2 border-border",
        className
      )}
      {...rest}
    >
      <span className="flex items-center gap-2">
        {icon && <span>{icon}</span>}
        <span>{children}</span>
      </span>
    </button>
  );
}

