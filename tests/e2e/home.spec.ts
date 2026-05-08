import { test, expect } from '@playwright/test';

test('homepage has correct title and essential elements', async ({ page }) => {
  // Go to the homepage
  await page.goto('/');

  // Check the title
  await expect(page).toHaveTitle(/Rwanda Women Magazine/);

  // Check for the presence of the main navigation/header
  const header = page.locator('header');
  await expect(header).toBeVisible();

  // Basic check to ensure the page renders content
  const mainContent = page.locator('main');
  await expect(mainContent).toBeVisible();
});
