// lib/hooks/useToast.ts
// Simple wrapper hook for toast notifications
// Provides consistent API for showing toasts throughout the app

import { toast as sonnerToast } from "sonner";

export function useToast() {
  return {
    success: (message: string, description?: string) => {
      sonnerToast.success(message, { description });
    },
    error: (message: string, description?: string) => {
      sonnerToast.error(message, { description });
    },
    warning: (message: string, description?: string) => {
      sonnerToast.warning(message, { description });
    },
    info: (message: string, description?: string) => {
      sonnerToast.info(message, { description });
    },
  };
}

// Export direct toast function for convenience
export const toast = {
  success: (
    message: string,
    options?: { description?: string; action?: { label: string; onClick: () => void } }
  ) => {
    sonnerToast.success(message, options);
  },
  error: (
    message: string,
    options?: { description?: string; action?: { label: string; onClick: () => void } }
  ) => {
    sonnerToast.error(message, options);
  },
  warning: (
    message: string,
    options?: { description?: string; action?: { label: string; onClick: () => void } }
  ) => {
    sonnerToast.warning(message, options);
  },
  info: (
    message: string,
    options?: { description?: string; action?: { label: string; onClick: () => void } }
  ) => {
    sonnerToast.info(message, options);
  },
};

