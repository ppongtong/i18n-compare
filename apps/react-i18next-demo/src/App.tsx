import { useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  PlaygroundControls,
  Scenario,
  Shell,
  currencyOptions,
  dateOptions,
  demo,
  isLocale,
  personFor,
  SOURCE_LOCALE,
  type Gender,
  type Locale,
} from "@i18n-compare/shared";
import { switchLocale } from "./i18n";
import { catalogView } from "./catalog";
import { howTo } from "./howto";
import { validateEmail } from "./validation";

export function App() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null);
  const activeRequestRef = useRef(0);
  const [count, setCount] = useState(1);
  const [gender, setGender] = useState<Gender>("female");

  const locale: Locale = isLocale(i18n.resolvedLanguage ?? "") ? (i18n.resolvedLanguage as Locale) : SOURCE_LOCALE;

  async function changeLocale(next: Locale) {
    const reqId = ++activeRequestRef.current;
    setSelectedLocale(next);
    setLoading(true);
    try {
      await switchLocale(next);
    } catch (err) {
      console.error(`Failed to switch locale "${next}":`, err);
    } finally {
      if (activeRequestRef.current === reqId) {
        setLoading(false);
        setSelectedLocale(null);
      }
    }
  }

  return (
    <Shell
      library="react-i18next"
      accent="teal"
      tagline="You give each sentence a key and keep the text in one JSON file per language. Components look up text by key while the app runs."
      locale={selectedLocale ?? locale}
      onLocaleChange={changeLocale}
      loading={loading}
      catalog={catalogView(locale)}
      howItWorks={
        <>
          <li>
            <strong>English is built in.</strong> <code>en/translation.json</code> is passed to{" "}
            <code>i18n.init({"{ resources }"})</code>, so it ships inside the main JS. Picking en never makes a
            request.
          </li>
          <li>
            <strong>Other languages load on first use.</strong> <code>changeLanguage("pl")</code> asks the backend (
            <code>resourcesToBackend</code>) for <code>pl/translation.json</code>. Vite made each JSON file its own
            small JS chunk, so you see one network request.
          </li>
          <li>
            <strong>Then it stays in memory.</strong> The catalog is kept in i18next's resource store. Switching back
            later makes no request.
          </li>
          <li>
            <strong>Re-render, no reload.</strong> i18next fires <code>languageChanged</code> and every component
            using <code>useTranslation()</code> re-renders with the new text.
          </li>
        </>
      }
    >
      <Scenario id="setup" howTo={howTo.setup} />

      <Scenario id="greeting" howTo={howTo.greeting}>
        {t("greeting", { name: demo.userName })}
      </Scenario>

      <Scenario id="plurals" howTo={howTo.plurals}>
        <ul>
          {demo.cartCounts.map((n) => (
            <li key={n} data-testid={`cart-${n}`}>
              {t("cart", { count: n })}
            </li>
          ))}
        </ul>
      </Scenario>

      <Scenario id="select" howTo={howTo.select}>
        <ul>
          {demo.people.map((p) => (
            <li key={p.gender} data-testid={`updated-${p.gender}`}>
              {t("profileUpdated", { name: p.name, context: p.gender })}
            </li>
          ))}
        </ul>
      </Scenario>

      <Scenario id="rich" howTo={howTo.rich}>
        <Trans i18nKey="terms" components={{ link: <a href="/terms" />, bold: <strong /> }} />
      </Scenario>

      <Scenario id="number" howTo={howTo.number}>
        {t("total", { price: demo.price, formatParams: { price: currencyOptions } })}
      </Scenario>

      <Scenario id="dates" howTo={howTo.dates}>
        <div data-testid="ordered">
          {t("ordered", { date: demo.orderDate, formatParams: { date: dateOptions } })}
        </div>
        <div data-testid="shipped">
          {t("shipped", { days: demo.shippedDaysAgo, formatParams: { days: { numeric: "auto" } } })}
        </div>
      </Scenario>

      <Scenario id="outside" howTo={howTo.outside}>
        {validateEmail(demo.invalidEmail)}
      </Scenario>

      <Scenario id="fallback" howTo={howTo.fallback}>
        {t("untranslated")}
      </Scenario>

      <Scenario id="playground" howTo={howTo.playground}>
        <PlaygroundControls count={count} onCountChange={setCount} gender={gender} onGenderChange={setGender} />
        <div data-testid="playground-cart">{t("cart", { count })}</div>
        <div data-testid="playground-updated">
          {t("profileUpdated", { name: personFor(gender), context: gender })}
        </div>
      </Scenario>
    </Shell>
  );
}
