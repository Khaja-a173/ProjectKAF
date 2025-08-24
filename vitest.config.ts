import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',              // use Node runtime (has global fetch in Node 20)
    include: ['tests/**/*.spec.ts', 'tests/ui/**/*.spec.tsx'],
    environmentMatchGlobs: [
      ['tests/ui/**', 'jsdom']
    ],
    setupFiles: ['tests/setupServer.ts'],
    reporters: ['dot'],
    hookTimeout: 30000,
    testTimeout: 30000
  }
});