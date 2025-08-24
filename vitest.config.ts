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
      isolate: true,
      clearMocks: true,
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
      // Force JSDOM URL so localStorage is available
      environmentOptions: {
        jsdom: { url: 'http://localhost' },
      },
      // Add a small shim for localStorage in case any code runs too early
      setupFiles: ['tests/loadEnv.ts', 'tests/ui/setupJSDOM.ts'],
      isolate: true,
      clearMocks: true,
    },
  },
]);