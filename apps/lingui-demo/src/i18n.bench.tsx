import { renderToString } from "react-dom/server";
import { expect, test } from "vitest";
import { I18nProvider } from "@lingui/react";
import { msg, plural } from "@lingui/core/macro";
import { demo, expected } from "@i18n-compare/shared";
import { activateLocale, i18n as i18nInstance } from "./i18n";
import { App } from "./App";

// Local binding: avoids module-runner export getters skewing results.
const i18n = i18nInstance;
await activateLocale("pl");

const name = demo.userName;
// Same source text as App.tsx → same message ids → real catalog lookups.
const greeting = msg`Welcome back, ${name}!`;
const cart = (count: number) =>
  plural(count, { 0: "Your cart is empty", one: "# item in your cart", other: "# items in your cart" });

// Guard: make sure we benchmark real catalog lookups, not fallbacks.
expect(i18n._(greeting)).toBe(expected.pl.greeting);
expect(cart(5)).toBe(expected.pl.cart(5));

// Bench names match the react-i18next app so the two tables line up.
test("Lingui (pl)", async ({ bench }) => {
  await bench.compare(
    bench("translate: interpolation", () => {
      i18n._(greeting);
    }),
    bench("translate: plural x6", () => {
      for (const count of demo.cartCounts) cart(count);
    }),
    bench("renderToString(<App />)", () => {
      renderToString(
        <I18nProvider i18n={i18n}>
          <App />
        </I18nProvider>,
      );
    }),
    { time: 1000 },
  );
});
