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
    if (error.stack) {
        error.stack.split('\n').forEach((line: string) => console.error('STACK:', line));
    } else {
        console.error("No stack trace available");
    }
    throw error;
}
