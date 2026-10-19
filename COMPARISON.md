# react-i18next vs Lingui: findings and decision guide

Measured on 2026-10-18 with i18next 26.5 + react-i18next 17.1, and Lingui 6.10 using `@lingui/vite-plugin` with `macroTransform: true`. Build: Vite 8, React 19.3. Machine: macOS, Node 24. To re-run: `pnpm test && pnpm compare:size && pnpm bench`.

## TL;DR

**Both libraries pass all 37 conformance tests.** Neither has a gap on the features most apps need: plurals in all CLDR categories, gender/select, rich text, formatting, lazy loading, and fallback. The choice comes down to **how your team wants to author strings, and how translations reach production**.

- **Choose Lingui** if:
  - you want the smallest runtime;
  - you want developers to write natural-language messages in code instead of naming keys;
  - you want standard ICU/PO catalogs for translators or a TMS;
  - you control the build pipeline.
- **Choose react-i18next** if:
  - you need translations loaded or updated at runtime without a redeploy (CMS or CDN);
  - you want stable semantic keys shared across apps, backends or platforms;
  - you can't (or don't want to) add a compile-time transform;
  - you value the larger ecosystem: backends, language detectors, framework integrations, hosted TMS.

## Measured results

### Bundle size (`pnpm compare:size`, gzip)

| | react-i18next | Lingui |
|---|---|---|
| Library runtime only (React excluded) | **22.3 kB** | **4.2 kB** |
| Demo app initial JS (incl. React 19, en catalog and the demo's explanation text) | 96.1 kB | 79.6 kB |
| Lazy `pl` catalog | 0.5 kB | 0.5 kB |
| Lazy `ar` catalog | 0.6 kB | 0.6 kB |
| Lazy `th` catalog | 0.6 kB | 0.5 kB |

Lingui's runtime is about 18 kB gzip smaller. This is a fixed cost and does not grow with your app. The macros compile to `i18n._(id)` calls, and the message parser runs at build time.

### Runtime speed (`pnpm bench`, locale `pl`, operations/second)

| | react-i18next | Lingui |
|---|---|---|
| Translate one interpolated message | 0.62 M/s | 9.4 M/s |
| Translate a plural message ×6 | 51 k/s | 96 k/s |
| `renderToString(<App />)` (whole demo) | 4,100/s | 4,500/s |

Lingui translates individual messages much faster, because its messages are precompiled and i18next interpolates at runtime. But both take **a few microseconds per call at most**. Once React renders the page, the two land within about 10% of each other. **Performance is not a reason to pick either one.**

### Behaviour (`pnpm test`)

All 37 tests pass in both apps (9 scenarios × en/pl/ar/th, plus a lazy-loading check). Arabic's six plural forms, Polish few/many, Thai's single plural form and Buddhist-calendar dates, RTL, and `Intl` formatting produce byte-identical output in both.

## Things this repo surfaced in practice

These came up while building the demos. They are the kind of issue that tends to appear only after you adopt a library.

1. **i18next: empty strings beat fallback.** `i18next-cli extract` writes `""` placeholders for untranslated keys. By default i18next treats `""` as a valid translation, so users see blank text instead of English. Fix: set `returnEmptyString: false` (see [i18n.ts](apps/react-i18next-demo/src/i18n.ts)). The conformance test caught it.
2. **i18next: dynamic `context` breaks extraction.** `t("profileUpdated", { context: gender })` uses a runtime value. Static analysis can't see it, so `extract` tried to **delete** the `_female` and `_male` variants. Fix: set `preservePatterns: ["profileUpdated_*"]` in [i18next.config.ts](apps/react-i18next-demo/i18next.config.ts). Lingui's ICU `select` keeps every branch in one message, so its extractor sees them all.
3. **Lingui: same text with different variable names gives different messages.** `<Plural value={n}>` and `<Plural value={count}>` extract as two separate messages, which means double translation work. The fix is a small reusable component (`CartSummary` in [App.tsx](apps/lingui-demo/src/App.tsx)).
4. **Lingui: module-level strings need `msg`.** Calling `` t`...` `` at module scope runs once, in the initial locale. Define module-level strings lazily with `` msg`...` `` and translate them at call time with `i18n._()` (see [validation.ts](apps/lingui-demo/src/validation.ts)). In i18next, calling `i18n.t()` at module scope has the same trap, but the code looks less wrong.
5. **Lingui: no in-message formatters.** Currency, dates and relative time are formatted in code (`i18n.number`, `i18n.date`, and `Intl.RelativeTimeFormat` directly, since Lingui has no relative-time helper) and then interpolated. i18next's `{{price, currency}}` and `{{days, relativetime(day)}}` keep the format inside the message, so translators can see it.
6. **Toolchain churn.** `@vitejs/plugin-react` 6 (for Vite 8) dropped its built-in Babel pipeline. Lingui already ships a native macro transform for this, but Lingui will always depend on a build-time transform. react-i18next needs none.
7. **Lingui: adding a language needs a dev-server restart.** After adding `th` to `lingui.config.ts`, a running `pnpm dev` kept serving English for Thai, because the Vite plugin reads the config only at startup. The tests and a fresh build were correct. With i18next, a new JSON file was picked up straight away.

## Side-by-side comparison

| | react-i18next | Lingui |
|---|---|---|
| **Authoring** | Semantic keys: `t("cart", { count })`, with the text in JSON | Source text in code: `` t`Welcome back, ${name}!` ``, `<Trans>…</Trans>` |
| **Readability of components** | You look up keys to know what renders | The code reads like the UI |
| **Changing English copy** | Edit JSON. The key is stable and translations survive | The message id changes, so existing translations become obsolete unless you use explicit ids |
| **Message format** | i18next JSON: `{{var}}`, `_one`/`_few` key suffixes, `_context` suffixes. ICU is available via the `i18next-icu` plugin | ICU MessageFormat in PO (or JSON). Plural and select live inside one string |
| **Translator experience** | One key per plural form or context. Works with any JSON-capable TMS | Standard gettext PO with source references and comments. Every TMS supports it |
| **Rich text** | `<Trans components={{ link: <a/> }}>` with named tags (`<link>`) | Plain JSX inside `<Trans>`, auto-numbered for translators (`<0>`) |
| **Formatting** | Built-in in-message formatters: number, currency, datetime, relativetime, list | `i18n.number`, `i18n.date`, then interpolate |
| **Type safety** | Keys are typed via `CustomTypeOptions`, so `tsc` catches a mistyped key | No keys to mistype. Missing translations are reported by `extract`, and `failOnMissing` can fail the build |
| **Build requirements** | None. Runtime only | A macro transform (native Vite plugin, Babel or SWC) plus an extract step |
| **Loading translations** | Backends for bundled, HTTP, CDN or CMS sources. Translations can change without a redeploy | Catalogs are compiled at build time and usually bundled. Runtime loading is possible but less idiomatic |
| **Code splitting** | Namespaces per feature/route, loaded on demand | One catalog per locale by default; per-route splitting is more advanced setup |
| **Tooling** | `i18next-cli`: extract, status, types, lint for hardcoded strings | `lingui extract` (missing-translation table), plus a Vite plugin that compiles `.po` on import |
| **Runtime size** | ~22 kB gzip | ~4 kB gzip |
| **Ecosystem** | Very large: detectors, backends, Next.js/RN/Node integrations, Locize | Smaller but active: React, RN, Vue, Svelte, Astro, Node |

## Decision guide

Score each question for your project and see which way most answers lean.

| Question | Leans react-i18next | Leans Lingui |
|---|---|---|
| Must copy or translations change without a redeploy? | **Yes** | No |
| Is initial JS budget tight (mobile, emerging markets)? | | **Yes** |
| Do translators or your TMS prefer PO/ICU? | | **Yes** |
| Are keys shared with a backend, native apps or other frameworks? | **Yes** | |
| Do developers dislike inventing and maintaining key names? | | **Yes** |
| Is the build pipeline fixed, legacy or out of your control? | **Yes** | |
| Is the copy mostly written by developers in English first? | | **Yes** |
| Do you need gender/select-heavy grammar (e.g. Slavic, Arabic)? | | **Yes**: ICU keeps the variants together |
| Is a large existing i18next JSON codebase being migrated? | **Yes** | |

## What this repo does not measure

These are worth a quick spike if they matter to you:

- SSR and streaming (Next.js App Router)
- React Native
- Catalogs with thousands of messages, where per-message compiled size and parse time start to matter
- TMS round-trips with your actual vendor (Crowdin, Phrase, Lokalise, Weblate)
- Editor tooling, such as i18n Ally
