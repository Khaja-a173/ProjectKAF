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
    globalSetup: ['tests/globalServer.ts'],
    setupFiles: ['tests/loadEnv.ts'],
    isolate: true,
    clearMocks: true,
    threads: false, // keep single worker: one server
  },
});