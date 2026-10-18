import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: { dedupe: ["react", "react-dom"] },
  // manifest.json lets scripts/compare-size.mjs separate initial JS from lazy locale chunks.
  build: { manifest: true },
  test: { environment: "jsdom" },
});
