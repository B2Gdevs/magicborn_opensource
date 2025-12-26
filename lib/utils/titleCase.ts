// lib/utils/titleCase.ts
// Utility function to convert strings to Title Case

/**
 * Converts a string to Title Case
 * Examples:
 * - "hello world" -> "Hello World"
 * - "hello_world" -> "Hello World"
 * - "HELLO WORLD" -> "Hello World"
 * - "hello-world" -> "Hello World"
 */
export function toTitleCase(str: string): string {
  if (!str) return str;
  
  return str
    .split(/[\s_\-]+/)
    .map(word => {
      if (!word) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}




