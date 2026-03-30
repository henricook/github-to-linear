import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.mjs',
  timeout: 30_000,
  retries: 1,
  workers: 1,
  use: {
    headless: false,
  },
});
