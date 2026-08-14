import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/tests/setup.js'],
    globalSetup: ['./src/tests/globalSetup.js'],
    fileParallelism: false,
  },
});
