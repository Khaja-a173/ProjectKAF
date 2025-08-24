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
    // IMPORTANT: start server once for the whole project
    globalSetup: ['tests/globalServer.ts'],
    // DO NOT also start server from setupFiles
    setupFiles: ['tests/loadEnv.ts'],
    threads: false,         // avoid spawning multiple workers that would re-start server
    isolate: false,         // keep global server alive across tests
    clearMocks: true,
  },
});