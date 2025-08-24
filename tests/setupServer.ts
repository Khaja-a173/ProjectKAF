import { beforeAll, afterAll } from 'vitest';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

let ps: ReturnType<typeof spawn> | null = null;

async function waitHealth() {
  const url = 'http://127.0.0.1:3001/healthz';
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await delay(250);
  }
  throw new Error('Server not ready on /healthz');
}

export async function setup() {
  if (ps) return;
  ps = spawn('npm', ['run', 'server'], { stdio: 'inherit' });
  await waitHealth();
}

export async function teardown() {
  if (ps) {
    ps.kill();
    ps = null;
  }
}

// Vitest auto-hooks
beforeAll(async () => { await setup(); }, 60_000);
afterAll(async () => { await teardown(); }, 10_000);