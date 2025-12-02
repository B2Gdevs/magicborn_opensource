import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Base colors - darker, scarier
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
      },
      boxShadow: {
        "ember-glow": "0 0 20px rgba(139, 69, 19, 0.4)",
        "earth-glow": "0 0 20px rgba(61, 40, 23, 0.4)",
        "purple-glow": "0 0 20px rgba(74, 45, 74, 0.4)",
        "neobrutal": "8px 8px 0px 0px rgba(0, 0, 0, 0.8)",
        "neobrutal-sm": "4px 4px 0px 0px rgba(0, 0, 0, 0.8)",
      }
    }
  },
  plugins: []
} satisfies Config;
