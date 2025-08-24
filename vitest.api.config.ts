// vitest.api.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'api',
    reporters: ['dot'],
    hookTimeout: 30_000,
    testTimeout: 30_000,
    include: ['tests/table-session.spec.ts', 'tests/orders.spec.ts'],
    environment: 'node',
    setupFiles: ['tests/loadEnv.ts', 'tests/setupServer.ts'],
    threads: false,        // single worker → avoids multiple server spawns
    isolate: true,         // fresh env per test file (helps table-session)
    clearMocks: true,
  },
});