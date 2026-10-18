// The single source of truth for what each app must render.
// Both demo apps run the same conformance suite against these strings.
import { currencyOptions, dateOptions, demo, type Gender, type Locale } from "./data";

const num = (locale: Locale, n: number) => new Intl.NumberFormat(locale).format(n);
const money = (locale: Locale) => new Intl.NumberFormat(locale, currencyOptions).format(demo.price);
const date = (locale: Locale) => new Intl.DateTimeFormat(locale, dateOptions).format(demo.orderDate);
const relative = (locale: Locale) =>
  new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(demo.shippedDaysAgo, "day");
const category = (locale: Locale, n: number) => new Intl.PluralRules(locale).select(n);

const FALLBACK = "This sentence has not been translated yet.";

export interface Expected {
  greeting: string;
  cart: (count: number) => string;
  liked: (name: string, gender: Gender) => string;
  rich: string;
  total: string;
  ordered: string;
  shipped: string;
  emailError: string;
  fallback: string;
}

export const expected: Record<Locale, Expected> = {
  en: {
    greeting: `Welcome back, ${demo.userName}!`,
    cart: (n) =>
      n === 0 ? "Your cart is empty" : n === 1 ? "1 item in your cart" : `${num("en", n)} items in your cart`,
    liked: (name) => `${name} liked your review`,
    rich: "Read our terms of service and accept them to continue.",
    total: `Total: ${money("en")}`,
    ordered: `Ordered on ${date("en")}`,
    shipped: `Shipped ${relative("en")}`,
    emailError: "Please enter a valid email address.",
    fallback: FALLBACK,
  },
  pl: {
    greeting: `Witaj ponownie, ${demo.userName}!`,
    cart: (n) => {
      if (n === 0) return "Twój koszyk jest pusty";
      const forms = { one: "produkt", few: "produkty", many: "produktów", other: "produktu" } as const;
      return `${num("pl", n)} ${forms[category("pl", n) as keyof typeof forms]} w koszyku`;
    },
    liked: (name, gender) =>
      `${name} ${{ female: "polubiła", male: "polubił", other: "polubił(a)" }[gender]} twoją recenzję`,
    rich: "Przeczytaj nasz regulamin i zaakceptuj go, aby kontynuować.",
    total: `Razem: ${money("pl")}`,
    ordered: `Zamówiono ${date("pl")}`,
    shipped: `Wysłano ${relative("pl")}`,
    emailError: "Podaj prawidłowy adres e-mail.",
    fallback: FALLBACK,
  },
  ar: {
    greeting: `مرحبًا بعودتك، ${demo.userName}!`,
    cart: (n) => {
      const c = category("ar", n);
      if (c === "zero") return "سلتك فارغة";
      if (c === "one") return "منتج واحد في سلتك";
      if (c === "two") return "منتجان في سلتك";
      const word = { few: "منتجات", many: "منتجًا", other: "منتج" }[c as "few" | "many" | "other"];
      return `${num("ar", n)} ${word} في سلتك`;
    },
    liked: (name, gender) =>
      `${name} ${{ female: "أعجبت", male: "أعجب", other: "أُعجب/ت" }[gender]} بمراجعتك`,
    rich: "اقرأ شروط الخدمة ووافق عليها للمتابعة.",
    total: `الإجمالي: ${money("ar")}`,
    ordered: `تاريخ الطلب: ${date("ar")}`,
    shipped: `تم الشحن ${relative("ar")}`,
    emailError: "يرجى إدخال عنوان بريد إلكتروني صالح.",
    fallback: FALLBACK,
  },
};
