import { defineConfig, configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./tests/setup.ts'],
        // The default 5s is too tight here: the API tests hit a remote Neon
        // instance, and jsdom environment setup alone can take ~10s when files
        // run in parallel. A gate that flakes gets ignored, so set the headroom
        // globally rather than per test.
        testTimeout: 30000,
        hookTimeout: 30000,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: ['node_modules/', 'tests/setup.ts'],
        },
        include: ['**/*.{test,spec}.{ts,tsx}'],
        // tests/e2e holds Playwright specs (`npm run test:e2e`). They import
        // @playwright/test, which cannot run under Vitest — left in, they crash
        // the worker and the whole suite reports "no tests".
        exclude: [...configDefaults.exclude, 'tests/e2e/**'],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
        },
    },
});
