import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { lingui } from "@lingui/vite-plugin";

export default defineConfig({
  // Relative paths so the built app works from any subfolder (e.g. GitHub Pages).
  base: "./",
  plugins: [
    react(),
    // Compiles Lingui macros natively (no Babel/SWC) and lets us import .po files directly.
    lingui({ macroTransform: true }),
  ],
  resolve: { dedupe: ["react", "react-dom"] },
  // manifest.json lets scripts/compare-size.mjs separate initial JS from lazy locale chunks.
  build: { manifest: true },
  test: { environment: "jsdom" },
});
