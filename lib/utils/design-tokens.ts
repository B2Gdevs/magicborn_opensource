// Design token extraction utility
// Extracts colors and design tokens for dynamic injection

export interface DesignToken {
  name: string;
  value: string;
  category: string;
}

// Color definitions from tailwind config and globals.css
const colorDefinitions: Record<string, string> = {
  // Base colors
  void: "#000000",
  shadow: "#0a0a0a",
  deep: "#1a1a1a",
  abyss: "#050505",
  
  // Earthy dark accents
  ember: "#8b4513",
  "ember-glow": "#cd853f",
  earth: "#3d2817",
  "earth-glow": "#6b4423",
  "shadow-purple": "#2d1b2e",
  "shadow-purple-glow": "#4a2d4a",
  bone: "#8b7d6b",
  "bone-glow": "#c4b5a0",
  
  // Text colors
  "text-primary": "#e8e6e3",
  "text-secondary": "#b8b5b0",
  "text-muted": "#7a7875",
  "text-glow": "#d4a574",
  
  // Border
  border: "#2a2a2a",
  "border-glow": "#4a4a4a",
};

export function getDesignTokens(): DesignToken[] {
  const tokens: DesignToken[] = [];

  // Extract colors
  Object.entries(colorDefinitions).forEach(([name, value]) => {
    const category = name.startsWith("text-") ? "text" : 
                    name.includes("border") ? "border" :
                    ["void", "shadow", "deep", "abyss"].includes(name) ? "base" : "accent";
    tokens.push({
      name,
      value,
      category,
    });
  });

  return tokens;
}

export function getColorValue(colorName: string): string | null {
  const tokens = getDesignTokens();
  const token = tokens.find(t => t.name === colorName);
  return token?.value || null;
}

export function getColorsByCategory(category: string): DesignToken[] {
  return getDesignTokens().filter(t => t.category === category);
}

