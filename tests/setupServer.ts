import { beforeAll, afterAll } from 'vitest';

const PORT = Number(process.env.PORT || 3001);
let child: import('child_process').ChildProcess | null = null;

async function waitForHealthz(url: string, tries = 30) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error(`Server did not become healthy at ${url}`);
}

beforeAll(async () => {
  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/healthz`);
    if (res.ok) return;
  } catch {}

  const { spawn } = await import('child_process');
  child = spawn('npm', ['run', 'server'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT: String(PORT) },
  });
  child.stdout?.on('data', d => process.stdout.write(`[server] ${d}`));
  child.stderr?.on('data', d => process.stderr.write(`[server-err] ${d}`));

  await waitForHealthz(`http://127.0.0.1:${PORT}/healthz`);
});

afterAll(async () => {
  if (child && !child.killed) child.kill();
});