// Minimal in-memory localStorage for jsdom
const makeStorage = () => {
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

// attach to both window and global
if (typeof window !== 'undefined' && !(window as any).localStorage) {
  (window as any).localStorage = makeStorage();
}
if (!(globalThis as any).localStorage) {
  (globalThis as any).localStorage = (globalThis as any).window?.localStorage ?? makeStorage();
}