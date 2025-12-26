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

