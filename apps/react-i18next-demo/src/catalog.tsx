// Builds the "What's inside the catalog" view: the active language's
// translations exactly as i18next holds them after loading the JSON file.
import type { CatalogView, Locale } from "@i18n-compare/shared";
import i18n from "./i18n";

const countTexts = (value: unknown): number =>
  typeof value === "object" && value !== null
    ? Object.values(value).reduce<number>((n, v) => n + countTexts(v), 0)
    : 1;

export function catalogView(locale: Locale): CatalogView {
  const bundle = i18n.getResourceBundle(locale, "translation") ?? {};
  return {
    code: JSON.stringify(bundle, null, 2),
    count: countTexts(bundle),
    notes: (
      <>
        <li>
          <strong>It's your JSON file, unchanged.</strong> The keys are the names you chose, and the text still has
          placeholders like <code>{"{{name}}"}</code> and formatter hints like <code>{"{{price, currency}}"}</code>{" "}
          inside.
        </li>
        <li>
          <strong>Each plural or gender form is its own key</strong> (<code>cart_one</code>, <code>cart_few</code>,{" "}
          <code>liked_female</code>, …).
        </li>
        <li>
          <strong>The work happens in the browser on every</strong> <code>t()</code> <strong>call:</strong> i18next
          picks the right key, fills in the placeholders and runs the formatters. That's why its runtime is bigger
          (~22 kB gzip).
        </li>
        <li>
          <strong>Missing translations stay empty.</strong> In pl and ar, <code>untranslated</code> is <code>""</code>.
          English is looked up while the app runs (<code>fallbackLng</code>).
        </li>
      </>
    ),
  };
}
