// vitest.api.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'api',
    reporters: ['dot'],
    hookTimeout: 30_000,
    testTimeout: 30_000,
    include: ['tests/orders.spec.ts', 'tests/table-session.spec.ts'],
    environment: 'node',
    // ⬇️ move server startup to globalSetup (runs once per test run)
    globalSetup: ['tests/globalServer.ts'],
    // remove any server start files from setupFiles to avoid double start
    setupFiles: ['tests/loadEnv.ts'],
    isolate: true,
    clearMocks: true,
    // keep single worker to be extra-safe with a spawned server
    threads: false,
  },
});