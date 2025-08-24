import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.spec.ts'],
    reporters: 'dot',
    hookTimeout: 30000,
    testTimeout: 60000
  }
});