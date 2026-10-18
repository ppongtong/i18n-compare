import { defineConfig } from "i18next-cli";

// `pnpm i18n:extract` scans src for t()/<Trans> keys and syncs the JSON files.
// `pnpm i18n:status` reports untranslated keys per locale (non-zero exit if any).
export default defineConfig({
  locales: ["en", "pl", "ar", "th"],
  extract: {
    input: ["src/**/*.{ts,tsx}"],
    // howto.ts holds example snippets shown in the UI, not real t() calls.
    ignore: ["src/**/*.test.tsx", "src/**/*.bench.tsx", "src/howto.ts"],
    output: "src/locales/{{language}}/{{namespace}}.json",
    defaultNS: "translation",
    primaryLanguage: "en",
    // Static analysis can't see dynamic `context: gender` values, so without this
    // extract would delete liked_female / liked_male.
    preservePatterns: ["liked_*"],
  },
});
