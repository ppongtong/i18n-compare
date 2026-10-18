import { defineConfig } from "i18next-cli";

// `pnpm i18n:extract` scans src for t()/<Trans> keys and syncs the JSON files.
// `pnpm i18n:status` reports untranslated keys per locale (non-zero exit if any).
export default defineConfig({
  locales: ["en", "pl", "ar"],
  extract: {
    input: ["src/**/*.{ts,tsx}"],
    ignore: ["src/**/*.test.tsx", "src/**/*.bench.tsx"],
    output: "src/locales/{{language}}/{{namespace}}.json",
    defaultNS: "translation",
    primaryLanguage: "en",
    // Static analysis can't see dynamic `context: gender` values, so without this
    // extract would delete liked_female / liked_male.
    preservePatterns: ["liked_*"],
  },
});
