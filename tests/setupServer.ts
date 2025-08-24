// tests/setupServer.ts
import { beforeAll, afterAll } from 'vitest';
import { buildServer } from '../server/index';
import { setTimeout as delay } from 'node:timers/promises';

const PORT = Number(process.env.PORT || 3001);
const HOST = '127.0.0.1';

let app: ReturnType<typeof buildServer> | null = null;

async function waitHealth(retries = 60) {
  for (let i = 0; i < retries; i++) {
    try {
      const r = await fetch(`http://${HOST}:${PORT}/healthz`);
      if (r.ok) return;
    } catch {}
    await delay(250);
  }
  throw new Error('Server /healthz not ready');
}

beforeAll(async () => {
  // Start one in-process instance (no child process → no EADDRINUSE)
  app = buildServer();
  await app.listen({ port: PORT, host: HOST });
  await waitHealth();
}, 60_000);

afterAll(async () => {
  if (app) {
    await app.close();
    app = null;
  }
}, 30_000);