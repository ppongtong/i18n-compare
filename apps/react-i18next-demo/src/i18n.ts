import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { LOCALES, SOURCE_LOCALE } from "@i18n-compare/shared";
import en from "./locales/en/translation.json";

// Every catalog except the bundled source locale becomes its own lazy chunk.
const lazyCatalogs = import.meta.glob(["./locales/*/*.json", "!./locales/en/*.json"]);

i18n
  .use(initReactI18next)
  .use(resourcesToBackend((lng: string, ns: string) => lazyCatalogs[`./locales/${lng}/${ns}.json`]?.() ?? Promise.resolve({})))
  .init({
    lng: SOURCE_LOCALE,
    fallbackLng: SOURCE_LOCALE,
    supportedLngs: LOCALES.map((l) => l.code),
    resources: { en: { translation: en } },
    partialBundledLanguages: true,
    // Source locale is bundled, so init can complete synchronously.
    initAsync: false,
    // i18next-cli writes "" placeholders for untranslated keys; without this,
    // "" counts as a translation and the fallback to English never happens.
    returnEmptyString: false,
    interpolation: { escapeValue: false }, // React already escapes
  });

export default i18n;
