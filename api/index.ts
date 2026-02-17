// Vercel Serverless Entry Point
// ─────────────────────────────
// Uses CommonJS require() intentionally: Vercel serverless functions expect
// a CJS module.exports for the API handler. Do NOT convert to ESM import.

try {
    const appModule = require('../server/app');
    const app = appModule.default || appModule;

    module.exports = app;
} catch (error) {
    console.error("Fatal error during startup:", error);
    throw error;
}
