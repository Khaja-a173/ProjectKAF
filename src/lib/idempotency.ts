// src/lib/idempotency.ts
export function generateIdempotencyKey(): string {
  // RFC4122 v4 when available
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback
  const arr = new Uint8Array(16);
  (typeof window !== 'undefined' && window.crypto?.getRandomValues)
    ? window.crypto.getRandomValues(arr)
    : require('crypto').randomFillSync(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2,'0')).join('');
}