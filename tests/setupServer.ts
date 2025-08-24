// tests/setupServer.ts
import { beforeAll, afterAll } from 'vitest';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

let ps: ReturnType<typeof spawn> | null = null;

async function waitHealth() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch('http://127.0.0.1:3001/healthz');
      if (r.ok) return;
    } catch {}
    await delay(250);
  }
  throw new Error('Server not ready on /healthz');
}

beforeAll(async () => {
  if (!ps) {
    ps = spawn('npm', ['run', 'server'], { stdio: 'inherit' });
    await waitHealth();
  }
}, 60_000);

afterAll(async () => {
  if (ps) {
    ps.kill();
    ps = null;
  }
}, 10_000);