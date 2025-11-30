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
        bg: "#0b0b0e",
        panel: "#14141a",
        text: "#e7e7ea",
        muted: "#a8a8b3",
        accent: "#ff7a1a",
        line: "#262632"
      }
    }
  },
  plugins: []
} satisfies Config;
