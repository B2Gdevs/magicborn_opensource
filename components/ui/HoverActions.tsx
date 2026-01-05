// components/ui/HoverActions.tsx
// Reusable hover actions component - Notion-style
// Wraps any element and shows action buttons on hover without layout shift
// Icons are always in DOM but hidden, preventing any UI shift

"use client";

import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

interface HoverAction {
  icon: ReactNode;
  onClick: () => void;
  title?: string;
  className?: string;
}

interface HoverActionsProps {
  children: ReactNode;
  actions: HoverAction[];
  className?: string;
  actionsPosition?: "right" | "left";
  gap?: number;
}

export function HoverActions({
  children,
  actions,
  className,
  actionsPosition = "right",
  gap = 4,
}: HoverActionsProps) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {children}
      
      {/* Actions - always in DOM, positioned absolutely to prevent layout shift */}
      <div
        className={cn(
          "absolute top-1/2 -translate-y-1/2 flex items-center transition-all duration-200 ease-out",
          actionsPosition === "right" ? "right-0" : "left-0",
          isHovering
            ? "opacity-100 translate-x-0 pointer-events-auto"
            : "opacity-0 pointer-events-none",
          actionsPosition === "right"
            ? isHovering
              ? "translate-x-0"
              : "translate-x-1"
            : isHovering
            ? "translate-x-0"
            : "-translate-x-1"
        )}
        style={{ gap: `${gap}px` }}
      >
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
            }}
            className={cn(
              "p-1 rounded hover:bg-ember/10 text-ember-glow transition-colors",
              "flex items-center justify-center shrink-0",
              "backdrop-blur-sm",
              action.className
            )}
            title={action.title}
            aria-label={action.title}
          >
            {action.icon}
          </button>
        ))}
      </div>
    </div>
  );
}

