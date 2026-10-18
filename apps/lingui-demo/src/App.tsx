import { useState } from "react";
import { Plural, Select, Trans, useLingui } from "@lingui/react/macro";
import {
  PlaygroundControls,
  Scenario,
  Shell,
  currencyOptions,
  dateOptions,
  demo,
  type Gender,
  type Locale,
} from "@i18n-compare/shared";
import { activateLocale } from "./i18n";
import { catalogView } from "./catalog";
import { howTo } from "./howto";
import { validateEmail } from "./validation";

// Reused by the list and the playground so each message is extracted once.
function CartSummary({ count }: { count: number }) {
  return <Plural value={count} _0="Your cart is empty" one="# item in your cart" other="# items in your cart" />;
}

function LikedReview({ name, gender }: { name: string; gender: Gender }) {
  return (
    <Select
      value={gender}
      _female={`${name} liked your review`}
      _male={`${name} liked your review`}
      other={`${name} liked your review`}
    />
  );
}

export function App() {
  const { t, i18n } = useLingui();
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(1);
  const [gender, setGender] = useState<Gender>("female");

  const locale = i18n.locale as Locale;
  const name = demo.userName;

  async function changeLocale(next: Locale) {
    setLoading(true);
    await activateLocale(next);
    setLoading(false);
  }

  // Lingui has no in-message formatters: format with i18n.number / i18n.date / Intl, then interpolate.
  const total = i18n.number(demo.price, currencyOptions);
  const ordered = i18n.date(demo.orderDate, dateOptions);
  const shipped = new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(demo.shippedDaysAgo, "day");

  return (
    <Shell
      library="Lingui"
      accent="violet"
      tagline="You write the English text directly in components. A command copies it into one .po file per language for translators, and the build turns it into fast lookups."
      locale={locale}
      onLocaleChange={changeLocale}
      loading={loading}
      catalog={catalogView()}
      howItWorks={
        <>
          <li>
            <strong>English is built in.</strong> <code>en.po</code> is imported statically; @lingui/vite-plugin
            compiles it into the main JS. Picking en never makes a request.
          </li>
          <li>
            <strong>Other languages load on first use.</strong> <code>activateLocale("pl")</code> runs{" "}
            <code>import("./locales/pl.po")</code>. The plugin compiles the .po into a small JS chunk of precompiled
            messages (no parsing in the browser), so you see one network request.
          </li>
          <li>
            <strong>Then it stays in memory.</strong> <code>i18n.load()</code> keeps the catalog. Switching back later
            makes no request.
          </li>
          <li>
            <strong>Re-render, no reload.</strong> <code>i18n.activate()</code> notifies <code>I18nProvider</code>, and
            every component using <code>useLingui()</code> or <code>&lt;Trans&gt;</code> re-renders with the new text.
          </li>
        </>
      }
    >
      <Scenario id="setup" howTo={howTo.setup} />

      <Scenario id="greeting" howTo={howTo.greeting}>
        {t`Welcome back, ${name}!`}
      </Scenario>

      <Scenario id="plurals" howTo={howTo.plurals}>
        <ul>
          {demo.cartCounts.map((n) => (
            <li key={n} data-testid={`cart-${n}`}>
              <CartSummary count={n} />
            </li>
          ))}
        </ul>
      </Scenario>

      <Scenario id="select" howTo={howTo.select}>
        <ul>
          {demo.reviewers.map(({ name, gender }) => (
            <li key={gender} data-testid={`liked-${gender}`}>
              <LikedReview name={name} gender={gender} />
            </li>
          ))}
        </ul>
      </Scenario>

      <Scenario id="rich" howTo={howTo.rich}>
        <Trans>
          Read our <a href="/terms">terms of service</a> and <strong>accept</strong> them to continue.
        </Trans>
      </Scenario>

      <Scenario id="number" howTo={howTo.number}>
        {t`Total: ${total}`}
      </Scenario>

      <Scenario id="dates" howTo={howTo.dates}>
        <div data-testid="ordered">{t`Ordered on ${ordered}`}</div>
        <div data-testid="shipped">{t`Shipped ${shipped}`}</div>
      </Scenario>

      <Scenario id="outside" howTo={howTo.outside}>
        {validateEmail(demo.invalidEmail)}
      </Scenario>

      <Scenario id="fallback" howTo={howTo.fallback}>
        <Trans>This sentence has not been translated yet.</Trans>
      </Scenario>

      <Scenario id="playground" howTo={howTo.playground}>
        <PlaygroundControls count={count} onCountChange={setCount} gender={gender} onGenderChange={setGender} />
        <div data-testid="playground-cart">
          <CartSummary count={count} />
        </div>
        <div data-testid="playground-liked">
          <LikedReview name={name} gender={gender} />
        </div>
      </Scenario>
    </Shell>
  );
}
