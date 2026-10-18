// Plain-language, step-by-step explanations shown under each scenario.
// Snippets are trimmed to the essentials; the real code is in i18n.ts, App.tsx and validation.ts.
import type { HowTo, ScenarioId } from "@i18n-compare/shared";

export const howTo: Record<ScenarioId, HowTo> = {
  setup: {
    summary:
      "i18next is the translation engine; react-i18next connects it to React. You give every sentence a short name (a key), keep the real text in one JSON file per language, and components ask for text by key.",
    steps: [
      {
        title: "Install the packages",
        code: `pnpm add i18next react-i18next i18next-resources-to-backend
pnpm add -D i18next-cli   # optional: finds keys in your code, reports missing ones`,
      },
      {
        title: "Create one JSON file per language",
        code: `src/locales/
  en/translation.json   // English: shipped with the app
  pl/translation.json   // Polish: downloaded when the user picks it
  ar/translation.json   // Arabic: same`,
        note: "Every file has the same keys. Only the text differs.",
      },
      {
        title: "Create the i18n object once",
        file: "src/i18n.ts",
        code: `import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import en from "./locales/en/translation.json";

i18n
  // Lets React components use useTranslation()
  .use(initReactI18next)
  // How to get other languages: import their JSON file when first needed
  .use(resourcesToBackend((lng, ns) => import(\`./locales/\${lng}/\${ns}.json\`)))
  .init({
    lng: "en",                               // start in English
    fallbackLng: "en",                       // use English if a text is missing
    resources: { en: { translation: en } },  // English is included up front...
    partialBundledLanguages: true,           // ...other languages load later
    interpolation: { escapeValue: false },   // React already escapes HTML
  });

export default i18n;`,
        note: "Simplified: the real file uses import.meta.glob so English isn't also built as a separate download.",
      },
      {
        title: "Run that file once, before the app renders",
        file: "src/main.tsx",
        code: `import "./i18n";   // that's all: no provider component is needed

createRoot(root).render(<App />);`,
      },
      {
        title: "Change the language anywhere",
        code: `await i18n.changeLanguage("pl");   // downloads pl if needed, then re-renders`,
      },
      {
        title: "Optional: let TypeScript check the keys",
        file: "src/i18next.d.ts",
        code: `import "i18next";
import type en from "./locales/en/translation.json";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: { translation: typeof en };
  }
}
// Now t("greting") (typo) is a compile error.`,
      },
    ],
  },

  greeting: {
    summary:
      "The sentence lives in the JSON files under a key. {{name}} marks a gap that is filled in when the text is shown.",
    steps: [
      {
        title: "English text",
        file: "src/locales/en/translation.json",
        code: `{
  "greeting": "Welcome back, {{name}}!"
}`,
        note: '"greeting" is the key you use in code. {{name}} is a placeholder.',
      },
      {
        title: "Polish text: same key, translated",
        file: "src/locales/pl/translation.json",
        code: `{
  "greeting": "Witaj ponownie, {{name}}!"
}`,
        note: "The translator keeps {{name}} exactly as it is.",
      },
      {
        title: "Use it in a component",
        file: "src/App.tsx",
        code: `import { useTranslation } from "react-i18next";

function Greeting() {
  // t() looks up a key in the current language's file
  const { t } = useTranslation();
  // Fill the {{name}} placeholder with "Ada"
  return <p>{t("greeting", { name: "Ada" })}</p>;
}`,
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
      "Each plural form is a separate entry. The key gets a suffix naming the form (_one, _few, _many, …). You pass count, and i18next picks the right entry using that language's plural rules.",
    steps: [
      {
        title: "English: 2 forms, plus an optional one for zero",
        file: "src/locales/en/translation.json",
        code: `{
  "cart_zero":  "Your cart is empty",
  "cart_one":   "{{count, number}} item in your cart",
  "cart_other": "{{count, number}} items in your cart"
}`,
        note: "{{count, number}} prints the count formatted for the language. _zero is optional and is used when count is 0.",
      },
      {
        title: "Polish: the translator adds the forms Polish needs",
        file: "src/locales/pl/translation.json",
        code: `{
  "cart_zero":  "Twój koszyk jest pusty",
  "cart_one":   "{{count, number}} produkt w koszyku",
  "cart_few":   "{{count, number}} produkty w koszyku",
  "cart_many":  "{{count, number}} produktów w koszyku",
  "cart_other": "{{count, number}} produktu w koszyku"
}`,
        note: "In Polish, few covers 2–4, 22–24, … and many covers 5–21, 25–31, …. The Arabic file has six forms. Thai has no plural forms, so the Thai file only has cart_zero and cart_other.",
      },
      {
        title: "Use it: ask for the key without a suffix",
        file: "src/App.tsx",
        code: `const { t } = useTranslation();

// i18next adds the right suffix (_one, _few, …) based on count
t("cart", { count: 5 })`,
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
      'i18next calls this "context". Each variant is its own key with a suffix (_female, _male). If no matching key exists, the plain key is used.',
    steps: [
      {
        title: "English: the variants are identical, but they must exist",
        file: "src/locales/en/translation.json",
        code: `{
  "liked":        "{{name}} liked your review",
  "liked_female": "{{name}} liked your review",
  "liked_male":   "{{name}} liked your review"
}`,
        note: "They exist so the extract tool and translators know other languages need them.",
      },
      {
        title: "Polish: each variant is different",
        file: "src/locales/pl/translation.json",
        code: `{
  "liked":        "{{name}} polubił(a) twoją recenzję",
  "liked_female": "{{name}} polubiła twoją recenzję",
  "liked_male":   "{{name}} polubił twoją recenzję"
}`,
        note: "Thai verbs don't change with gender, so the Thai file repeats the same sentence in all three keys.",
      },
      {
        title: "Use it: pass the gender as context",
        file: "src/App.tsx",
        code: `// "female" → looks up liked_female
t("liked", { name: "Ada", context: "female" })

// "other" has no liked_other key → falls back to plain "liked"
t("liked", { name: "Sam", context: "other" })`,
      },
      {
        title: "Tell the extract tool to keep these keys",
        file: "i18next.config.ts",
        code: `extract: {
  // The gender comes from a variable, so the tool can't see which
  // variants are used. Without this line it would delete them.
  preservePatterns: ["liked_*"],
}`,
      },
    ],
  },

  rich: {
    summary:
      "The text contains made-up tags like <link>…</link>. In the component you say which React element each tag turns into. Translators can move the tags wherever their grammar needs them.",
    steps: [
      {
        title: "English text with named tags",
        file: "src/locales/en/translation.json",
        code: `{
  "terms": "Read our <link>terms of service</link> and <bold>accept</bold> them to continue."
}`,
      },
      {
        title: "Polish text: the tags move with the words",
        file: "src/locales/pl/translation.json",
        code: `{
  "terms": "Przeczytaj nasz <link>regulamin</link> i <bold>zaakceptuj</bold> go, aby kontynuować."
}`,
      },
      {
        title: "Use the <Trans> component and map each tag",
        file: "src/App.tsx",
        code: `import { Trans } from "react-i18next";

<Trans
  i18nKey="terms"
  components={{
    link: <a href="/terms" />,  // <link>…</link> becomes this link
    bold: <strong />,           // <bold>…</bold> becomes bold text
  }}
/>`,
      },
    ],
  },

  number: {
    summary:
      "i18next has built-in formatters you can use inside the text. {{price, currency}} writes the value as money, the way the current language expects.",
    steps: [
      {
        title: "Mark the value as currency in the text",
        file: "src/locales/en/translation.json  ·  pl/translation.json",
        code: `"total": "Total: {{price, currency}}"     // en
"total": "Razem: {{price, currency}}"     // pl`,
      },
      {
        title: "Pass the number and which currency",
        file: "src/App.tsx",
        code: `t("total", {
  price: 1234.5,
  // Options for the currency formatter of the "price" value
  formatParams: { price: { currency: "EUR" } },
})`,
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
      "Same idea as prices: built-in datetime and relativetime formatters inside the text. They use the browser's Intl API for the current language.",
    steps: [
      {
        title: "Mark the values in the text",
        file: "src/locales/en/translation.json",
        code: `{
  "ordered": "Ordered on {{date, datetime}}",
  "shipped": "Shipped {{days, relativetime(day)}}"
}`,
        note: "relativetime(day) means the number is a count of days.",
      },
      {
        title: "Pass the values",
        file: "src/App.tsx",
        code: `t("ordered", {
  date: new Date("2026-03-14"),
  formatParams: { date: { dateStyle: "long" } },
})

// -3 days → "3 days ago"
t("shipped", { days: -3 })`,
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
      "Outside components there is no useTranslation(). Import the i18n object and call i18n.t() at the moment you need the text, so it uses the current language.",
    steps: [
      {
        title: "Text in a nested group",
        file: "src/locales/en/translation.json",
        code: `{
  "errors": {
    "email": "Please enter a valid email address."
  }
}`,
        note: 'Nested keys are joined with a dot: "errors.email".',
      },
      {
        title: "A plain function that returns the message",
        file: "src/validation.ts",
        code: `import i18n from "./i18n";

export function validateEmail(value: string) {
  if (isValidEmail(value)) return null;
  // Translated now, when the function runs, in the current language
  return i18n.t("errors.email");
}`,
        note: "Don't call i18n.t() at the top of the file. That would translate once at startup and never change.",
      },
    ],
  },

  fallback: {
    summary:
      "The key has text only in English. fallbackLng tells i18next to use English when the current language has nothing.",
    steps: [
      {
        title: "English has the text",
        file: "src/locales/en/translation.json",
        code: `"untranslated": "This sentence has not been translated yet."`,
      },
      {
        title: "Polish has an empty placeholder",
        file: "src/locales/pl/translation.json",
        code: `"untranslated": ""   // added by the extract tool, waiting for a translator`,
      },
      {
        title: "Tell i18next what to do",
        file: "src/i18n.ts",
        code: `i18n.init({
  fallbackLng: "en",         // use English when a text is missing
  returnEmptyString: false,  // treat "" as missing, too
});`,
        note: 'Without returnEmptyString: false, i18next treats "" as a real translation and shows blank text.',
      },
      {
        title: "Use it like any other key",
        code: `t("untranslated")   // → English text in pl, ar and th`,
      },
    ],
  },

  playground: {
    summary:
      "The same calls as examples 2 and 3, with values from React state. When state changes, the component re-renders and t() picks the right form.",
    steps: [
      {
        title: "Component",
        file: "src/App.tsx",
        code: `const { t } = useTranslation();
const [count, setCount] = useState(1);
const [gender, setGender] = useState("female");

return (
  <>
    <p>{t("cart", { count })}</p>
    <p>{t("liked", { name: "Ada", context: gender })}</p>
  </>
);`,
      },
    ],
  },
};
