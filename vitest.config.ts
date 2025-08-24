import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  // ============================
  // API TESTS CONFIGURATION
  // ============================
  {
    test: {
      name: 'api',                           // <-- Project name for API tests
      include: [
        'tests/table-session.spec.ts',
        'tests/orders.spec.ts'
      ],
      environment: 'node',                   // Node.js environment for backend tests
      setupFiles: [
        'tests/loadEnv.ts',
        'tests/setupServer.ts'
      ],
      reporters: ['dot'],                    // Cleaner console output
      hookTimeout: 30_000,
      testTimeout: 30_000,
      isolate: true,                         // Each test file runs in isolation
      clearMocks: true                       // Ensures clean state between tests
    },
  },

  // ============================
  // UI TESTS CONFIGURATION
  // ============================
  {
    test: {
      name: 'ui',                            // <-- Project name for UI tests
      include: [
        'tests/ui/**/*.spec.ts',
        'tests/ui/**/*.spec.tsx'
      ],
      environment: 'jsdom',                  // Simulate browser environment
      setupFiles: ['tests/loadEnv.ts'],      // Ensures .env is loaded for UI
      reporters: ['dot'],
      hookTimeout: 30_000,
      testTimeout: 30_000,
      isolate: true,
      clearMocks: true
    },
  }
]);