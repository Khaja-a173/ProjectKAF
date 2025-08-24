import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: ['dot'],
    hookTimeout: 30000,
    testTimeout: 30000,
  },
  projects: [
    {
      name: 'api', // ← name at top level
      test: {
        include: ['tests/table-session.spec.ts', 'tests/orders.spec.ts'],
        environment: 'node',
        setupFiles: ['tests/loadEnv.ts', 'tests/setupServer.ts'],
      },
    },
    {
      name: 'ui', // ← name at top level
      test: {
        include: ['tests/ui/**/*.spec.ts', 'tests/ui/**/*.spec.tsx'],
        environment: 'jsdom',
        setupFiles: ['tests/loadEnv.ts'],
      },
    },
  ],
});