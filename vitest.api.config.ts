import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'api',
    environment: 'node',
    reporters: ['dot'],
    hookTimeout: 30_000,
    testTimeout: 30_000,
    // one server for the whole project:
    globalSetup: ['./tests/globalServer.ts'],
    // important: no per-test setup that also spawns the server
    setupFiles: ['./tests/loadEnv.ts'],
    threads: false,
    isolate: false,
    include: ['tests/orders.spec.ts', 'tests/table-session.spec.ts'],
    clearMocks: true,
  },
});