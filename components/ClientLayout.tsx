// components/ClientLayout.tsx
// Client-side layout wrapper for server components

"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import SidebarNav from "@components/SidebarNav";
import TopNav from "@components/TopNav";
import { TooltipProvider } from "@/components/ui/TooltipProvider";
import { GameProviders } from "@/app/GameProviders";

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  
  // These routes have their own layout - don't show main app nav
  const isFullscreenRoute = 
    pathname?.startsWith("/content-editor") ||
    pathname?.startsWith("/docs/swagger");
  
  if (isFullscreenRoute) {
    return (
      <TooltipProvider>
        <GameProviders>
          {children}
        </GameProviders>
      </TooltipProvider>
    );
  }
  
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


