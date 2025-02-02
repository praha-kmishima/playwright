import { test, expect } from '@playwright/test';

test('Google検索テスト', async ({ page }) => {
  await page.goto('https://www.google.com');
  await page.fill('input[name="q"]', 'Playwright');
  await page.press('input[name="q"]', 'Enter');
  await expect(page).toHaveTitle(/Playwright/);
});
