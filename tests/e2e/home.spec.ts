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

  // Articles are rendered as links to /article/<slug> (see pages/Home.tsx) —
  // there is no <article> tag or .article-card class on this page, which is
  // what the original selector guessed at, so it never matched.
  const articleLinks = page.locator('a[href^="/article/"]');
  await expect(articleLinks.first()).toBeVisible({ timeout: 15000 });

  // The homepage is built from several category queries, so a healthy render
  // means many cards, not just one — this would catch the API returning empty.
  expect(await articleLinks.count()).toBeGreaterThan(1);
});
