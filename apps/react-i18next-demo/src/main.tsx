import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@i18n-compare/shared/styles.css";
import { localeFromUrl } from "@i18n-compare/shared";
import { switchLocale } from "./i18n";
import { App } from "./App";

const initial = localeFromUrl();
if (initial) {
  try {
    await switchLocale(initial, `page load (?locale=${initial})`);
  } catch (err) {
    console.error(`Failed to load initial locale "${initial}", falling back to English:`, err);
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
