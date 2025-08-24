// tests/ui/setupJSDOM.ts
const memoryStorage = () => {
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
  window.localStorage = memoryStorage();
}
if (typeof globalThis !== 'undefined' && !(globalThis as any).localStorage) {
  // @ts-ignore
  (globalThis as any).localStorage = (globalThis as any).window?.localStorage ?? memoryStorage();
}