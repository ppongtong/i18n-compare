// Library-agnostic chrome. Page chrome stays in English on purpose: only the
// scenario outputs are translated, so the two apps are easy to compare.
import { createContext, useContext, useEffect, type ReactNode } from "react";
import { LOCALES, localeDir, type Gender, type Locale } from "./data";

const LocaleContext = createContext<Locale>("en");

interface ShellProps {
  library: string;
  accent: "teal" | "violet";
  tagline: string;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  /** True while a locale catalog is being fetched. */
  loading: boolean;
  children: ReactNode;
}

export function Shell({ library, accent, tagline, locale, onLocaleChange, loading, children }: ShellProps) {
  useEffect(() => {
    document.title = `${library} demo`;
  }, [library]);

  return (
    <LocaleContext.Provider value={locale}>
      <div className={`shell accent-${accent}`}>
        <header className="shell-header">
          <div>
            <p className="eyebrow">i18n compare</p>
            <h1>{library}</h1>
            <p className="tagline">{tagline}</p>
          </div>
          <label className="locale-picker">
            <span>Locale</span>
            <select
              data-testid="locale-select"
              value={locale}
              onChange={(e) => onLocaleChange(e.target.value as Locale)}
            >
              {LOCALES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label} ({l.code}) — {l.note}
                </option>
              ))}
            </select>
            <span className="status" data-testid="locale-status" aria-live="polite">
              {loading ? "Loading catalog…" : `Active: ${locale}`}
            </span>
          </label>
        </header>
        <main className="scenarios">{children}</main>
      </div>
    </LocaleContext.Provider>
  );
}

interface ScenarioProps {
  id: string;
  title: string;
  description: string;
  code: string;
  children: ReactNode;
}

export function Scenario({ id, title, description, code, children }: ScenarioProps) {
  const locale = useContext(LocaleContext);
  return (
    <section className="scenario" aria-labelledby={`h-${id}`}>
      <h2 id={`h-${id}`}>{title}</h2>
      <p className="desc">{description}</p>
      <div className="output" data-testid={`out-${id}`} lang={locale} dir={localeDir(locale)}>
        {children}
      </div>
      <details>
        <summary>Code</summary>
        <pre>
          <code>{code.trim()}</code>
        </pre>
      </details>
    </section>
  );
}

interface PlaygroundControlsProps {
  count: number;
  onCountChange: (count: number) => void;
  gender: Gender;
  onGenderChange: (gender: Gender) => void;
}

export function PlaygroundControls({ count, onCountChange, gender, onGenderChange }: PlaygroundControlsProps) {
  return (
    <div className="controls" dir="ltr" lang="en">
      <label>
        Count
        <input
          data-testid="playground-count"
          type="number"
          min={0}
          value={count}
          onChange={(e) => onCountChange(Math.max(0, Number(e.target.value) || 0))}
        />
      </label>
      <label>
        Gender
        <select
          data-testid="playground-gender"
          value={gender}
          onChange={(e) => onGenderChange(e.target.value as Gender)}
        >
          <option value="female">female</option>
          <option value="male">male</option>
          <option value="other">other</option>
        </select>
      </label>
    </div>
  );
}
