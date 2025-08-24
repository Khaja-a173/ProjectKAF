// vitest.config.ts
import { defineConfig, defineProject } from 'vitest/config';

export default defineConfig({
  projects: [
    defineProject({
      name: 'api',                      // <-- name is TOP-LEVEL
      test: {
        reporters: ['dot'],
        hookTimeout: 30_000,
        testTimeout: 30_000,
        include: ['tests/table-session.spec.ts', 'tests/orders.spec.ts'],
        environment: 'node',
        setupFiles: ['tests/loadEnv.ts', 'tests/setupServer.ts'],
        isolate: true,
        clearMocks: true,
      },
    }),
    defineProject({
      name: 'ui',                       // <-- name is TOP-LEVEL
      test: {
        reporters: ['dot'],
        hookTimeout: 30_000,
        testTimeout: 30_000,
        include: ['tests/ui/**/*.spec.ts', 'tests/ui/**/*.spec.tsx'],
        environment: 'jsdom',
        environmentOptions: { jsdom: { url: 'http://localhost' } },
        setupFiles: ['tests/loadEnv.ts', 'tests/ui/setupJSDOM.ts'],
        isolate: true,
        clearMocks: true,
      },
    }),
  ],
});