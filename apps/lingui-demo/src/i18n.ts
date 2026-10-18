import { i18n, type Messages } from "@lingui/core";
import { SOURCE_LOCALE, type Locale } from "@i18n-compare/shared";
// The Vite plugin compiles .po files at import time — no separate compile step.
import { messages as en } from "./locales/en.po";

// Every catalog except the bundled source locale becomes its own lazy chunk.
const lazyCatalogs = import.meta.glob<{ messages: Messages }>(["./locales/*.po", "!./locales/en.po"]);

i18n.loadAndActivate({ locale: SOURCE_LOCALE, messages: en });

/** Loads a locale's catalog (its own chunk) on first use, then activates it. */
export async function activateLocale(locale: Locale) {
  if (locale === i18n.locale) return;
  const messages = locale === SOURCE_LOCALE ? en : (await lazyCatalogs[`./locales/${locale}.po`]()).messages;
  i18n.loadAndActivate({ locale, messages });
}

export { i18n };
