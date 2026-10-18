# i18n-compare: react-i18next vs Lingui

A pnpm monorepo with **two React apps that implement the same nine i18n scenarios**: one with [react-i18next](https://react.i18next.com) and one with [Lingui](https://lingui.dev). Both apps must pass **the same test suite**, so any difference you see comes from the library and not from the test.

Start with **[COMPARISON.md](COMPARISON.md)**. It has the measured results, the trade-offs, and a decision guide.

## Quick start

```bash
pnpm install
pnpm dev          # all three dev servers
```

| URL | What |
|---|---|
| http://localhost:5100 | **Side-by-side viewer**: both apps in one window, one locale switch |
| http://localhost:5101 | react-i18next app |
| http://localhost:5102 | Lingui app |

Each scenario card has a **Code** toggle that shows how that library expresses it.

At the top of each app, the **"What happens when you change the language"** panel explains how that library loads a language. It also keeps a live log of each switch: which catalog was fetched, the actual network request with its size and time, and when a language was served from memory or was already bundled.

## Commands

| Command | What it does |
|---|---|
| `pnpm test` | Runs the shared conformance suite (27 tests: 9 scenarios × 3 locales) against both apps |
| `pnpm typecheck` | `tsc` for every package |
| `pnpm bench` | Micro-benchmarks: translate calls and full `renderToString(<App />)`. Runs one app at a time |
| `pnpm compare:size` | Builds both apps and writes `reports/bundle-size.md`: runtime size, initial JS, and lazy locale chunks |
| `pnpm i18n:extract` | Runs each library's extractor: `i18next-cli extract` and `lingui extract` |
| `pnpm i18n:status` | `i18next-cli status`, which reports untranslated keys. Lingui prints the same table during extract |

## Layout

```
apps/
  react-i18next-demo/   i18next 26 + react-i18next 17, JSON catalogs, i18next-cli
  lingui-demo/          Lingui 6 (native macro transform via @lingui/vite-plugin), .po catalogs
  side-by-side/         static page with two iframes and a ?locale= sync
packages/
  shared/               library-free UI shell, demo data, expected strings, conformance suite
scripts/
  compare-size.mjs      bundle-size report
reports/                generated output
```

### The scenarios

1. Interpolation
2. CLDR plurals: en (2 forms), pl (4), ar (6, including zero/two)
3. Gender/select
4. Rich text with React elements inside a translation
5. Currency formatting
6. Dates and relative time
7. Translating outside React (a validation helper)
8. Falling back to English for a missing translation
9. A live playground (count + gender inputs)

### How the apps are kept honest

- `packages/shared/src/expectations.ts` is the single source of truth for what every scenario must render in every locale.
- `packages/shared/src/conformance.tsx` is the suite. Each app's `App.test.tsx` is a single line that runs it.
- Both apps bundle `en` and lazy-load `pl` and `ar` as separate chunks. The page chrome is identical and stays in English; only the scenario outputs are translated.

## Try it yourself

These are the exercises that tell you most about day-to-day developer experience. Do each one in both apps:

1. **Add a new message.** In react-i18next: add a key to `en/translation.json`, call `t("newKey")`, then run `pnpm i18n:extract`. In Lingui: write ``t`New message` `` and run `pnpm i18n:extract`.
2. **Change the English wording** of an existing message, then run extract again. Watch what happens to the existing pl/ar translations.
3. **Add a locale** (for example `de`) to `LOCALES` in `packages/shared/src/data.ts`, to each library's config, and to `expectations.ts`.
4. **Make a typo** in a key or a variable name and see which tool catches it: `tsc`, extract, the tests, or nothing.
