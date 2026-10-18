import { renderToString } from "react-dom/server";
import { expect, test } from "vitest";
import { demo, expected } from "@i18n-compare/shared";
import i18nInstance from "./i18n";
import { App } from "./App";

// Local binding: avoids module-runner export getters skewing results.
const i18n = i18nInstance;
await i18n.changeLanguage("pl");
// Guard: make sure we benchmark real catalog lookups, not fallbacks.
expect(i18n.t("greeting", { name: demo.userName })).toBe(expected.pl.greeting);
expect(i18n.t("cart", { count: 5 })).toBe(expected.pl.cart(5));

// Bench names match the Lingui app so the two tables line up.
test("react-i18next (pl)", async ({ bench }) => {
  await bench.compare(
    bench("translate: interpolation", () => {
      i18n.t("greeting", { name: demo.userName });
    }),
    bench("translate: plural x6", () => {
      for (const count of demo.cartCounts) i18n.t("cart", { count });
    }),
    bench("renderToString(<App />)", () => {
      renderToString(<App />);
    }),
    { time: 1000 },
  );
});
