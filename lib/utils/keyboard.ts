// lib/utils/keyboard.ts
// Keyboard utility functions

/**
 * Detect if running on Mac
 */
export function isMac(): boolean {
  if (typeof window === "undefined") return false;
  return navigator.platform.toUpperCase().indexOf("MAC") >= 0;
}

/**
 * Get the modifier key symbol for the current platform
 */
export function getModifierKey(): string {
  return isMac() ? "⌘" : "Ctrl";
}

/**
 * Get the modifier key name for display
 */
export function getModifierKeyName(): string {
  return isMac() ? "Cmd" : "Ctrl";
}

/**
 * Check if modifier key is pressed
 */
export function isModifierKeyPressed(e: KeyboardEvent | React.KeyboardEvent): boolean {
  return isMac() ? e.metaKey : e.ctrlKey;
}

