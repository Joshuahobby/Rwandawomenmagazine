try {
    const appModule = require('../server/app');
    const app = appModule.default || appModule;

    module.exports = app;
} catch (error) {
    console.error("Fatal error during startup:", error);
    throw error;
}
