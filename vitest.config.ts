import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: ['dot'],
    hookTimeout: 30000,
    testTimeout: 30000,
  },
  projects: [
    {
      test: {
        name: 'api',
        include: ['tests/table-session.spec.ts', 'tests/orders.spec.ts'],
        environment: 'node',
        setupFiles: ['tests/setupServer.ts']
      }
    },
    {
      test: {
        name: 'ui',
        include: ['tests/ui/**/*.spec.ts', 'tests/ui/**/*.spec.tsx'],
        environment: 'jsdom'
      }
    }
  ]
});