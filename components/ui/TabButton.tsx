// components/ui/TabButton.tsx
// Tab button component for navigation

"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface TabButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children?: ReactNode;
  icon?: ReactNode;
}

export function TabButton({
  active = false,
  children,
  icon,
  className,
  ...rest
}: TabButtonProps) {
  const isIconOnly = !children;
  
  return (
    <button
      className={cn(
        "rounded transition-all",
        isIconOnly
          ? "p-2"
          : "px-4 py-2 font-semibold text-sm",
        active
          ? isIconOnly
            ? "bg-ember/20 text-ember-glow"
            : "bg-ember text-white border-2 border-ember-glow"
          : isIconOnly
            ? "text-text-muted hover:text-ember-glow hover:bg-deep"
            : "bg-deep text-text-secondary hover:text-ember-glow border-2 border-border",
        className
      )}
      {...rest}
    >
      {isIconOnly ? (
        icon
      ) : (
        <span className="flex items-center gap-2">
          {icon && <span className="flex items-center">{icon}</span>}
          <span>{children}</span>
        </span>
      )}
    </button>
  );
}

