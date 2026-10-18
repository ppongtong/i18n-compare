// One behavioural test suite, run unchanged against both apps.
// If a library cannot express a scenario, its app fails here — which is the point.
import type { ReactElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { LOCALES, demo, personFor, type Locale } from "./data";
import { expected } from "./expectations";

const text = (testId: string, root: HTMLElement = document.body) =>
  within(root).getByTestId(testId).textContent?.trim();

async function renderIn(renderApp: () => ReactElement, locale: Locale) {
  render(renderApp());
  await switchTo(locale);
}

async function switchTo(locale: Locale) {
  const select = (await screen.findByTestId("locale-select")) as HTMLSelectElement;
  if (select.value !== locale) fireEvent.change(select, { target: { value: locale } });
  // Non-source catalogs load lazily; wait until the new one is active.
  await waitFor(() => expect(text("out-greeting")).toBe(expected[locale].greeting));
}

export function runConformanceSuite(library: string, renderApp: () => ReactElement) {
  describe(`${library} — conformance`, () => {
    afterEach(cleanup);

    // Must run first: it relies on "pl" not having been loaded by an earlier test.
    it("loads a catalog on first use only, then serves it from memory", async () => {
      await renderIn(renderApp, "pl");
      await switchTo("en");
      await switchTo("pl");
      const kinds = (group: HTMLElement) =>
        [...group.querySelectorAll("[data-kind]")].map((el) => el.getAttribute("data-kind"));
      // Newest first: pl again, en, pl the first time.
      const [plAgain, en, plFirst] = screen.getAllByTestId("activity-group");
      expect(kinds(plFirst)).toContain("fetch");
      expect(kinds(en)).toContain("bundled");
      expect(kinds(plAgain)).toContain("cached");
      expect(kinds(plAgain)).not.toContain("fetch");
    });

    for (const { code: locale } of LOCALES) {
      const exp = expected[locale];

      describe(`locale: ${locale}`, () => {
        it("interpolates variables", async () => {
          await renderIn(renderApp, locale);
          expect(text("out-greeting")).toBe(exp.greeting);
        });

        it("selects the right CLDR plural form for every count", async () => {
          await renderIn(renderApp, locale);
          for (const n of demo.cartCounts) {
            expect(text(`cart-${n}`), `count=${n}`).toBe(exp.cart(n));
          }
        });

        it("selects by gender (ICU select / i18next context)", async () => {
          await renderIn(renderApp, locale);
          for (const p of demo.people) {
            expect(text(`updated-${p.gender}`)).toBe(exp.updated(p.name, p.gender));
          }
        });

        it("renders rich text with React elements inside the translation", async () => {
          await renderIn(renderApp, locale);
          const out = screen.getByTestId("out-rich");
          expect(out.textContent?.trim()).toBe(exp.rich);
          expect(out.querySelector("a[href='/terms']")).not.toBeNull();
          expect(out.querySelector("strong")).not.toBeNull();
        });

        it("formats currency with the active locale", async () => {
          await renderIn(renderApp, locale);
          expect(text("out-number")).toBe(exp.total);
        });

        it("formats dates and relative time with the active locale", async () => {
          await renderIn(renderApp, locale);
          expect(text("ordered")).toBe(exp.ordered);
          expect(text("shipped")).toBe(exp.shipped);
        });

        it("translates outside React components", async () => {
          await renderIn(renderApp, locale);
          expect(text("out-outside")).toBe(exp.emailError);
        });

        it("falls back to the source text for untranslated messages", async () => {
          await renderIn(renderApp, locale);
          expect(text("out-fallback")).toBe(exp.fallback);
        });

        it("updates plural + gender live from user input", async () => {
          await renderIn(renderApp, locale);
          fireEvent.change(screen.getByTestId("playground-count"), { target: { value: "3" } });
          fireEvent.change(screen.getByTestId("playground-gender"), { target: { value: "male" } });
          await waitFor(() => expect(text("playground-cart")).toBe(exp.cart(3)));
          expect(text("playground-updated")).toBe(exp.updated(personFor("male"), "male"));
        });
      });
    }
  });
}
