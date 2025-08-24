// tests/setupServer.ts
// tests/setupServer.ts
import { beforeAll, afterAll } from 'vitest';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

let ps: ReturnType<typeof spawn> | null = null;
let startedByUs = false;

async function portReady() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch('http://127.0.0.1:3001/healthz');
      if (r.ok) return true;
    } catch {}
    await delay(250);
  }
  return false;
}

function isPortBusy(): Promise<boolean> {
  return new Promise((resolve) => {
    const sock = require('net').createConnection({ host: '127.0.0.1', port: 3001 }, () => {
      sock.end(); resolve(true);
    });
    sock.once('error', () => resolve(false));
  });
}

beforeAll(async () => {
  if (await isPortBusy()) {
    // reuse existing server (dev or previous run)
    return;
  }
  ps = spawn('npm', ['run', 'server'], { stdio: 'inherit' });
  startedByUs = true;

  const ok = await portReady();
  if (!ok) throw new Error('Server not ready on /healthz');
}, 60_000);

afterAll(async () => {
  if (ps && startedByUs) {
    ps.kill();
    ps = null;
    startedByUs = false;
  }
}, 10_000);