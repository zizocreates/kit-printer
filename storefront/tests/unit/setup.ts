// jsdom lacks a few browser APIs the UI touches. Minimal stand-ins, test-only.
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Node 26 defines a global `localStorage` that is undefined unless --localstorage-file is passed. Because the
// global already exists, Vitest's jsdom environment does not put jsdom's own one there, so bare `localStorage` is
// undefined while `window.localStorage` works. Point the global at jsdom's, for the app code as well as for us.
// It is an accessor that wins over jsdom's on the shared global (sessionStorage is still jsdom's), so there is
// nothing to borrow: define a small in-memory Storage over it. Test-only, like the rest of this file.
if (!globalThis.localStorage) {
  const store = new Map<string, string>();
  const shim: Storage = {
    get length() { return store.size; },
    clear: () => store.clear(),
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    key: (i: number) => [...store.keys()][i] ?? null,
    removeItem: (k: string) => { store.delete(k); },
    setItem: (k: string, v: string) => { store.set(String(k), String(v)); },
  };
  Object.defineProperty(globalThis, "localStorage", { value: shim, configurable: true, writable: true });
}

afterEach(() => { cleanup(); localStorage.clear(); });
window.matchMedia ??= ((q: string) => ({ matches: false, media: q, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false })) as typeof window.matchMedia;
window.scrollTo = (() => {}) as typeof window.scrollTo;
