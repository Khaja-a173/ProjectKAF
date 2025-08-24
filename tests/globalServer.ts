// tests/globalServer.ts
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

let ps: ReturnType<typeof spawn> | null = null;

async function waitHealth(maxMs = 30000) {
  const started = Date.now();
  while (Date.now() - started < maxMs) {
    try {
      const r = await fetch('http://127.0.0.1:3001/healthz');
      if (r.ok) return;
    } catch {}
    await delay(300);
  }
  throw new Error('Server not ready on /healthz');
}

export default async function () {
  // Vitest v3 runs globalSetup once; safeguard if reused
  if (!ps) {
    ps = spawn('npm', ['run', 'server'], { stdio: 'inherit' });
    try {
      await waitHealth();
    } catch (e) {
      // if server didn’t come up, kill process to avoid zombies
      try { ps.kill(); } catch {}
      ps = null;
      throw e;
    }
  }

  // return a teardown function
  return async () => {
    if (ps) {
      try { ps.kill(); } catch {}
      ps = null;
    }
  };
}