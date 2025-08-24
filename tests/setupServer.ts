// tests/setupServer.ts
import { beforeAll, afterAll } from 'vitest';
import { buildServer } from '../server/index';

const PORT = Number(process.env.TEST_PORT || 3001);
const HOST = '127.0.0.1';

let app: any | null = null;
let startedHere = false;

async function isPortBusy(): Promise<boolean> {
  try {
    const r = await fetch(`http://${HOST}:${PORT}/healthz`, { method: 'GET' });
    return r.ok;
  } catch {
    return false;
  }
}

async function waitHealthz(timeoutMs = 30_000) {
  const start = Date.now();
  // small delay to allow Fastify to bind the port
  await new Promise(r => setTimeout(r, 100));
  // then poll
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(`http://${HOST}:${PORT}/healthz`);
      if (r.ok) return;
    } catch {}
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error('Server not ready on /healthz');
}

beforeAll(async () => {
  // Force test-mode fallback in routes (prevents 400 -> 409 confusion and avoids RPCs)
  process.env.NODE_ENV = 'test';

  // If something is already listening (dev server or previous run), reuse it
  if (await isPortBusy()) {
    startedHere = false;
    return;
  }

  // Avoid double-start if this setup file is included twice
  // (Vitest can reuse the same module in multiple spec collections)
  // @ts-ignore
  if ((globalThis as any).__apiServerStarted) {
    await waitHealthz();
    return;
  }

  app = buildServer();
  await app.listen({ port: PORT, host: HOST });
  startedHere = true;
  // @ts-ignore
  (globalThis as any).__apiServerStarted = true;
  await waitHealthz();
}, 60_000);

afterAll(async () => {
  // Only close if *we* started it
  if (startedHere && app) {
    await app.close();
    app = null;
    // @ts-ignore
    (globalThis as any).__apiServerStarted = false;
  }
}, 30_000);