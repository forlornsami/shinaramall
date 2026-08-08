import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "shared"),
      "@": path.resolve(__dirname, "client", "src"),
    },
  },
  test: {
    globals: true,
    environmentMatchGlobs: [
      // Client component tests run in a browser-like environment
      ["client/**/*.test.*", "jsdom"],
      // Everything else (server tests) stays in Node
      ["server/**/*.test.*", "node"],
    ],
    // Default environment for files not matched above
    environment: "node",
    setupFiles: [],
  },
});
