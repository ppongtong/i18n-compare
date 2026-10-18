import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { LOCALES, SOURCE_LOCALE, activity, trackRequests, type Locale } from "@i18n-compare/shared";
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

activity.begin("i18n.init()", "page load")(
  "bundled",
  '"en" is passed via the resources option, so it ships inside the main JS. No request.',
);

/** Loads a locale's catalog if needed, then switches to it. Logs each step for the UI. */
export async function switchLocale(locale: Locale, source = "dropdown") {
  const add = activity.begin(`changeLanguage("${locale}")`, source);
  if (locale === SOURCE_LOCALE) {
    add("bundled", '"en" is bundled in the main JS. No request.');
  } else if (i18n.hasResourceBundle(locale, "translation")) {
    add("cached", `"${locale}" is already in the i18next store. No request.`);
  } else {
    add("fetch", `"${locale}" is not in the store yet, so the backend loads ${locale}/translation.json:`);
    await trackRequests(() => i18n.loadLanguages(locale), add);
  }
  await i18n.changeLanguage(locale);
  add("activated", "i18next fires languageChanged; every useTranslation() component re-renders. No page reload.");
}

export default i18n;
