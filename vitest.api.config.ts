// vitest.api.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'api',
    environment: 'node',
    threads: false,                 // single process => no multi-start
    isolate: false,                 // keep globals across files
    hookTimeout: 60_000,
    testTimeout: 60_000,
    include: ['tests/orders.spec.ts', 'tests/table-session.spec.ts'],
    setupFiles: ['tests/loadEnv.ts', 'tests/setupServer.ts'], // start server globally
    reporters: ['dot'],
    clearMocks: true,
  },
});