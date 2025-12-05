// lib/utils/cn.ts
// Utility for merging class names (similar to clsx/tailwind-merge)

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

