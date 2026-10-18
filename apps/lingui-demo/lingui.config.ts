import { defineConfig } from "@lingui/cli";

// `pnpm i18n:extract` scans src for macros and updates src/locales/{locale}.po,
// printing a table of missing translations per locale.
export default defineConfig({
  sourceLocale: "en",
  locales: ["en", "pl", "ar"],
  fallbackLocales: { default: "en" },
  catalogs: [
    {
      path: "<rootDir>/src/locales/{locale}",
      include: ["src"],
      exclude: ["**/*.test.tsx", "**/*.bench.tsx", "**/howto.ts"],
    },
  ],
});
