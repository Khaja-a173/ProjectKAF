// tests/setupServer.ts
import './setupServer';
import { beforeAll, afterAll } from 'vitest';
import { buildServer } from '../server/index.js'; // note `.js` if your tsconfig outputs ESM; use path that matches your project setup

const PORT = Number(process.env.PORT || 3001);
const BASE = `http://127.0.0.1:${PORT}`;

let startedHere = false;
let app: import('fastify').FastifyInstance | null = null;

async function isUp(): Promise<boolean> {
  try {
    const r = await fetch(`${BASE}/healthz`);
    return r.ok;
  } catch {
    return false;
  }
}

async function waitForHealth(timeoutMs = 20_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isUp()) return;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('Server did not become healthy on /healthz');
}

beforeAll(async () => {
  // Reuse if something is already listening (e.g., dev run)
  if (await isUp()) {
    startedHere = false;
    return;
  }

  // Start our own in-process instance (no child process = no EADDRINUSE)
  app = buildServer();
  await app.listen({ port: PORT, host: '127.0.0.1' });
  startedHere = true;
  await waitForHealth();
}, 60_000);

afterAll(async () => {
  // Only close if we started it (don’t kill a dev server)
  if (startedHere && app) {
    await app.close();
    app = null;
  }
}, 20_000);