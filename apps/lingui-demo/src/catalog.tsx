// Builds the "What's inside the catalog" view: the active language's messages
// exactly as Lingui holds them after loading the compiled .po chunk.
import type { CatalogView } from "@i18n-compare/shared";
import { i18n, sourceMessages } from "./i18n";

/** Turns a compiled message back into readable ICU text, e.g. ["Hi ", ["name"]] → "Hi {name}". */
function toIcu(message: unknown): string {
  if (typeof message === "string") return message;
  if (!Array.isArray(message)) return String(message);
  return message
    .map((token) => {
      if (typeof token === "string") return token;
      const [name, type, options] = token as [string, string?, Record<string, unknown>?];
      if (!type) return `{${name}}`;
      if (!options) return `{${name}, ${type}}`;
      const offsetStr = typeof options.offset === "number" ? `offset:${options.offset} ` : "";
      const branches = Object.entries(options)
        .filter(([key]) => key !== "offset")
        .map(([key, value]) => `${/^\d+$/.test(key) ? `=${key}` : key} {${toIcu(value)}}`)
        .join(" ");
      return `{${name}, ${type}, ${offsetStr}${branches}}`;
    })
    .join("");
}

export function catalogView(): CatalogView {
  const messages = i18n.messages;
  const entries = Object.entries(messages).map(
    ([id, compiled]) =>
      `  // en: ${sourceMessages[id] !== undefined ? toIcu(sourceMessages[id]) : "(source text unavailable)"}\n  ${JSON.stringify(
        id,
      )}: ${JSON.stringify(compiled)}`,
  );
  return {
    code: `{\n${entries.join(",\n")}\n}`,
    count: entries.length,
    notes: (
      <>
        <li>
          <strong>It's the .po file after the build took it apart.</strong> The keys are short codes made from the
          English text, so each entry has a comment showing which English text it belongs to.
        </li>
        <li>
          <strong>The text is already split into pieces:</strong> plain strings, placeholders like{" "}
          <code>["name"]</code>, and every plural or gender form inside one entry.
        </li>
        <li>
          <strong>The browser just joins the pieces.</strong> There is nothing to parse while the app runs, so the
          runtime is small (~4 kB gzip) and each lookup is fast.
        </li>
        <li>
          <strong>Missing translations are filled in at build time.</strong> In pl, ar and th, the untranslated sentence
          already holds the English text.
        </li>
      </>
    ),
  };
}
