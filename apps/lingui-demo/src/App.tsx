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
      tagline="Compile-time macros: write the English message in code, extract to .po catalogs, ICU MessageFormat, lazy-loaded per locale."
      locale={locale}
      onLocaleChange={changeLocale}
      loading={loading}
    >
      <Scenario
        id="greeting"
        title="1. Interpolation"
        description="The English sentence lives in the code; the macro turns it into a message id."
        code={`
const { t } = useLingui();
t\`Welcome back, \${name}!\`

// en.po → msgid "Welcome back, {name}!"`}
      >
        {t`Welcome back, ${name}!`}
      </Scenario>

      <Scenario
        id="plurals"
        title="2. Plurals (ICU)"
        description="One ICU message holds every form. Translators add the categories their language needs inside the same string."
        code={`
<Plural value={count} _0="Your cart is empty"
  one="# item in your cart" other="# items in your cart" />

// ar.po msgstr "{n, plural, =0 {...} one {...} two {...}
//   few {# ...} many {# ...} other {# ...}}"`}
      >
        <ul>
          {demo.cartCounts.map((n) => (
            <li key={n} data-testid={`cart-${n}`}>
              <CartSummary count={n} />
            </li>
          ))}
        </ul>
      </Scenario>

      <Scenario
        id="select"
        title="3. Gender / select"
        description="ICU select: the branches live in one message, so translators see all variants together."
        code={`
<Select value={gender}
  _female={\`\${name} liked your review\`}
  _male={\`\${name} liked your review\`}
  other={\`\${name} liked your review\`} />`}
      >
        <ul>
          {demo.reviewers.map(({ name, gender }) => (
            <li key={gender} data-testid={`liked-${gender}`}>
              <LikedReview name={name} gender={gender} />
            </li>
          ))}
        </ul>
      </Scenario>

      <Scenario
        id="rich"
        title="4. Rich text (components inside a translation)"
        description="Write plain JSX inside <Trans>; the macro numbers the elements (<0>, <1>) for translators."
        code={`
<Trans>
  Read our <a href="/terms">terms of service</a> and <strong>accept</strong> them to continue.
</Trans>

// msgid "Read our <0>terms of service</0> and <1>accept</1> them to continue."`}
      >
        <Trans>
          Read our <a href="/terms">terms of service</a> and <strong>accept</strong> them to continue.
        </Trans>
      </Scenario>

      <Scenario
        id="number"
        title="5. Currency"
        description="Format with i18n.number (Intl), then interpolate the result."
        code={`
const total = i18n.number(price, { style: "currency", currency: "EUR" });
t\`Total: \${total}\``}
      >
        {t`Total: ${total}`}
      </Scenario>

      <Scenario
        id="dates"
        title="6. Dates & relative time"
        description="i18n.date for dates; no built-in relative-time helper, so Intl.RelativeTimeFormat directly."
        code={`
const ordered = i18n.date(date, { dateStyle: "long" });
const shipped = new Intl.RelativeTimeFormat(i18n.locale, { numeric: "auto" })
  .format(-3, "day");
t\`Ordered on \${ordered}\`
t\`Shipped \${shipped}\``}
      >
        <div data-testid="ordered">{t`Ordered on ${ordered}`}</div>
        <div data-testid="shipped">{t`Shipped ${shipped}`}</div>
      </Scenario>

      <Scenario
        id="outside"
        title="7. Outside React"
        description="msg`` defines a lazy message at module scope; i18n._() translates it at call time."
        code={`
// validation.ts
const invalidEmail = msg\`Please enter a valid email address.\`;
export const validateEmail = (v) =>
  isValidEmail(v) ? null : i18n._(invalidEmail);`}
      >
        {validateEmail(demo.invalidEmail)}
      </Scenario>

      <Scenario
        id="fallback"
        title="8. Missing translation fallback"
        description="msgstr is empty in pl.po / ar.po; fallbackLocales + the source message fill the gap."
        code={`
<Trans>This sentence has not been translated yet.</Trans>

// lingui.config.ts
fallbackLocales: { default: "en" }`}
      >
        <Trans>This sentence has not been translated yet.</Trans>
      </Scenario>

      <Scenario
        id="playground"
        title="9. Playground"
        description="Change the inputs; output re-renders in the active locale."
        code={`
<Plural value={count} ... />
<Select value={gender} ... />`}
      >
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
