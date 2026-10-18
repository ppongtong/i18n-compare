import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  PlaygroundControls,
  Scenario,
  Shell,
  currencyOptions,
  dateOptions,
  demo,
  isLocale,
  SOURCE_LOCALE,
  type Gender,
  type Locale,
} from "@i18n-compare/shared";
import { validateEmail } from "./validation";

export function App() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(1);
  const [gender, setGender] = useState<Gender>("female");

  const locale: Locale = isLocale(i18n.resolvedLanguage ?? "") ? (i18n.resolvedLanguage as Locale) : SOURCE_LOCALE;

  async function changeLocale(next: Locale) {
    setLoading(true);
    await i18n.changeLanguage(next); // resolves after the JSON chunk is loaded
    setLoading(false);
  }

  return (
    <Shell
      library="react-i18next"
      accent="teal"
      tagline="Runtime key lookup: t('key') against JSON catalogs, i18next formatters, lazy-loaded via a backend."
      locale={locale}
      onLocaleChange={changeLocale}
      loading={loading}
    >
      <Scenario
        id="greeting"
        title="1. Interpolation"
        description="A variable inside a sentence."
        code={`
// en/translation.json
"greeting": "Welcome back, {{name}}!"

t("greeting", { name })`}
      >
        {t("greeting", { name: demo.userName })}
      </Scenario>

      <Scenario
        id="plurals"
        title="2. Plurals (CLDR)"
        description="One key per plural category with _zero/_one/_two/_few/_many/_other suffixes. Translators add the categories their language needs."
        code={`
// en: cart_zero, cart_one, cart_other
"cart_one": "{{count, number}} item in your cart"
// ar adds: cart_two, cart_few, cart_many

t("cart", { count })`}
      >
        <ul>
          {demo.cartCounts.map((n) => (
            <li key={n} data-testid={`cart-${n}`}>
              {t("cart", { count: n })}
            </li>
          ))}
        </ul>
      </Scenario>

      <Scenario
        id="select"
        title="3. Gender / select"
        description="i18next 'context' appends a suffix to the key (liked_female, liked_male); unknown contexts fall back to the base key."
        code={`
"liked": "{{name}} liked your review",
"liked_female": "...", "liked_male": "..."

t("liked", { name, context: gender })`}
      >
        <ul>
          {demo.reviewers.map((r) => (
            <li key={r.gender} data-testid={`liked-${r.gender}`}>
              {t("liked", { name: r.name, context: r.gender })}
            </li>
          ))}
        </ul>
      </Scenario>

      <Scenario
        id="rich"
        title="4. Rich text (components inside a translation)"
        description="Named tags in the string map to React elements passed via the components prop."
        code={`
"terms": "Read our <link>terms of service</link> and <bold>accept</bold> them to continue."

<Trans i18nKey="terms" components={{ link: <a href="/terms" />, bold: <strong /> }} />`}
      >
        <Trans i18nKey="terms" components={{ link: <a href="/terms" />, bold: <strong /> }} />
      </Scenario>

      <Scenario
        id="number"
        title="5. Currency"
        description="Built-in formatter in the message; options passed with formatParams."
        code={`
"total": "Total: {{price, currency}}"

t("total", { price, formatParams: { price: { currency: "EUR" } } })`}
      >
        {t("total", { price: demo.price, formatParams: { price: currencyOptions } })}
      </Scenario>

      <Scenario
        id="dates"
        title="6. Dates & relative time"
        description="datetime and relativetime formatters are built in (Intl under the hood)."
        code={`
"ordered": "Ordered on {{date, datetime}}",
"shipped": "Shipped {{days, relativetime(day)}}"

t("ordered", { date, formatParams: { date: { dateStyle: "long" } } })
t("shipped", { days: -3 })`}
      >
        <div data-testid="ordered">
          {t("ordered", { date: demo.orderDate, formatParams: { date: dateOptions } })}
        </div>
        <div data-testid="shipped">
          {t("shipped", { days: demo.shippedDaysAgo, formatParams: { days: { numeric: "auto" } } })}
        </div>
      </Scenario>

      <Scenario
        id="outside"
        title="7. Outside React"
        description="A plain module imports the i18n instance and calls i18n.t()."
        code={`
// validation.ts
import i18n from "./i18n";
export const validateEmail = (v) =>
  isValidEmail(v) ? null : i18n.t("errors.email");`}
      >
        {validateEmail(demo.invalidEmail)}
      </Scenario>

      <Scenario
        id="fallback"
        title="8. Missing translation fallback"
        description="Key exists only in en/translation.json; fallbackLng: 'en' fills the gap."
        code={`
// only in en/translation.json
"untranslated": "This sentence has not been translated yet."

i18n.init({ fallbackLng: "en", ... })`}
      >
        {t("untranslated")}
      </Scenario>

      <Scenario
        id="playground"
        title="9. Playground"
        description="Change the inputs; output re-renders in the active locale."
        code={`
t("cart", { count })
t("liked", { name, context: gender })`}
      >
        <PlaygroundControls count={count} onCountChange={setCount} gender={gender} onGenderChange={setGender} />
        <div data-testid="playground-cart">{t("cart", { count })}</div>
        <div data-testid="playground-liked">{t("liked", { name: demo.userName, context: gender })}</div>
      </Scenario>
    </Shell>
  );
}
