import { defineConfig } from 'vitest/config';

export default defineConfig({
  projects: [
    {
      test: {
        name: 'api',
        include: [
          'tests/table-session.spec.ts',
          'tests/orders.spec.ts'
        ],
        environment: 'node',
        setupFiles: [
          'tests/loadEnv.ts',
          'tests/setupServer.ts'
        ],
        reporters: ['dot'],
        hookTimeout: 30_000,
        testTimeout: 30_000,
        isolate: true,
        clearMocks: true,
      },
    },
    {
      test: {
        name: 'ui',
        include: [
          'tests/ui/**/*.spec.ts',
          'tests/ui/**/*.spec.tsx'
        ],
        environment: 'jsdom',
        setupFiles: ['tests/loadEnv.ts'],
        reporters: ['dot'],
        hookTimeout: 30_000,
        testTimeout: 30_000,
        isolate: true,
        clearMocks: true,
      },
    }
  ]
});
