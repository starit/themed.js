import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  root: resolve(__dirname, 'packages/core'),
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/types/**', 'src/themes/index.ts'],
    },
  },
});
