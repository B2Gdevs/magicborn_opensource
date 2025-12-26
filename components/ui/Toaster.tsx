// components/ui/Toaster.tsx
// Custom styled Toaster component using sonner
// Matches shadcn card style with color-coded top borders
//
// ICON USAGE:
// Toast notifications use lucide-react icons directly (NOT entry-config icons)
// These are UI feedback icons, not content type icons
// Entry config icons are for content types (Character, Spell, etc.)

"use client";

import { Toaster as SonnerToaster } from "sonner";
import { CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      expand={true}
      richColors={false}
      closeButton
      toastOptions={{
        classNames: {
          toast: "group toast",
          title: "font-medium",
          description: "text-sm",
          actionButton: "bg-ember hover:bg-ember-glow text-white",
          cancelButton: "bg-deep hover:bg-shadow",
        },
      }}
      icons={{
        success: <CheckCircle2 className="w-4 h-4 text-green-500" />,
        error: <XCircle className="w-4 h-4 text-red-500" />,
        warning: <AlertCircle className="w-4 h-4 text-amber-500" />,
        info: <Info className="w-4 h-4 text-blue-500" />,
      }}
    />
  );
}

