// vitest.api.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'api',
    environment: 'node',
    include: ['tests/orders.spec.ts', 'tests/table-session.spec.ts'],
    setupFiles: ['tests/loadEnv.ts', 'tests/setupServer.ts'],
    reporters: ['dot'],
    hookTimeout: 60_000,
    testTimeout: 60_000,
    // Keep it single-process so Fastify shares one port
    threads: false,
    isolate: false,
    clearMocks: true,
  },
});