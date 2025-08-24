import { beforeAll, afterAll } from 'vitest';
import { spawn } from 'node:child_process';

let serverProc: ReturnType<typeof spawn> | null = null;

async function waitForHealthz(url = 'http://127.0.0.1:3001/healthz', ms = 10000) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error('Server did not become healthy within timeout.');
}

beforeAll(async () => {
  // Start Fastify via tsx
  serverProc = spawn('node', ['node_modules/tsx/dist/cli.mjs', 'server/index.ts'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: process.env.PORT || '3001' }
  });
  await waitForHealthz();
});

afterAll(async () => {
  if (serverProc) {
    serverProc.kill();
    serverProc = null;
  }
});