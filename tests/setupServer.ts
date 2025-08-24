import { beforeAll, afterAll } from 'vitest';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const PORT = Number(process.env.PORT || 3001);
const BASE = `http://127.0.0.1:${PORT}`;

let ps: ReturnType<typeof spawn> | null = null;

async function isUp() {
  try {
    const r = await fetch(`${BASE}/healthz`);
    return r.ok;
  } catch {
    return false;
  }
}

beforeAll(async () => {
  if (await isUp()) {
    // Reuse existing server (dev or previously started by another worker)
    return;
  }
  // Start a single instance for this test process
  ps = spawn('npm', ['run', 'server'], { stdio: 'inherit' });

  // Wait up to ~20s
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    if (await isUp()) return;
    await delay(250);
  }
  throw new Error('Server did not become healthy on /healthz');
}, 60_000);

afterAll(async () => {
  // Only kill if we started it
  if (ps) {
    ps.kill();
    ps = null;
  }
}, 10_000);