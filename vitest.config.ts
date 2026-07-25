import { defineConfig, configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./tests/setup.ts'],
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
