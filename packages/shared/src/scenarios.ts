// Scenario titles and plain-language descriptions, identical in both apps.
// Each app supplies its own HowTo walkthrough for every scenario.

export const SCENARIOS = {
  setup: {
    title: "0. Setup (done once)",
    description: "What you add to a project before you can translate anything.",
  },
  greeting: {
    title: "1. Put a value into a sentence",
    description: "The user's name is inserted into a translated sentence.",
  },
  plurals: {
    title: "2. Plurals",
    description:
      "The sentence changes with the number. English has 2 forms (1 item, 2 items), Polish has 4, Arabic has 6, and Thai has just 1.",
  },
  select: {
    title: "3. Text that depends on gender",
    description:
      "The sentence changes with the person's gender: her, his or their profile in English. Polish and Arabic also change the verb, while Thai uses one sentence for everyone.",
  },
  rich: {
    title: "4. A link and bold text inside a sentence",
    description:
      "Part of the sentence is a link and part is bold. Translators must be able to move them, because word order differs between languages.",
  },
  number: {
    title: "5. Prices",
    description: "The same price is written differently per language: €1,234.50 in English, 1234,50 € in Polish.",
  },
  dates: {
    title: "6. Dates and “3 days ago”",
    description:
      "Dates and relative times follow each language's conventions. Thai uses the Buddhist calendar, so 2026 is written as 2569.",
  },
  outside: {
    title: "7. Text in plain code (outside components)",
    description:
      "A validation helper is a plain function, not a React component. It still has to return its error message in the current language.",
  },
  fallback: {
    title: "8. A missing translation",
    description: "This sentence has no Polish, Arabic or Thai translation yet. English should appear instead of blank text.",
  },
  playground: {
    title: "9. Try it",
    description: "Change the number or the gender. The text below updates in the current language.",
  },
} as const;

export type ScenarioId = keyof typeof SCENARIOS;

export interface CodeStep {
  /** What this step is, in plain words, e.g. "English text file". */
  title: string;
  /** File the code lives in, shown as a label. */
  file?: string;
  code: string;
  /** Short explanation shown under the code. */
  note?: string;
}

export interface HowTo {
  /** One or two sentences explaining the approach before the steps. */
  summary: string;
  steps: CodeStep[];
}
