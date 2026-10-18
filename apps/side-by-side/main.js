// In dev each app runs on its own port; once built, they sit in sibling folders.
const apps = import.meta.env.DEV
  ? { left: "http://localhost:5101/", right: "http://localhost:5102/" }
  : { left: "./react-i18next/", right: "./lingui/" };
const locales = ["en", "pl", "ar", "th"];
const group = document.getElementById("locales");

if (import.meta.env.DEV) {
  document.getElementById("hint").innerHTML = "Both apps must be running (<code>pnpm dev</code>). Locale:";
}

// Each button reloads both iframes with ?locale=…, which each app reads at startup.
function show(locale) {
  for (const [id, url] of Object.entries(apps)) {
    document.getElementById(id).src = `${url}?locale=${locale}`;
  }
  for (const b of group.children) b.setAttribute("aria-pressed", String(b.dataset.locale === locale));
}

for (const locale of locales) {
  const b = document.createElement("button");
  b.textContent = locale;
  b.dataset.locale = locale;
  b.addEventListener("click", () => show(locale));
  group.append(b);
}
show("en");
