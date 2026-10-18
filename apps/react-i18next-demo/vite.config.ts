import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Relative paths so the built app works from any subfolder (e.g. GitHub Pages).
  base: "./",
  plugins: [react()],
  resolve: { dedupe: ["react", "react-dom"] },
  // manifest.json lets scripts/compare-size.mjs separate initial JS from lazy locale chunks.
  build: { manifest: true },
  test: { environment: "jsdom" },
});
