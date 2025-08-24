// tests/setupServer.ts
import { beforeAll, afterAll } from 'vitest';
import { spawn } from 'node:child_process';
import http from 'node:http';

let proc: any;

function waitForReady(url: string, timeoutMs = 10_000) {
  const started = Date.now();
  return new Promise<void>((resolve, reject) => {
    const tryOnce = () => {
      const req = http.get(url, res => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (Date.now() - started > timeoutMs) return reject(new Error('server did not start'));
        setTimeout(tryOnce, 250);
      });
    };
    tryOnce();
  });
}

beforeAll(async () => {
  // start once per test project
  proc = spawn('npm', ['run', 'server'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: process.env.PORT || '3001' },
  });
  const base = `http://127.0.0.1:${process.env.PORT || '3001'}`;
  (globalThis as any).__API_BASE__ = base;
  await waitForReady(`${base}/healthz`, 15_000);
});

afterAll(async () => {
  if (proc && !proc.killed) {
    proc.kill('SIGINT');
  }
});