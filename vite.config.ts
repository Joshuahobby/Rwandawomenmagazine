import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: '/',
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
        '/uploads': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        }
      }
    },

    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      // index.tsx reads this via process.env (import.meta.env trips TS1343
      // under the shared CommonJS tsconfig). Without an explicit define, Vite
      // rewrites bare `process.env` to `{}`, so the DSN silently resolved to
      // undefined and Sentry never initialised in production.
      'process.env.VITE_SENTRY_DSN': JSON.stringify(env.VITE_SENTRY_DSN || '')
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
