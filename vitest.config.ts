// vitest.config.ts
import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    test: {
      name: 'api',
      reporters: ['dot'],
      hookTimeout: 30_000,
      testTimeout: 30_000,
      include: ['tests/table-session.spec.ts', 'tests/orders.spec.ts'],
      environment: 'node',
      setupFiles: ['tests/loadEnv.ts', 'tests/setupServer.ts'],
    },
  },
  {
    test: {
      name: 'ui',
      reporters: ['dot'],
      hookTimeout: 30_000,
      testTimeout: 30_000,
      include: ['tests/ui/**/*.spec.ts', 'tests/ui/**/*.spec.tsx'],
      environment: 'jsdom',
      setupFiles: ['tests/loadEnv.ts'],
    },
  },
]);