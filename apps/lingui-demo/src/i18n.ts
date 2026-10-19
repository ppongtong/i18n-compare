import { i18n, type Messages } from "@lingui/core";
import { SOURCE_LOCALE, activity, trackRequests, type Locale } from "@i18n-compare/shared";
// The Vite plugin compiles .po files at import time — no separate compile step.
import { messages as en } from "./locales/en.po";

// Every catalog except the bundled source locale becomes its own lazy chunk.
const lazyCatalogs = import.meta.glob<{ messages: Messages }>(["./locales/*.po", "!./locales/en.po"]);
const loaded = new Set<Locale>([SOURCE_LOCALE]);
let currentSeq = 0;

export function resetLoadedLocales() {
  loaded.clear();
  loaded.add(SOURCE_LOCALE);
  i18n.loadAndActivate({ locale: SOURCE_LOCALE, messages: en });
  activity.clear();
}

i18n.loadAndActivate({ locale: SOURCE_LOCALE, messages: en });

activity.begin("i18n.loadAndActivate()", "page load")(
  "bundled",
  '"en.po" is imported statically and compiled by @lingui/vite-plugin into the main JS. No request.',
);

/** Loads a locale's catalog (its own chunk) on first use, then activates it. Logs each step for the UI. */
export async function activateLocale(locale: Locale, source = "dropdown") {
  const seq = ++currentSeq;
  const add = activity.begin(`activateLocale("${locale}")`, source);
  if (locale === SOURCE_LOCALE) {
    add("bundled", '"en" is bundled in the main JS. No request.');
  } else if (loaded.has(locale)) {
    add("cached", `"${locale}" was loaded earlier with i18n.load(). No request.`);
  } else {
    add("fetch", `"${locale}" is not loaded yet, so import("./locales/${locale}.po") fetches its compiled chunk:`);
    const loader = lazyCatalogs[`./locales/${locale}.po`];
    if (!loader) {
      add("cached", `Locale "${locale}" catalog not found; falling back to "${SOURCE_LOCALE}".`);
      if (seq === currentSeq) i18n.activate(SOURCE_LOCALE);
      return;
    }
    const { messages } = await trackRequests(() => loader(), add);
    i18n.load(locale, messages);
    loaded.add(locale);
  }
  if (seq !== currentSeq) {
    add("cached", `"${locale}" completed but superseded by newer switch. Skipped.`);
    return;
  }
  i18n.activate(locale);
  add("activated", "i18n.activate() notifies I18nProvider; useLingui() and <Trans> components re-render. No page reload.");
}

export { i18n };
/** The compiled English catalog, used to label entries in the catalog view. */
export const sourceMessages = en;
