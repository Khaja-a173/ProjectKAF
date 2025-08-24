// tests/ui/setupJSDOM.ts
// Ensures localStorage exists even if a module touches it very early.
// In normal Vitest jsdom this is already present, but this keeps things robust.

const makeMemoryStorage = () => {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => { store.set(k, String(v)); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => { store.clear(); },
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() { return store.size; },
  };
};

if (typeof window !== 'undefined') {
  // @ts-ignore
  if (!window.localStorage) window.localStorage = makeMemoryStorage();
}
// @ts-ignore
if (typeof global !== 'undefined' && !global.localStorage) global.localStorage = (global as any).window?.localStorage ?? makeMemoryStorage();