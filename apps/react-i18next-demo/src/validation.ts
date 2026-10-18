// Plain module with no React: uses the i18next instance directly.
import { isValidEmail } from "@i18n-compare/shared";
import i18n from "./i18n";

export function validateEmail(value: string): string | null {
  return isValidEmail(value) ? null : i18n.t("errors.email");
}
