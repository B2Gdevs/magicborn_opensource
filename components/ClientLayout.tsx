// components/ClientLayout.tsx
// Client-side layout wrapper for server components

"use client";

import { ReactNode } from "react";
import { QueryProvider } from "./providers/QueryProvider";
import { usePathname } from "next/navigation";
import SidebarNav from "@components/SidebarNav";
import TopNav from "@components/TopNav";
import { TooltipProvider } from "@/components/ui/TooltipProvider";
import { Toaster } from "@/components/ui/Toaster";

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  
  // These routes have their own layout - don't show main app nav
  const isFullscreenRoute = 
    pathname?.startsWith("/content-editor")
  
  if (isFullscreenRoute) {
    return (
      <QueryProvider>
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </QueryProvider>
    );
  }
  
  return (
    <QueryProvider>
      <TooltipProvider>
        <SidebarNav />
        <TopNav />
        {children}
        <Toaster />
      </TooltipProvider>
    </QueryProvider>
  );
}


