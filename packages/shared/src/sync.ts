// Keeps both apps on the same card in the side-by-side page. An app posts a
// message to the parent page, which relays it to the other app's iframe.
// Messages carry only a card name and a position, nothing sensitive.
import type { Locale } from "./data";

const SYNC_MESSAGE = "i18n-compare:show-card";
const LOCALE_MESSAGE = "i18n-compare:locale-change";

interface SyncMessage {
  type: typeof SYNC_MESSAGE;
  /** Card name: a scenario id or "activity". */
  card: string;
  /** Distance from the top of the viewport to the card, so the other app can match it. */
  offset: number;
  /** Whether the card's expandable section (code walkthrough / catalog) is open. */
  open: boolean;
}

/** True when the app runs inside the side-by-side page rather than on its own. */
export const isEmbedded = () => typeof window !== "undefined" && window.parent !== window;

export const cardDomId = (card: string) => `card-${card}`;

const findCard = (card: string) => (/^[a-z]+$/.test(card) ? document.getElementById(cardDomId(card)) : null);
const cardDetails = (el: HTMLElement) => el.querySelector<HTMLDetailsElement>(":scope > details");

function getParentOrigin(): string {
  if (typeof location !== "undefined" && "ancestorOrigins" in location && location.ancestorOrigins?.length) {
    const origin = location.ancestorOrigins[0];
    if (origin && origin !== "null") return origin;
  }
  if (typeof document !== "undefined" && document.referrer) {
    try {
      const origin = new URL(document.referrer).origin;
      if (origin && origin !== "null") return origin;
    } catch {
      // Fall back to wildcard if referrer is unparseable
    }
  }
  return "*";
}

/** Notifies the side-by-side parent toolbar that the active locale changed. */
export function notifyParentLocaleChange(locale: Locale) {
  if (!isEmbedded()) return;
  window.parent.postMessage({ type: LOCALE_MESSAGE, locale }, getParentOrigin());
}

/** Asks the other app to show `card` at the same height as it is shown here. */
export function showInOtherApp(card: string) {
  const el = findCard(card);
  if (!el) return;
  const message: SyncMessage = {
    type: SYNC_MESSAGE,
    card,
    offset: el.getBoundingClientRect().top,
    open: cardDetails(el)?.open ?? false,
  };
  window.parent.postMessage(message, getParentOrigin());
}

/** Scrolls to a card when the parent page relays a request from the other app. Returns a cleanup function. */
export function listenForShowCard() {
  const onMessage = (event: MessageEvent) => {
    if (event.source !== window.parent) return;
    const expectedOrigin = getParentOrigin();
    if (expectedOrigin !== "*" && event.origin !== expectedOrigin) return;
    const data = event.data as Partial<SyncMessage> | null;
    if (data?.type !== SYNC_MESSAGE || typeof data.card !== "string" || typeof data.offset !== "number") return;
    const el = findCard(data.card);
    if (!el) return;

    const details = cardDetails(el);
    if (details && typeof data.open === "boolean") details.open = data.open;

    const top = el.getBoundingClientRect().top + window.scrollY - data.offset;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    // Some browsers skip smooth scrolling in a frame the user isn't interacting
    // with. If it hasn't arrived shortly after, jump there instead.
    setTimeout(() => {
      const target = Math.min(top, document.documentElement.scrollHeight - window.innerHeight);
      if (Math.abs(window.scrollY - Math.max(0, target)) > 2) window.scrollTo({ top, behavior: "auto" });
    }, 700);

    // Restart the highlight animation even if it is still running.
    el.classList.remove("flash");
    void el.offsetWidth;
    el.classList.add("flash");
  };
  window.addEventListener("message", onMessage);
  return () => window.removeEventListener("message", onMessage);
}
