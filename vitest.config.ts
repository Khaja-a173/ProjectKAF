import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { 
    reporters: ['dot'], 
    hookTimeout: 30000, 
    testTimeout: 30000 
  },
  projects: [
    {
      name: 'api',
      test: {
        include: ['tests/table-session.spec.ts', 'tests/orders.spec.ts'],
        environment: 'node',
        setupFiles: ['tests/loadEnv.ts', 'tests/setupServer.ts'],
        isolate: true,
        clearMocks: true,
      },
    },
    {
      name: 'ui',
      test: {
        include: ['tests/ui/**/*.spec.ts', 'tests/ui/**/*.spec.tsx'],
        environment: 'jsdom',
        environmentOptions: { jsdom: { url: 'http://localhost' } },
        setupFiles: ['tests/loadEnv.ts', 'tests/ui/setupJSDOM.ts'],
        isolate: true,
        clearMocks: true,
      },
    },
  ],
});