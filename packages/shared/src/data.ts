// Fixed inputs every scenario renders, so both apps produce comparable output.

export const LOCALES = [
  { code: "en", label: "English", dir: "ltr", note: "source locale, 2 plural forms" },
  { code: "pl", label: "Polski", dir: "ltr", note: "4 plural forms (one/few/many/other)" },
  { code: "ar", label: "العربية", dir: "rtl", note: "RTL, 6 plural forms" },
  { code: "th", label: "ไทย", dir: "ltr", note: "no plural forms, Buddhist-calendar dates" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];
export const SOURCE_LOCALE: Locale = "en";

export const isLocale = (value: string): value is Locale =>
  LOCALES.some((l) => l.code === value);

/** `?locale=pl` support, used by the side-by-side viewer to keep both apps in sync. */
export const localeFromUrl = (): Locale | null => {
  const value = new URLSearchParams(window.location.search).get("locale");
  return value && isLocale(value) ? value : null;
};

export const localeDir = (locale: Locale) =>
  LOCALES.find((l) => l.code === locale)?.dir ?? "ltr";

export const demo = {
  userName: "Ada",
  // Chosen to hit every CLDR plural category across en / pl / ar (th has only one).
  cartCounts: [0, 1, 2, 5, 22, 101],
  // One person per gender, so the gender example always pairs a fitting name.
  people: [
    { name: "Ada", gender: "female" },
    { name: "Leo", gender: "male" },
    { name: "Sam", gender: "other" },
  ] as const,
  price: 1234.5,
  currency: "EUR",
  // Noon UTC so the calendar date is the same in every time zone.
  orderDate: new Date(Date.UTC(2026, 2, 14, 12)),
  shippedDaysAgo: -3,
  invalidEmail: "ada@",
} as const;

export type Gender = (typeof demo.people)[number]["gender"];

/** The demo person for a gender (Ada, Leo or Sam). */
export const personFor = (gender: Gender) => demo.people.find((p) => p.gender === gender)!.name;

export const dateOptions: Intl.DateTimeFormatOptions = { dateStyle: "long", timeZone: "UTC" };
export const currencyOptions: Intl.NumberFormatOptions = { style: "currency", currency: demo.currency };

/** Shared, library-free validator used by the "outside React" scenario. */
export const isValidEmail = (value: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
