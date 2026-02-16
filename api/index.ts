console.log(`[${new Date().toISOString()}] API Entry: Starting up...`);
try {
    console.log(`[${new Date().toISOString()}] API Entry: Attempting require('../server/app')...`);
    const appModule = require('../server/app');
    console.log(`[${new Date().toISOString()}] API Entry: require('../server/app') returned keys: ${Object.keys(appModule).join(', ')}`);
    const app = appModule.default || appModule;
    console.log(`[${new Date().toISOString()}] API Entry: App object resolved`);

    module.exports = app;
    console.log(`[${new Date().toISOString()}] API Entry: module.exports set`);
} catch (error) {
    console.error(`[${new Date().toISOString()}] API Entry: FATAL ERROR DURING STARTUP`);
    console.error("Error Message:", error.message);
    console.error("Error Stack:", error.stack);
    throw error;
}
