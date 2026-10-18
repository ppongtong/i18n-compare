// A tiny store that records what happens on each locale change, so the UI can
// show it. Each app logs into it from its own loading code.
import { useSyncExternalStore } from "react";

export type ActivityKind = "bundled" | "fetch" | "request" | "cached" | "activated";

export interface ActivityLine {
  kind: ActivityKind;
  text: string;
}

export interface ActivityGroup {
  id: number;
  title: string;
  /** What triggered it, e.g. "dropdown" or "page load (?locale=pl)". */
  source: string;
  /** ms since page load */
  at: number;
  lines: ActivityLine[];
}

let groups: ActivityGroup[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

// The default 250-entry buffer can fill up in dev mode, where every module is a request.
if (typeof performance !== "undefined" && typeof performance.setResourceTimingBufferSize === "function") {
  performance.setResourceTimingBufferSize(2000);
}

export const activity = {
  /** Starts a new group (newest first) and returns a function that appends lines to it. */
  begin(title: string, source: string) {
    const id = nextId++;
    groups = [{ id, title, source, at: Math.round(performance.now()), lines: [] }, ...groups].slice(0, 20);
    emit();
    return (kind: ActivityKind, text: string) => {
      groups = groups.map((g) => (g.id === id ? { ...g, lines: [...g.lines, { kind, text }] } : g));
      emit();
    };
  },
  clear() {
    groups = [];
    emit();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => groups,
};

export const useActivity = () => useSyncExternalStore(activity.subscribe, activity.getSnapshot);

const resourceEntries = () =>
  typeof performance.getEntriesByType === "function"
    ? (performance.getEntriesByType("resource") as PerformanceResourceTiming[])
    : [];

/** Runs `load` and logs every network request the browser made while it ran. */
export async function trackRequests<T>(load: () => Promise<T>, add: (kind: ActivityKind, text: string) => void) {
  const before = resourceEntries().length;
  const started = performance.now();
  const result = await load();
  const requests = resourceEntries().slice(before);
  for (const r of requests) {
    const url = new URL(r.name);
    const size = r.transferSize === 0 && r.decodedBodySize > 0 ? "from browser cache" : `${(r.transferSize / 1024).toFixed(1)} kB`;
    add("request", `GET ${url.pathname}${url.search} · ${size} · ${Math.round(r.duration)} ms`);
  }
  if (requests.length === 0) add("request", `loaded in ${Math.round(performance.now() - started)} ms`);
  return result;
}
