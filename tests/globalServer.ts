// tests/globalServer.ts
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

let ps: ReturnType<typeof spawn> | null = null;
let weSpawned = false;

async function isUp() {
  try {
    const r = await fetch('http://127.0.0.1:3001/healthz');
    return r.ok;
  } catch {
    return false;
  }
}

async function waitHealth(maxMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    if (await isUp()) return;
    await delay(300);
  }
  throw new Error('Server not ready on /healthz');
}

export default async function () {
  // If something is already listening, reuse it (don’t spawn again).
  if (await isUp()) {
    weSpawned = false;
  } else {
    ps = spawn('npm', ['run', 'server'], { stdio: 'inherit' });
    weSpawned = true;
    try {
      await waitHealth();
    } catch (e) {
      try { ps?.kill(); } catch {}
      ps = null;
      weSpawned = false;
      throw e;
    }
  }

  // Teardown only what we spawned
  return async () => {
    if (weSpawned && ps) {
      try { ps.kill(); } catch {}
      ps = null;
    }
  };
}