import { defineConfig, devices } from '@playwright/test';

// Must match the Vite dev server port in vite.config.ts (3000). This was
// hardcoded to 5173 (Vite's default), so webServer waited for a port that
// never opened and every run timed out before a single test executed.
//
// Overridable via APP_URL, and used for BOTH the readiness probe and the test
// base URL so the two can't drift — handy when something else already holds
// localhost:3000 and Vite is only reachable on its LAN address.
const BASE_URL = process.env.APP_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './tests/e2e',
  // Run serially. These specs share one dev server that proxies to Express and
  // a remote Neon database; with fullyParallel + unbounded workers, four
  // browsers at once starved it badly enough that even the passing specs timed
  // out (and browser setup itself hit 30s). The whole suite takes ~1.5 min
  // serially, and a gate that flakes gets ignored.
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev:all',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
