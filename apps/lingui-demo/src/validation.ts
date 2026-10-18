// Plain module with no React. `msg` defines a lazy message at module load;
// it is translated with i18n._() when called, so it follows the active locale.
import { msg } from "@lingui/core/macro";
import { isValidEmail } from "@i18n-compare/shared";
import { i18n } from "./i18n";

const invalidEmail = msg`Please enter a valid email address.`;

export function validateEmail(value: string): string | null {
  return isValidEmail(value) ? null : i18n._(invalidEmail);
}
