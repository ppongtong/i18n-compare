import { runConformanceSuite } from "@i18n-compare/shared/conformance";
import "./i18n";
import { App } from "./App";

runConformanceSuite("react-i18next", () => <App />);
