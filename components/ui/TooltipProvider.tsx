// components/ui/TooltipProvider.tsx
// Global provider for react-tooltip - just a wrapper, tooltips are rendered per-component

"use client";

import { ReactNode } from "react";
import "react-tooltip/dist/react-tooltip.css";

interface TooltipProviderProps {
  children: ReactNode;
}

export function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>;
}
