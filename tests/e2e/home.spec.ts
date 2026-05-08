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

  // Check for articles (assuming they have a class or tag like 'article' or inside a grid)
  // Based on common patterns, let's wait for the API data to render
  const articleCards = page.locator('article, .article-card, [data-testid="article-card"]');
  // Wait up to 10 seconds for articles to appear
  await expect(articleCards.first()).toBeVisible({ timeout: 10000 });
});
