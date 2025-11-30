import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@components": path.resolve(__dirname, "components"),
      "@lib": path.resolve(__dirname, "lib"),
      "@core": path.resolve(__dirname, "lib/core"),
      "@pkg": path.resolve(__dirname, "lib/packages"),
      "@data": path.resolve(__dirname, "lib/data"),
      "@store": path.resolve(__dirname, "lib/store"),
    },
  },
});

