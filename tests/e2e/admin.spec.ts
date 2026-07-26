import { test, expect } from '@playwright/test';

/**
 * The logged-in specs below need an admin account that actually exists in the
 * database the dev server is pointed at.
 *
 * The defaults are the seeded dev credentials (see prisma/seed.ts), so these
 * pass against a freshly seeded local or staging database. They will NOT pass
 * when DATABASE_URL points at production, where those seeded credentials
 * rightly do not exist — the login returns 401 and the redirect never happens.
 *
 * To run them elsewhere, supply real credentials via the environment rather
 * than hardcoding any here:
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run test:e2e
 */
test.describe('Admin Authentication & Dashboard', () => {
  test('should login successfully as admin and view dashboard', async ({ page }) => {
    // 1. Navigate to Login Page
    await page.goto('/login');
    await expect(page).toHaveTitle(/Rwanda Women Magazine/);
    await expect(page.locator('text=Magazine CMS Login')).toBeVisible();

    // 2. Perform Login
    await page.fill('#email', process.env.ADMIN_EMAIL || 'admin@rwandawomenmagazine.rw');
    await page.fill('#password', process.env.ADMIN_PASSWORD || 'password123');
    await page.click('button[type="submit"]');

    // 3. Verify Dashboard Navigation
    // The app should redirect to /dashboard
    await page.waitForURL('**/dashboard');
    
    // Check for essential dashboard elements
    // Dashboard.tsx uses "Welcome back, {FirstName}!"
    await expect(page.locator('text=Welcome back, Admin!')).toBeVisible();
    await expect(page.locator('text=Total Published')).toBeVisible();
    await expect(page.locator('text=Recent Activity')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'wrong@example.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Verify error message
    // Based on Login.tsx, error is displayed in a div with text
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
  });
});

test.describe('Article Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test in this block
    await page.goto('/login');
    await page.fill('#email', process.env.ADMIN_EMAIL || 'admin@rwandawomenmagazine.rw');
    await page.fill('#password', process.env.ADMIN_PASSWORD || 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('should navigate to editor and see article list', async ({ page }) => {
    // Navigate to articles list (assuming there's a link or just go to /dashboard)
    await expect(page.locator('text=Recent Articles')).toBeVisible();
    
    // Find "Create New" or similar button if it exists
    // Looking at Dashboard.tsx or Editor.tsx
  });
});
