// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: ['dot'],
  },
  projects: [
    // ---------- API (server) ----------
    {
      test: {
        name: 'api',
        reporters: ['dot'],
        hookTimeout: 30_000,
        testTimeout: 30_000,
        include: ['tests/table-session.spec.ts', 'tests/orders.spec.ts'],
        environment: 'node',
        setupFiles: ['tests/loadEnv.ts', 'tests/setupServer.ts'],
        isolate: true,
        clearMocks: true,
      },
    },
    // ---------- UI (browser/jsdom) ----------
    {
      test: {
        name: 'ui',
        reporters: ['dot'],
        hookTimeout: 30_000,
        testTimeout: 30_000,
        include: ['tests/ui/**/*.spec.ts', 'tests/ui/**/*.spec.tsx'],
        environment: 'jsdom',
        environmentOptions: {
          jsdom: { url: 'http://localhost' }, // enables localStorage origin
        },
        setupFiles: ['tests/loadEnv.ts', 'tests/ui/setupJSDOM.ts'],
        isolate: true,
        clearMocks: true,
      },
    },
  ],
});