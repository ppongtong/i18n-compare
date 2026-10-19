import { I18nProvider } from "@lingui/react";
import { runConformanceSuite } from "@i18n-compare/shared/conformance";
import { i18n, resetLoadedLocales } from "./i18n";
import { App } from "./App";

runConformanceSuite(
  "Lingui",
  () => (
    <I18nProvider i18n={i18n}>
      <App />
    </I18nProvider>
  ),
  resetLoadedLocales,
);
