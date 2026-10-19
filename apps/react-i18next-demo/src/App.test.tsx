import { runConformanceSuite } from "@i18n-compare/shared/conformance";
import { resetLoadedLocales } from "./i18n";
import { App } from "./App";

runConformanceSuite("react-i18next", () => <App />, resetLoadedLocales);
