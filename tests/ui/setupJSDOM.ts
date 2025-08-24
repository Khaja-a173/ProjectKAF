// tests/ui/setupJSDOM.ts
const makeMemoryStorage = () => {
  const s = new Map<string, string>();
  return {
    getItem: k => (s.has(k) ? s.get(k)! : null),
    setItem: (k, v) => s.set(k, String(v)),
    removeItem: k => s.delete(k),
    clear: () => s.clear(),
    key: i => Array.from(s.keys())[i] ?? null,
    get length() { return s.size; },
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