import { test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Go to the password gate
  await page.goto('/');
  
  // Enter the site password
  await page.fill('input[type="password"]', 'eyebridges2025');
  await page.click('button[type="submit"]');
  
  // Wait for successful authentication
  await page.waitForURL('/');
  
  // Save authenticated state
  await page.context().storageState({ path: authFile });
});
