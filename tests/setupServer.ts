// tests/setupServer.ts
import { beforeAll, afterAll } from 'vitest';
import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import { request } from 'undici';

let child: ReturnType<typeof spawn> | null = null;

async function waitForHealthz() {
  for (let i = 0; i < 20; i++) {
    try {
      const res = await request('http://127.0.0.1:3001/healthz', { method: 'GET' });
      if (res.statusCode === 200) return;
    } catch { /* not ready yet */ }
    await wait(500);
  }
  throw new Error('Server not ready on :3001');
}

beforeAll(async () => {
  // prevent double start if already running in watch mode
  if (child) return;
  child = spawn('npm', ['run', 'server'], { stdio: 'inherit', env: process.env });
  await waitForHealthz();
});

afterAll(async () => {
  if (child && !child.killed) {
    child.kill();
    child = null;
  }
});