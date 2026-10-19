import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { I18nProvider } from "@lingui/react";
import "@i18n-compare/shared/styles.css";
import { localeFromUrl } from "@i18n-compare/shared";
import { activateLocale, i18n } from "./i18n";
import { App } from "./App";

const initial = localeFromUrl();
if (initial) {
  try {
    await activateLocale(initial, `page load (?locale=${initial})`);
  } catch (err) {
    console.error(`Failed to load initial locale "${initial}", falling back to English:`, err);
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nProvider i18n={i18n}>
      <App />
    </I18nProvider>
  </StrictMode>,
);
