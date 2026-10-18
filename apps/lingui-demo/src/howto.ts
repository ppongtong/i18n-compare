// Plain-language, step-by-step explanations shown under each scenario.
// Snippets are trimmed to the essentials; the real code is in i18n.ts, App.tsx and validation.ts.
import type { HowTo, ScenarioId } from "@i18n-compare/shared";

const extractStep = {
  title: "Run the extract command",
  code: `pnpm i18n:extract   # copies every English text from the code into src/locales/*.po`,
};

export const howTo: Record<ScenarioId, HowTo> = {
  setup: {
    summary:
      "With Lingui you write the English text directly in your components. When the app is built, a plugin rewrites those texts into lookups (this rewrite is called a macro). A command copies every text into a .po file per language, and translators fill those in. There are no keys to invent.",
    steps: [
      {
        title: "Install the packages",
        code: `pnpm add @lingui/core @lingui/react
pnpm add -D @lingui/cli @lingui/vite-plugin`,
      },
      {
        title: "Tell Lingui your languages and where the files go",
        file: "lingui.config.ts",
        code: `import { defineConfig } from "@lingui/cli";

export default defineConfig({
  sourceLocale: "en",                  // the language you write in code
  locales: ["en", "pl", "ar"],
  fallbackLocales: { default: "en" },  // use English if a text is missing
  catalogs: [{
    path: "<rootDir>/src/locales/{locale}",  // → src/locales/pl.po
    include: ["src"],                        // where to look for texts
  }],
});`,
      },
      {
        title: "Add the build plugin",
        file: "vite.config.ts",
        code: `import react from "@vitejs/plugin-react";
import { lingui } from "@lingui/vite-plugin";

export default defineConfig({
  plugins: [
    react(),
    // 1) rewrites t\`…\` and <Trans> into lookups when building
    // 2) lets you import .po files directly
    lingui({ macroTransform: true }),
  ],
});`,
      },
      {
        title: "Create the i18n object and load languages",
        file: "src/i18n.ts",
        code: `import { i18n } from "@lingui/core";
import { messages as en } from "./locales/en.po";

// English is included up front
i18n.loadAndActivate({ locale: "en", messages: en });

// Other languages download when first needed
export async function activateLocale(locale: string) {
  const { messages } = await import(\`./locales/\${locale}.po\`);
  i18n.loadAndActivate({ locale, messages });
}`,
      },
      {
        title: "Wrap the app in a provider",
        file: "src/main.tsx",
        code: `import { I18nProvider } from "@lingui/react";
import { i18n } from "./i18n";

// Components inside re-render when the language changes
createRoot(root).render(
  <I18nProvider i18n={i18n}>
    <App />
  </I18nProvider>,
);`,
      },
      {
        title: "Day-to-day workflow",
        code: `# 1. Write or change English texts in components
# 2. Copy them into the .po files:
pnpm i18n:extract
# 3. Translators fill in msgstr in src/locales/pl.po and ar.po`,
        note: "Extract also prints a table of how many texts are still untranslated per language.",
      },
    ],
  },

  greeting: {
    summary:
      "You write the English sentence in the component. ${name} inside it becomes a placeholder called {name}. The English sentence itself identifies the message.",
    steps: [
      {
        title: "Write the sentence in the component",
        file: "src/App.tsx",
        code: `import { useLingui } from "@lingui/react/macro";

function Greeting() {
  const { t } = useLingui();
  const name = "Ada";
  // t\`…\` marks this text for translation
  return <p>{t\`Welcome back, \${name}!\`}</p>;
}`,
      },
      extractStep,
      {
        title: "The translator fills in the Polish text",
        file: "src/locales/pl.po",
        code: `msgid "Welcome back, {name}!"
msgstr "Witaj ponownie, {name}!"`,
        note: "msgid is the English original (don't edit it). msgstr is the translation. {name} stays as it is.",
      },
      {
        title: "Result",
        code: `en → Welcome back, Ada!
pl → Witaj ponownie, Ada!`,
      },
    ],
  },

  plurals: {
    summary:
      "All plural forms live in one message. You write the English forms in the component; each translator writes the forms their language needs inside the same message.",
    steps: [
      {
        title: "Write the English forms in the component",
        file: "src/App.tsx",
        code: `import { Plural } from "@lingui/react/macro";

function CartSummary({ count }: { count: number }) {
  return (
    <Plural
      value={count}
      _0="Your cart is empty"         // exactly 0
      one="# item in your cart"       // English singular
      other="# items in your cart"    // everything else
    />
  );
}`,
        note: "# is replaced by the number, formatted for the language.",
      },
      extractStep,
      {
        title: "Polish: the translator adds the forms Polish needs",
        file: "src/locales/pl.po",
        code: `msgid "{count, plural, =0 {Your cart is empty} one {# item in your cart} other {# items in your cart}}"
msgstr "{count, plural, =0 {Twój koszyk jest pusty} one {# produkt w koszyku} few {# produkty w koszyku} many {# produktów w koszyku} other {# produktu w koszyku}}"`,
        note: "The <Plural> became one message in the standard ICU format. Polish adds few (2–4, 22–24, …) and many (5–21, …). Arabic adds zero, two, few and many. Thai has no plural forms, so it keeps only =0 and other.",
      },
      {
        title: "Result",
        code: `count 1 → en "1 item in your cart"    pl "1 produkt w koszyku"
count 2 → en "2 items in your cart"   pl "2 produkty w koszyku"
count 5 → en "5 items in your cart"   pl "5 produktów w koszyku"`,
      },
    ],
  },

  select: {
    summary:
      "A <Select> holds every variant in one message and picks one by the value you pass. Translators see all variants together.",
    steps: [
      {
        title: "Write the variants in the component",
        file: "src/App.tsx",
        code: `import { Select } from "@lingui/react/macro";

function LikedReview({ name, gender }: { name: string; gender: string }) {
  return (
    <Select
      value={gender}
      _female={\`\${name} liked your review\`}  // when gender is "female"
      _male={\`\${name} liked your review\`}    // when gender is "male"
      other={\`\${name} liked your review\`}    // anything else
    />
  );
}`,
      },
      extractStep,
      {
        title: "Polish: each variant is different",
        file: "src/locales/pl.po",
        code: `msgid "{gender, select, female {{name} liked your review} male {{name} liked your review} other {{name} liked your review}}"
msgstr "{gender, select, female {{name} polubiła twoją recenzję} male {{name} polubił twoją recenzję} other {{name} polubił(a) twoją recenzję}}"`,
      },
      {
        title: "Thai: the translator can drop the select entirely",
        file: "src/locales/th.po",
        code: `msgid "{gender, select, female {{name} liked your review} male {{name} liked your review} other {{name} liked your review}}"
msgstr "{name} ถูกใจรีวิวของคุณ"`,
        note: "Thai verbs don't change with gender, so one plain sentence covers every case. ICU lets each language use only the structure it needs.",
      },
    ],
  },

  rich: {
    summary:
      "You write normal JSX inside <Trans>. The extract command swaps each element for a numbered tag (<0>, <1>), so translators can move it but never see the HTML.",
    steps: [
      {
        title: "Write the sentence with real elements",
        file: "src/App.tsx",
        code: `import { Trans } from "@lingui/react/macro";

<Trans>
  Read our <a href="/terms">terms of service</a> and <strong>accept</strong> them to continue.
</Trans>`,
      },
      extractStep,
      {
        title: "The translator moves the numbered tags with the words",
        file: "src/locales/pl.po",
        code: `msgid "Read our <0>terms of service</0> and <1>accept</1> them to continue."
msgstr "Przeczytaj nasz <0>regulamin</0> i <1>zaakceptuj</1> go, aby kontynuować."`,
        note: "<0> is the first element (the link) and <1> is the second (the bold text).",
      },
    ],
  },

  number: {
    summary:
      "Lingui doesn't format values inside messages. You format the number first with i18n.number(), which uses the browser's Intl API for the current language, then insert the result.",
    steps: [
      {
        title: "Format, then insert",
        file: "src/App.tsx",
        code: `const { t, i18n } = useLingui();

// "€1,234.50" in English, "1234,50 €" in Polish
const total = i18n.number(1234.5, { style: "currency", currency: "EUR" });

return <p>{t\`Total: \${total}\`}</p>;`,
      },
      extractStep,
      {
        title: "Polish text",
        file: "src/locales/pl.po",
        code: `msgid "Total: {total}"
msgstr "Razem: {total}"`,
      },
      {
        title: "Result",
        code: `en → Total: €1,234.50
pl → Razem: 1234,50 €`,
      },
    ],
  },

  dates: {
    summary:
      'Format the date with i18n.date(). Lingui has no helper for "3 days ago", so this uses the browser\'s Intl.RelativeTimeFormat directly. Then insert both into messages.',
    steps: [
      {
        title: "Format, then insert",
        file: "src/App.tsx",
        code: `const { t, i18n } = useLingui();

const ordered = i18n.date(new Date("2026-03-14"), { dateStyle: "long" });
const shipped = new Intl.RelativeTimeFormat(i18n.locale, { numeric: "auto" })
  .format(-3, "day");   // "3 days ago"

return (
  <>
    <p>{t\`Ordered on \${ordered}\`}</p>
    <p>{t\`Shipped \${shipped}\`}</p>
  </>
);`,
      },
      extractStep,
      {
        title: "Polish text",
        file: "src/locales/pl.po",
        code: `msgid "Ordered on {ordered}"
msgstr "Zamówiono {ordered}"

msgid "Shipped {shipped}"
msgstr "Wysłano {shipped}"`,
      },
      {
        title: "Result",
        code: `en → Ordered on March 14, 2026      Shipped 3 days ago
pl → Zamówiono 14 marca 2026         Wysłano 3 dni temu`,
      },
    ],
  },

  outside: {
    summary:
      "Outside components there is no useLingui(). Mark the message with msg`…` at the top of the file: that only defines it. i18n._() translates it later, when the function runs, so it follows the current language.",
    steps: [
      {
        title: "Define the message, translate it when needed",
        file: "src/validation.ts",
        code: `import { msg } from "@lingui/core/macro";
import { i18n } from "./i18n";

// Defined once. Not translated yet.
const invalidEmail = msg\`Please enter a valid email address.\`;

export function validateEmail(value: string) {
  if (isValidEmail(value)) return null;
  // Translated now, in the current language
  return i18n._(invalidEmail);
}`,
        note: "Using t`…` at the top of the file would translate once at startup and never change.",
      },
      extractStep,
      {
        title: "Polish text",
        file: "src/locales/pl.po",
        code: `msgid "Please enter a valid email address."
msgstr "Podaj prawidłowy adres e-mail."`,
      },
    ],
  },

  fallback: {
    summary:
      "The extract command leaves msgstr empty until someone translates it. Empty means \"use the fallback\", which here is the English original.",
    steps: [
      {
        title: "Write the text as usual",
        file: "src/App.tsx",
        code: `<Trans>This sentence has not been translated yet.</Trans>`,
      },
      {
        title: "Polish has no translation yet",
        file: "src/locales/pl.po",
        code: `msgid "This sentence has not been translated yet."
msgstr ""`,
      },
      {
        title: "Fallback is set in the config",
        file: "lingui.config.ts",
        code: `fallbackLocales: { default: "en" },  // use English when msgstr is empty`,
        note: "Extract lists this as 1 missing translation for pl, ar and th. You can also make the build fail on missing translations (failOnMissing in the Vite plugin).",
      },
    ],
  },

  playground: {
    summary:
      "The same components as examples 2 and 3, with values from React state. When state changes, they re-render with the right form.",
    steps: [
      {
        title: "Component",
        file: "src/App.tsx",
        code: `const [count, setCount] = useState(1);
const [gender, setGender] = useState("female");

return (
  <>
    <CartSummary count={count} />
    <LikedReview name="Ada" gender={gender} />
  </>
);`,
        note: "Reusing the same components matters. <Plural value={n}> and <Plural value={count}> would extract as two different messages to translate, because the variable name is part of the message.",
      },
    ],
  },
};
