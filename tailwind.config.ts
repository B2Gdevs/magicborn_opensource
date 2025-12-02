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
        // Base colors
        void: "#0a0a0f",
        shadow: "#1a1a2e",
        deep: "#16213e",
        abyss: "#0f1419",
        
        // Organic accents
        ember: "#c94a2a",
        "ember-glow": "#ff6b4a",
        moss: "#2d5a3d",
        "moss-glow": "#4a8a5f",
        "shadow-purple": "#4a2c5a",
        "shadow-purple-glow": "#6b3d7a",
        
        // Text colors
        "text-primary": "#e8e6e3",
        "text-secondary": "#b8b5b0",
        "text-muted": "#7a7875",
        "text-glow": "#ffd89b",
        
        // Border
        border: "#2a2a3e",
        "border-glow": "#4a4a6e",
      },
      boxShadow: {
        "ember-glow": "0 0 20px rgba(201, 74, 42, 0.4)",
        "moss-glow": "0 0 20px rgba(74, 138, 95, 0.4)",
        "purple-glow": "0 0 20px rgba(107, 61, 122, 0.4)",
      }
    }
  },
  plugins: []
} satisfies Config;
