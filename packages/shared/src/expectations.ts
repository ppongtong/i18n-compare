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
  updated: (name: string, gender: Gender) => string;
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
    updated: (name, gender) => `${name} updated ${{ female: "her", male: "his", other: "their" }[gender]} profile`,
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
    updated: (name, gender) =>
      `${name} ${{ female: "zaktualizowała", male: "zaktualizował", other: "zaktualizował(a)" }[gender]} swój profil`,
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
    updated: (name, gender) =>
      `${name} ${{ female: "حدّثت ملفها", male: "حدّث ملفه", other: "حدّث/ت ملفه/ا" }[gender]} الشخصي`,
    rich: "اقرأ شروط الخدمة ووافق عليها للمتابعة.",
    total: `الإجمالي: ${money("ar")}`,
    ordered: `تاريخ الطلب: ${date("ar")}`,
    shipped: `تم الشحن ${relative("ar")}`,
    emailError: "يرجى إدخال عنوان بريد إلكتروني صالح.",
    fallback: FALLBACK,
  },
  th: {
    greeting: `ยินดีต้อนรับกลับมา ${demo.userName}!`,
    // Thai has a single plural form; only the zero case gets its own sentence.
    cart: (n) => (n === 0 ? "ตะกร้าของคุณว่างเปล่า" : `มีสินค้า ${num("th", n)} ชิ้นในตะกร้า`),
    // Natural Thai says "their own profile" for everyone, so one sentence fits every gender.
    updated: (name) => `${name} อัปเดตโปรไฟล์ของตัวเอง`,
    rich: "อ่านข้อกำหนดการให้บริการของเรา แล้วยอมรับเพื่อดำเนินการต่อ",
    total: `ยอดรวม: ${money("th")}`,
    // Intl uses the Buddhist calendar for "th": 2026 → 2569.
    ordered: `สั่งซื้อเมื่อ ${date("th")}`,
    shipped: `จัดส่งแล้วเมื่อ ${relative("th")}`,
    emailError: "กรุณากรอกอีเมลให้ถูกต้อง",
    fallback: FALLBACK,
  },
};
