import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    globalSetup: ['test/global-setup.ts'],
    setupFiles: ['test/setup.ts'],
    // Integration tests talk to a remote Neon database.
    testTimeout: 120_000,
    hookTimeout: 300_000,
    fileParallelism: false,
  },
});
