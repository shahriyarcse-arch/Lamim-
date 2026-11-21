import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['__tests__/**/*.test.ts'],
    // Pin the local zone so tests that use the runtime zone are deterministic.
    env: { TZ: 'Asia/Dhaka' },
  },
});
