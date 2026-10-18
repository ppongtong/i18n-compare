// Library-agnostic chrome. Page chrome stays in English on purpose: only the
// scenario outputs are translated, so the two apps are easy to compare.
import { createContext, useContext, useEffect, type ReactNode } from "react";
import { activity, useActivity, type ActivityKind } from "./activity";
import { LOCALES, localeDir, type Gender, type Locale } from "./data";
import { SCENARIOS, type HowTo, type ScenarioId } from "./scenarios";

const ShellContext = createContext<{ locale: Locale; library: string }>({ locale: "en", library: "" });

interface ShellProps {
  library: string;
  accent: "teal" | "violet";
  tagline: string;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  /** True while a locale catalog is being fetched. */
  loading: boolean;
  /** Library-specific steps shown in the "what happens" panel. */
  howItWorks: ReactNode;
  /** The active locale's catalog exactly as the library holds it in memory. */
  catalog: CatalogView;
  children: ReactNode;
}

export interface CatalogView {
  /** Pretty-printed catalog contents. "// …" comments are dimmed. */
  code: string;
  /** How many messages it contains. */
  count: number;
  /** Bullet points explaining what you are looking at. */
  notes: ReactNode;
}

export function Shell({
  library,
  accent,
  tagline,
  locale,
  onLocaleChange,
  loading,
  howItWorks,
  catalog,
  children,
}: ShellProps) {
  useEffect(() => {
    document.title = `${library} demo`;
  }, [library]);

  return (
    <ShellContext.Provider value={{ locale, library }}>
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
        <ActivityPanel howItWorks={howItWorks} catalog={catalog} locale={locale} />
        <main className="scenarios">{children}</main>
      </div>
    </ShellContext.Provider>
  );
}

interface ScenarioProps {
  id: ScenarioId;
  howTo: HowTo;
  /** The live, translated output. Omitted for cards that only explain (setup). */
  children?: ReactNode;
}

export function Scenario({ id, howTo, children }: ScenarioProps) {
  const { locale, library } = useContext(ShellContext);
  const { title, description } = SCENARIOS[id];
  return (
    <section className="scenario" aria-labelledby={`h-${id}`}>
      <h2 id={`h-${id}`}>{title}</h2>
      <p className="desc">{description}</p>
      {children !== undefined && (
        <div className="output" data-testid={`out-${id}`} lang={locale} dir={localeDir(locale)}>
          {children}
        </div>
      )}
      <details className="howto">
        <summary>How it's done with {library}</summary>
        <p className="howto-summary">{howTo.summary}</p>
        <ol className="steps">
          {howTo.steps.map((step) => (
            <li key={step.title}>
              <div className="step-title">
                {step.title}
                {step.file && <code className="file">{step.file}</code>}
              </div>
              <CodeBlock code={step.code} />
              {step.note && <p className="note">{step.note}</p>}
            </li>
          ))}
        </ol>
      </details>
    </section>
  );
}

// Dims comments ("// …" or "# …") so the code itself stands out. No other highlighting.
function CodeBlock({ code }: { code: string }) {
  const lines = code.trim().split("\n");
  return (
    <pre>
      <code>
        {lines.map((line, i) => {
          const m = line.match(/^(.*?)((?:^|\s)(?:\/\/|# ).*)$/);
          return (
            <span key={i}>
              {m ? (
                <>
                  {m[1]}
                  <span className="comment">{m[2]}</span>
                </>
              ) : (
                line
              )}
              {i < lines.length - 1 && "\n"}
            </span>
          );
        })}
      </code>
    </pre>
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

const KIND_LABEL: Record<ActivityKind, string> = {
  bundled: "bundled",
  fetch: "load",
  request: "network",
  cached: "memory",
  activated: "render",
};

function ActivityPanel({ howItWorks, catalog, locale }: { howItWorks: ReactNode; catalog: CatalogView; locale: Locale }) {
  const groups = useActivity();
  return (
    <section className="activity" aria-labelledby="h-activity">
      <h2 id="h-activity">What happens when you change the language</h2>
      <div className="activity-grid">
        <div className="how">
          <ol>{howItWorks}</ol>
          <p className="desc">
            The <strong>Locale</strong> dropdown above switches in place with no page reload. The en / pl / ar buttons on
            the side-by-side page reload the whole app with <code>?locale=</code>, which shows up here as a{" "}
            <em>page load</em> entry.
          </p>
        </div>
        <div className="log">
          <div className="log-head">
            <span>Live log (newest first)</span>
            <button type="button" onClick={activity.clear}>
              Clear
            </button>
          </div>
          <ol className="log-groups" data-testid="activity-log">
            {groups.map((g) => (
              <li key={g.id} data-testid="activity-group">
                <div className="log-title">
                  <code>{g.title}</code> <span>· {g.source} · +{g.at} ms</span>
                </div>
                <ul>
                  {g.lines.map((line, i) => (
                    <li key={i} data-kind={line.kind}>
                      <span className={`tag tag-${line.kind}`}>{KIND_LABEL[line.kind]}</span> {line.text}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <details className="catalog" open>
        <summary>
          What's inside the <code>{locale}</code> catalog ({catalog.count} messages)
        </summary>
        <p className="desc">
          {locale === "en"
            ? "English is bundled inside the main JS file rather than downloaded separately, but this is what it contains."
            : `This is what the ${locale} file that was downloaded contains, as the library now holds it in memory.`}{" "}
          Switch language to compare, and open the other app to see the difference.
        </p>
        <ul className="catalog-notes">{catalog.notes}</ul>
        <div data-testid="catalog-view">
          <CodeBlock code={catalog.code} />
        </div>
      </details>
    </section>
  );
}
