// components/ClientLayout.tsx
// Client-side layout wrapper for server components

"use client";

import { ReactNode } from "react";
import SidebarNav from "@components/SidebarNav";
import TopNav from "@components/TopNav";
import { TooltipProvider } from "@/components/ui/TooltipProvider";
import { GameProviders } from "@/app/GameProviders";

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <TooltipProvider>
      <GameProviders>
        <SidebarNav />
        <TopNav />
        {children}
      </GameProviders>
    </TooltipProvider>
  );
}


