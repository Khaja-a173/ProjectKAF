// tests/ui/setupJSDOM.ts
// Make sure jsdom has a URL (set in vitest config), and guarantee localStorage.

const makeMemoryStorage = () => {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => { store.set(k, String(v)); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => { store.clear(); },
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() { return store.size; },
  } as Storage;
};

if (typeof window !== 'undefined' && !('localStorage' in window)) {
  // @ts-ignore
  window.localStorage = makeMemoryStorage();
}
if (typeof global !== 'undefined' && !(global as any).localStorage) {
  // @ts-ignore
  (global as any).localStorage = (global as any).window?.localStorage ?? makeMemoryStorage();
}