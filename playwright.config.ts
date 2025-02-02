import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './',
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },
  reporter: 'html',
});
